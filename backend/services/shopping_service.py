"""
NutriFit — Servicio de lista de la compra semanal
Agrega todos los ingredientes de la semana agrupados por categoría.
"""

from typing import Dict, List


# Orden de categorías en la lista de la compra
ORDEN_CATEGORIAS = [
    "carne",
    "pescado",
    "marisco",
    "huevo",
    "lacteo",
    "bebida vegetal",
    "verdura",
    "legumbre",
    "cereal",
    "fruta",
    "frutos secos",
    "semillas",
    "grasa",
    "grasa vegetal",
    "embutido",
    "conserva",
    "condimento",
    "caldo",
    "suplemento",
    "dulce",
]


def generar_lista_compra(plan_semanal: Dict) -> Dict:
    """
    Genera la lista de la compra semanal a partir del plan de menús.
    Suma las cantidades de cada alimento en toda la semana
    y agrupa por categoría.

    Args:
        plan_semanal: dict con los 7 días y sus comidas

    Returns:
        dict con los ingredientes agrupados por categoría con cantidades totales
    """
    # Acumular cantidades por alimento
    ingredientes: Dict[int, Dict] = {}

    for dia in plan_semanal["dias"]:
        for comida in dia["comidas"]:
            for item in comida["alimentos"]:
                alimento_id = item["alimento_id"]

                if alimento_id not in ingredientes:
                    ingredientes[alimento_id] = {
                        "alimento_id": alimento_id,
                        "nombre": item["nombre"],
                        "categoria": item["categoria"],
                        "cantidad_total_g": 0,
                    }

                ingredientes[alimento_id]["cantidad_total_g"] += item["cantidad_g"]

    # Redondear cantidades
    for ing in ingredientes.values():
        ing["cantidad_total_g"] = round(ing["cantidad_total_g"], 0)

    # Agrupar por categoría
    por_categoria: Dict[str, List] = {}
    for ing in ingredientes.values():
        cat = ing["categoria"]
        if cat not in por_categoria:
            por_categoria[cat] = []
        por_categoria[cat].append({
            "nombre": ing["nombre"],
            "cantidad_g": ing["cantidad_total_g"],
            "cantidad_legible": formatear_cantidad(ing["cantidad_total_g"], ing["categoria"]),
        })

    # Ordenar alimentos dentro de cada categoría por nombre
    for cat in por_categoria:
        por_categoria[cat].sort(key=lambda x: x["nombre"])

    # Ordenar categorías según orden definido
    lista_ordenada = []
    for cat in ORDEN_CATEGORIAS:
        if cat in por_categoria:
            lista_ordenada.append({
                "categoria": cat,
                "items": por_categoria[cat],
                "total_items": len(por_categoria[cat]),
            })

    # Añadir categorías no contempladas en el orden
    for cat in por_categoria:
        if cat not in ORDEN_CATEGORIAS:
            lista_ordenada.append({
                "categoria": cat,
                "items": por_categoria[cat],
                "total_items": len(por_categoria[cat]),
            })

    return {
        "categorias": lista_ordenada,
        "total_ingredientes": len(ingredientes),
        "total_categorias": len(lista_ordenada),
    }


def formatear_cantidad(gramos: float, categoria: str) -> str:
    """
    Convierte gramos a una cantidad legible para la lista de la compra.
    Por ejemplo: 1500g → 1.5 kg, 200g → 200 g
    """
    if gramos >= 1000:
        kg = gramos / 1000
        return f"{kg:.1f} kg"
    return f"{int(gramos)} g"