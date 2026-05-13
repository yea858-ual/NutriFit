from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
import httpx

from database import get_db
from models.models import Alimento
from schemas.alimento_schema import AlimentoOut, AlimentoCalculo, OpenFoodFactsItem

router = APIRouter(prefix="/alimentos", tags=["Alimentos"])


# ── LISTAR TODOS ──────────────────────────────────────────
@router.get("/", response_model=List[AlimentoOut])
def listar_alimentos(
    skip: int = 0,
    limit: int = 350,
    categoria: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Lista alimentos de la base de datos local. Filtro opcional por categoría."""
    query = db.query(Alimento)
    if categoria:
        query = query.filter(Alimento.categoria == categoria)
    return query.offset(skip).limit(limit).all()


# ── BUSCAR EN BD LOCAL ────────────────────────────────────
@router.get("/buscar", response_model=List[AlimentoOut])
def buscar_alimento(
    q: str = Query(..., min_length=2, description="Término de búsqueda"),
    db: Session = Depends(get_db)
):
    """Busca alimentos por nombre en la base de datos local (búsqueda parcial)."""
    resultados = db.query(Alimento).filter(
        Alimento.nombre.ilike(f"%{q}%")
    ).limit(20).all()
    return resultados


# ── OBTENER POR ID ────────────────────────────────────────
@router.get("/{alimento_id}", response_model=AlimentoOut)
def obtener_alimento(alimento_id: int, db: Session = Depends(get_db)):
    alimento = db.query(Alimento).filter(Alimento.id == alimento_id).first()
    if not alimento:
        raise HTTPException(status_code=404, detail="Alimento no encontrado")
    return alimento


# ── CALCULAR MACROS PARA UNA CANTIDAD ─────────────────────
@router.get("/{alimento_id}/calcular", response_model=AlimentoCalculo)
def calcular_macros(
    alimento_id: int,
    gramos: float = Query(..., gt=0, description="Cantidad en gramos"),
    db: Session = Depends(get_db)
):
    """Devuelve los macronutrientes de un alimento para la cantidad indicada en gramos."""
    alimento = db.query(Alimento).filter(Alimento.id == alimento_id).first()
    if not alimento:
        raise HTTPException(status_code=404, detail="Alimento no encontrado")

    factor = gramos / 100.0
    return AlimentoCalculo(
        alimento_id=alimento.id,
        nombre=alimento.nombre,
        cantidad_g=gramos,
        kcal=round(alimento.kcal_100g * factor, 1),
        proteinas_g=round(alimento.proteinas_100g * factor, 1),
        carbohidratos_g=round(alimento.carbohidratos_100g * factor, 1),
        grasas_g=round(alimento.grasas_100g * factor, 1),
        fibra_g=round(alimento.fibra_100g * factor, 1),
    )


# ── CATEGORÍAS DISPONIBLES ────────────────────────────────
@router.get("/meta/categorias")
def listar_categorias(db: Session = Depends(get_db)):
    """Devuelve todas las categorías de alimentos disponibles."""
    categorias = db.query(Alimento.categoria).distinct().all()
    return {"categorias": [c[0] for c in categorias if c[0]]}


# ── BÚSQUEDA EN OPENFOODFACTS ─────────────────────────────
@router.get("/openfoodfacts/buscar", response_model=List[OpenFoodFactsItem])
async def buscar_openfoodfacts(
    q: str = Query(..., min_length=2, description="Término de búsqueda"),
    pais: str = "es"
):
    """
    Busca alimentos en OpenFoodFacts (base de datos externa).
    Útil cuando el alimento no está en la base de datos local.
    """
    url = f"https://world.openfoodfacts.org/cgi/search.pl"
    params = {
        "search_terms": q,
        "search_simple": 1,
        "action": "process",
        "json": 1,
        "page_size": 10,
        "fields": "product_name,brands,nutriments",
        "tagtype_0": "countries",
        "tag_contains_0": "contains",
        "tag_0": "spain",
    }

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.get(url, params=params)
            data = response.json()
    except Exception:
        raise HTTPException(
            status_code=503,
            detail="No se pudo conectar con OpenFoodFacts. Intenta más tarde."
        )

    productos = []
    for p in data.get("products", []):
        nutriments = p.get("nutriments", {})
        nombre = p.get("product_name", "").strip()
        if not nombre:
            continue

        productos.append(OpenFoodFactsItem(
            nombre=nombre,
            marca=p.get("brands", None),
            kcal_100g=nutriments.get("energy-kcal_100g"),
            proteinas_100g=nutriments.get("proteins_100g"),
            carbohidratos_100g=nutriments.get("carbohydrates_100g"),
            grasas_100g=nutriments.get("fat_100g"),
        ))

    return productos