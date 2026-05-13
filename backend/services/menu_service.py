"""
NutriFit — Motor de generación de menús semanales
Algoritmo de selección basado en reglas con filtrado por intolerancias.
"""

import random
from typing import List, Dict, Optional
from sqlalchemy.orm import Session

from models.models import Alimento, Usuario

# ── CATEGORÍAS POR TIPO DE COMIDA ─────────────────────────
CATEGORIAS_COMIDA = {
    "desayuno": {
        "proteina": ["huevo", "lacteo", "embutido"],
        "carbo":    ["cereal_desayuno"],
        "fruta":    ["fruta"],
        "grasa":    ["frutos secos", "semillas"],
    },
    "comida": {
        "proteina": ["carne", "pescado", "marisco", "legumbre"],
        "carbo":    ["cereal_comida", "legumbre"],
        "verdura":  ["verdura"],
        "grasa":    ["grasa"],
    },
    "cena": {
        "proteina": ["pescado", "carne", "huevo", "legumbre"],
        "carbo":    ["cereal_comida"],
        "verdura":  ["verdura"],
        "grasa":    ["grasa", "grasa vegetal"],
    },
}

# ── ALIMENTOS EXCLUIDOS DE PLANES NUTRICIONALES ───────────
EXCLUIDOS = [
    "Patata frita en aceite",
    "Nachos de maiz",
    "Chocolate con leche",
    "Salchichon",
    "Chorizo",
    "Mortadela",
    "Margarina vegetal",
    "Ajo",           # condimento, no alimento principal
    "Cebolleta",     # condimento, no alimento principal
    "Rabano",        # muy poco valor nutricional como principal
]

# ── FRUTAS APTAS PARA DESAYUNO ────────────────────────────
FRUTAS_DESAYUNO = [
    "Platano", "Manzana", "Naranja", "Fresas", "Kiwi",
    "Pera", "Melocoton", "Arandanos", "Frambuesas",
    "Mandarina", "Mango", "Sandia", "Melon", "Cerezas"
]

# ── GRAMAJES POR TIPO ──────────────────────────────────────
GRAMAJES_DESAYUNO = {
    "proteina": {"min": 80,  "max": 350},
    "carbo":    {"min": 50,  "max": 150},
    "fruta":    {"min": 100, "max": 250},
    "grasa":    {"min": 15,  "max": 40},
}

GRAMAJES_COMIDA = {
    "proteina": {"min": 150, "max": 450},
    "carbo":    {"min": 100, "max": 300},
    "verdura":  {"min": 150, "max": 300},
    "grasa":    {"min": 10,  "max": 20},
}

GRAMAJES_CENA = {
    "proteina": {"min": 150, "max": 400},
    "carbo":    {"min": 80,  "max": 250},
    "verdura":  {"min": 150, "max": 300},
    "grasa":    {"min": 10,  "max": 20},
}

DIAS_SEMANA = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]


def filtrar_alimentos_usuario(alimentos: List[Alimento], usuario: Usuario) -> List[Alimento]:
    """Filtra alimentos según intolerancias y excluye no saludables."""
    filtrados = []
    for a in alimentos:
        if a.nombre in EXCLUIDOS:
            continue
        if usuario.intolerancia_gluten and a.contiene_gluten:
            continue
        if usuario.intolerancia_lactosa and a.contiene_lactosa:
            continue
        if usuario.alergia_frutos_secos and a.contiene_frutos_secos:
            continue
        if usuario.dieta_vegana and not a.es_vegano:
            continue
        if usuario.dieta_vegetariana and not a.es_vegetariano:
            continue
        filtrados.append(a)
    return filtrados


def calcular_gramos_ajustado(alimento: Alimento, kcal_target: float, gramajes: Dict) -> float:
    """Calcula los gramos para alcanzar el target calórico respetando límites."""
    if alimento.kcal_100g <= 0:
        return gramajes["min"]
    gramos_ideal = (kcal_target / alimento.kcal_100g) * 100
    gramos = max(gramajes["min"], min(gramos_ideal, gramajes["max"]))
    gramos = round(gramos / 5) * 5
    return gramos


def seleccionar_alimento(
    alimentos: List[Alimento],
    categorias: List[str],
    usados: set,
    nombres_permitidos: Optional[List[str]] = None
) -> Optional[Alimento]:
    """Selecciona alimento aleatorio no usado de las categorías indicadas."""
    candidatos = [
        a for a in alimentos
        if a.categoria in categorias
        and a.id not in usados
        and (nombres_permitidos is None or a.nombre in nombres_permitidos)
    ]
    if not candidatos:
        candidatos = [
            a for a in alimentos
            if a.categoria in categorias
            and (nombres_permitidos is None or a.nombre in nombres_permitidos)
        ]
    if not candidatos:
        return None
    return random.choice(candidatos)


def calcular_item(alimento: Alimento, gramos: float) -> Dict:
    """Calcula los macros de un alimento para una cantidad dada."""
    factor = gramos / 100
    return {
        "alimento_id": alimento.id,
        "nombre": alimento.nombre,
        "categoria": alimento.categoria,
        "cantidad_g": gramos,
        "kcal": round(alimento.kcal_100g * factor, 1),
        "proteinas_g": round(alimento.proteinas_100g * factor, 1),
        "carbohidratos_g": round(alimento.carbohidratos_100g * factor, 1),
        "grasas_g": round(alimento.grasas_100g * factor, 1),
    }


