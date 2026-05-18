from pydantic import BaseModel
from typing import Optional


class AlimentoOut(BaseModel):
    id: int
    nombre: str
    categoria: Optional[str]
    kcal_100g: float
    proteinas_100g: float
    carbohidratos_100g: float
    grasas_100g: float
    fibra_100g: float
    contiene_gluten: bool
    contiene_lactosa: bool
    contiene_frutos_secos: bool
    es_vegetariano: bool
    es_vegano: bool

    class Config:
        from_attributes = True


class AlimentoCalculo(BaseModel):
    """Devuelve macros calculados para una cantidad en gramos concreta."""
    alimento_id: int
    nombre: str
    cantidad_g: float
    kcal: float
    proteinas_g: float
    carbohidratos_g: float
    grasas_g: float
    fibra_g: float


class OpenFoodFactsItem(BaseModel):
    """Resultado de búsqueda en OpenFoodFacts."""
    nombre: str
    marca: Optional[str] = None
    kcal_100g: Optional[float] = None
    proteinas_100g: Optional[float] = None
    carbohidratos_100g: Optional[float] = None
    grasas_100g: Optional[float] = None
    imagen_url: Optional[str] = None
    fuente: str = "OpenFoodFacts"