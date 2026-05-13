"""
NutriFit — Servicio de cálculo nutricional
Fórmulas basadas en Harris-Benedict (1919) revisadas por Mifflin-St Jeor (1990)
Referencia: Harris JA, Benedict FG. A Biometric Study of Human Basal Metabolism.
            Proc Natl Acad Sci. 1918;4(12):370-373.
"""

# ── FACTORES DE ACTIVIDAD (Ainsworth et al.) ──────────────
FACTORES_ACTIVIDAD = {
    "sedentario":  1.2,    # trabajo de oficina, sin ejercicio
    "ligero":      1.375,  # ejercicio 1-2 días/semana
    "moderado":    1.55,   # ejercicio 3-4 días/semana
    "activo":      1.725,  # ejercicio 5-6 días/semana
    "muy_activo":  1.9,    # ejercicio diario intenso o trabajo físico
}

# ── AJUSTE CALÓRICO POR OBJETIVO ──────────────────────────
AJUSTE_OBJETIVO = {
    "perder_peso":    -400,   # déficit moderado para perder ~0.5kg/semana
    "mantenimiento":   0,
    "ganar_musculo":  +300,   # superávit controlado para ganar masa
}

# ── DISTRIBUCIÓN DE MACRONUTRIENTES POR OBJETIVO ──────────
# (proteína g/kg peso, % carbohidratos, % grasas)
MACROS_OBJETIVO = {
    "perder_peso":   {"proteina_ratio": 2.0, "carbs_pct": 0.35, "grasas_pct": 0.30},
    "mantenimiento": {"proteina_ratio": 1.8, "carbs_pct": 0.45, "grasas_pct": 0.30},
    "ganar_musculo": {"proteina_ratio": 2.2, "carbs_pct": 0.50, "grasas_pct": 0.25},
}

# ── DISTRIBUCIÓN CALÓRICA POR COMIDA ──────────────────────
DISTRIBUCION_COMIDAS = {
    "desayuno": 0.25,   # 25% de las calorías diarias
    "comida":   0.40,   # 40% de las calorías diarias
    "cena":     0.35,   # 35% de las calorías diarias
}


def calcular_bmr(sexo: str, peso_kg: float, altura_cm: float, edad: int) -> float:
    """
    Calcula el Metabolismo Basal (BMR) con la fórmula de Harris-Benedict.
    
    Hombre: BMR = 88.362 + (13.397 × peso) + (4.799 × altura) − (5.677 × edad)
    Mujer:  BMR = 447.593 + (9.247 × peso) + (3.098 × altura) − (4.330 × edad)
    
    Returns:
        BMR en kcal/día
    """
    if sexo == "hombre":
        return round(88.362 + (13.397 * peso_kg) + (4.799 * altura_cm) - (5.677 * edad), 1)
    else:
        return round(447.593 + (9.247 * peso_kg) + (3.098 * altura_cm) - (4.330 * edad), 1)


def calcular_tdee(bmr: float, nivel_actividad: str) -> float:
    """
    Calcula el Gasto Energético Total Diario (TDEE).
    TDEE = BMR × factor de actividad
    
    Returns:
        TDEE en kcal/día
    """
    factor = FACTORES_ACTIVIDAD.get(nivel_actividad, 1.2)
    return round(bmr * factor, 1)


def calcular_calorias_objetivo(tdee: float, objetivo: str) -> float:
    """
    Ajusta las calorías según el objetivo del usuario.
    
    Returns:
        Calorías objetivo en kcal/día
    """
    ajuste = AJUSTE_OBJETIVO.get(objetivo, 0)
    return round(tdee + ajuste, 1)


def calcular_macros(calorias: float, peso_kg: float, objetivo: str) -> dict:
    """
    Calcula la distribución de macronutrientes en gramos.
    
    - Proteínas: ratio g/kg según objetivo (prioridad 1)
    - Grasas: % de calorías según objetivo (prioridad 2)
    - Carbohidratos: calorías restantes (prioridad 3)
    
    Calorías por gramo: proteína=4, carbohidratos=4, grasas=9
    
    Returns:
        dict con proteinas_g, carbohidratos_g, grasas_g, fibra_recomendada_g
    """
    config = MACROS_OBJETIVO.get(objetivo, MACROS_OBJETIVO["mantenimiento"])

    proteinas_g = round(peso_kg * config["proteina_ratio"], 1)
    grasas_g = round((calorias * config["grasas_pct"]) / 9, 1)
    calorias_proteinas = proteinas_g * 4
    calorias_grasas = grasas_g * 9
    calorias_carbs = max(0, calorias - calorias_proteinas - calorias_grasas)
    carbohidratos_g = round(calorias_carbs / 4, 1)

    # Fibra recomendada: 14g por cada 1000 kcal (OMS)
    fibra_g = round((calorias / 1000) * 14, 1)

    return {
        "proteinas_g": proteinas_g,
        "carbohidratos_g": carbohidratos_g,
        "grasas_g": grasas_g,
        "fibra_recomendada_g": fibra_g,
    }


def calcular_macros_comida(calorias_dia: float, tipo_comida: str) -> dict:
    """
    Calcula los macros target para una comida concreta del día.
    
    Returns:
        dict con kcal, proteinas_g, carbohidratos_g, grasas_g
    """
    pct = DISTRIBUCION_COMIDAS.get(tipo_comida, 0.33)
    kcal = round(calorias_dia * pct, 1)
    return {"kcal": kcal, "pct": pct}


def calcular_plan_completo(
    sexo: str,
    peso_kg: float,
    altura_cm: float,
    edad: int,
    nivel_actividad: str,
    objetivo: str
) -> dict:
    """
    Calcula el plan nutricional completo de un usuario.
    
    Returns:
        dict con BMR, TDEE, calorías objetivo, macros diarios y por comida
    """
    bmr = calcular_bmr(sexo, peso_kg, altura_cm, edad)
    tdee = calcular_tdee(bmr, nivel_actividad)
    calorias = calcular_calorias_objetivo(tdee, objetivo)
    macros = calcular_macros(calorias, peso_kg, objetivo)

    return {
        "bmr": bmr,
        "tdee": tdee,
        "calorias_objetivo": calorias,
        "ajuste_calorico": AJUSTE_OBJETIVO.get(objetivo, 0),
        "proteinas_g": macros["proteinas_g"],
        "carbohidratos_g": macros["carbohidratos_g"],
        "grasas_g": macros["grasas_g"],
        "fibra_recomendada_g": macros["fibra_recomendada_g"],
        "distribucion_comidas": {
            tipo: {
                "kcal": round(calorias * pct, 1),
                "proteinas_g": round(macros["proteinas_g"] * pct, 1),
                "carbohidratos_g": round(macros["carbohidratos_g"] * pct, 1),
                "grasas_g": round(macros["grasas_g"] * pct, 1),
            }
            for tipo, pct in DISTRIBUCION_COMIDAS.items()
        }
    }