def generar_desayuno(disponibles: List[Alimento], kcal_target: float, usados: set) -> List[Dict]:
    """Genera desayuno: proteína + cereal_desayuno + fruta + grasa."""
    items = []

    proteina = seleccionar_alimento(disponibles, CATEGORIAS_COMIDA["desayuno"]["proteina"], usados)
    if proteina:
        gramos = calcular_gramos_ajustado(proteina, kcal_target * 0.35, GRAMAJES_DESAYUNO["proteina"])
        items.append(calcular_item(proteina, gramos))
        usados.add(proteina.id)

    cereal = seleccionar_alimento(disponibles, CATEGORIAS_COMIDA["desayuno"]["carbo"], usados)
    if cereal:
        gramos = calcular_gramos_ajustado(cereal, kcal_target * 0.40, GRAMAJES_DESAYUNO["carbo"])
        items.append(calcular_item(cereal, gramos))
        usados.add(cereal.id)

    fruta = seleccionar_alimento(disponibles, ["fruta"], usados, FRUTAS_DESAYUNO)
    if fruta:
        gramos = calcular_gramos_ajustado(fruta, kcal_target * 0.15, GRAMAJES_DESAYUNO["fruta"])
        items.append(calcular_item(fruta, gramos))
        usados.add(fruta.id)

    grasa = seleccionar_alimento(disponibles, CATEGORIAS_COMIDA["desayuno"]["grasa"], set())
    if grasa:
        gramos = calcular_gramos_ajustado(grasa, kcal_target * 0.10, GRAMAJES_DESAYUNO["grasa"])
        items.append(calcular_item(grasa, gramos))

    return items


def generar_comida_principal(tipo: str, disponibles: List[Alimento], kcal_target: float, usados: set) -> List[Dict]:
    """Genera comida o cena: proteína + carbohidrato + verdura + grasa."""
    items = []
    gramajes = GRAMAJES_COMIDA if tipo == "comida" else GRAMAJES_CENA

    proteina = seleccionar_alimento(disponibles, CATEGORIAS_COMIDA[tipo]["proteina"], usados)
    if proteina:
        gramos = calcular_gramos_ajustado(proteina, kcal_target * 0.45, gramajes["proteina"])
        items.append(calcular_item(proteina, gramos))
        usados.add(proteina.id)

    carbo = seleccionar_alimento(disponibles, CATEGORIAS_COMIDA[tipo]["carbo"], usados)
    if carbo:
        gramos = calcular_gramos_ajustado(carbo, kcal_target * 0.35, gramajes["carbo"])
        items.append(calcular_item(carbo, gramos))
        usados.add(carbo.id)

    verdura = seleccionar_alimento(disponibles, ["verdura"], usados)
    if verdura:
        items.append(calcular_item(verdura, 200))
        usados.add(verdura.id)

    verdura2 = seleccionar_alimento(disponibles, ["verdura"], usados)
    if verdura2:
        items.append(calcular_item(verdura2, 150))
        usados.add(verdura2.id)

    grasa = seleccionar_alimento(disponibles, CATEGORIAS_COMIDA[tipo]["grasa"], set())
    if grasa:
        gramos = calcular_gramos_ajustado(grasa, kcal_target * 0.10, gramajes["grasa"])
        items.append(calcular_item(grasa, gramos))

    return items


def generar_plan_semanal(usuario: Usuario, distribucion_comidas: Dict, db: Session) -> Dict:
    """Genera el plan semanal completo (7 días × 3 comidas)."""
    todos = db.query(Alimento).all()
    disponibles = filtrar_alimentos_usuario(todos, usuario)

    usados_semana = set()
    dias = []

    for i, dia_nombre in enumerate(DIAS_SEMANA):
        comidas = []

        for tipo in ["desayuno", "comida", "cena"]:
            kcal_target = distribucion_comidas[tipo]["kcal"]

            if tipo == "desayuno":
                alimentos_comida = generar_desayuno(disponibles, kcal_target, usados_semana)
            else:
                alimentos_comida = generar_comida_principal(tipo, disponibles, kcal_target, usados_semana)

            total_kcal = round(sum(a["kcal"] for a in alimentos_comida), 1)
            total_prot = round(sum(a["proteinas_g"] for a in alimentos_comida), 1)
            total_carb = round(sum(a["carbohidratos_g"] for a in alimentos_comida), 1)
            total_gras = round(sum(a["grasas_g"] for a in alimentos_comida), 1)
            desviacion = round(abs(total_kcal - kcal_target) / kcal_target * 100, 1) if kcal_target > 0 else 0

            comidas.append({
                "tipo": tipo,
                "kcal_target": kcal_target,
                "kcal_total": total_kcal,
                "desviacion_pct": desviacion,
                "proteinas_g": total_prot,
                "carbohidratos_g": total_carb,
                "grasas_g": total_gras,
                "alimentos": alimentos_comida,
            })

        dias.append({
            "dia": i + 1,
            "nombre": dia_nombre,
            "comidas": comidas,
            "totales": {
                "kcal": round(sum(c["kcal_total"] for c in comidas), 1),
                "proteinas_g": round(sum(c["proteinas_g"] for c in comidas), 1),
                "carbohidratos_g": round(sum(c["carbohidratos_g"] for c in comidas), 1),
                "grasas_g": round(sum(c["grasas_g"] for c in comidas), 1),
            }
        })

    return {
        "dias": dias,
        "total_alimentos_distintos": len(usados_semana),
    }