from pydantic import BaseModel
from typing import List, Dict, Optional


# ── ITEMS DE COMIDA ───────────────────────────────────────
class AlimentoComidaOut(BaseModel):
    alimento_id: int
    nombre: str
    categoria: str
    cantidad_g: float
    kcal: float
    proteinas_g: float
    carbohidratos_g: float
    grasas_g: float


# ── COMIDA ────────────────────────────────────────────────
class ComidaOut(BaseModel):
    tipo: str
    kcal_target: float
    kcal_total: float
    desviacion_pct: float
    proteinas_g: float
    carbohidratos_g: float
    grasas_g: float
    alimentos: List[AlimentoComidaOut]


# ── TOTALES DÍA ───────────────────────────────────────────
class TotalesDia(BaseModel):
    kcal: float
    proteinas_g: float
    carbohidratos_g: float
    grasas_g: float


# ── DÍA ───────────────────────────────────────────────────
class DiaOut(BaseModel):
    dia: int
    nombre: str
    comidas: List[ComidaOut]
    totales: TotalesDia


# ── PLAN SEMANAL ──────────────────────────────────────────
class PlanSemanalOut(BaseModel):
    dias: List[DiaOut]
    total_alimentos_distintos: int


# ── LISTA DE LA COMPRA ────────────────────────────────────
class ItemCompraOut(BaseModel):
    nombre: str
    cantidad_g: float
    cantidad_legible: str


class CategoriaCompraOut(BaseModel):
    categoria: str
    items: List[ItemCompraOut]
    total_items: int


class ListaCompraOut(BaseModel):
    categorias: List[CategoriaCompraOut]
    total_ingredientes: int
    total_categorias: int