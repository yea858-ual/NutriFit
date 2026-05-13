from pydantic import BaseModel
from typing import Dict


class MacrosComida(BaseModel):
    """Macros para una comida concreta del día."""
    kcal: float
    proteinas_g: float
    carbohidratos_g: float
    grasas_g: float


class PlanNutricionalOut(BaseModel):
    """Respuesta completa del cálculo nutricional."""
    bmr: float
    tdee: float
    calorias_objetivo: float
    ajuste_calorico: int
    proteinas_g: float
    carbohidratos_g: float
    grasas_g: float
    fibra_recomendada_g: float
    distribucion_comidas: Dict[str, MacrosComida]

    class Config:
        from_attributes = True