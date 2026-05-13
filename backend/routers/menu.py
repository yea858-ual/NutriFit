from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from models.models import Usuario, PlanNutricional, PlanSemanal, DiaMenu, Comida, ComidaAlimento, Alimento
from schemas.menu_schema import PlanSemanalOut, ListaCompraOut
from services.auth_service import get_current_user
from services.nutrition_service import calcular_plan_completo
from services.menu_service import generar_plan_semanal
from services.shopping_service import generar_lista_compra

router = APIRouter(prefix="/menu", tags=["Menus"])


def _get_plan_activo(usuario: Usuario, db: Session) -> PlanNutricional:
    plan = (
        db.query(PlanNutricional)
        .filter(PlanNutricional.usuario_id == usuario.id)
        .order_by(PlanNutricional.created_at.desc())
        .first()
    )
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Primero debes calcular tu plan nutricional en POST /nutrition/calcular"
        )
    return plan


def _reconstruir_plan_desde_db(plan_semanal_db: PlanSemanal, db: Session) -> dict:
    """Lee el plan guardado en la BD y lo reconstruye como dict."""
    nombres_dias = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]
    dias = []

    for dia_db in sorted(plan_semanal_db.dias, key=lambda d: d.dia_semana):
        comidas = []
        for comida_db in dia_db.comidas:
            alimentos = []
            for item in comida_db.items:
                a = db.query(Alimento).filter(Alimento.id == item.alimento_id).first()
                if a:
                    factor = item.cantidad_g / 100
                    alimentos.append({
                        "alimento_id": a.id,
                        "nombre": a.nombre,
                        "categoria": a.categoria,
                        "cantidad_g": item.cantidad_g,
                        "kcal": round(a.kcal_100g * factor, 1),
                        "proteinas_g": round(a.proteinas_100g * factor, 1),
                        "carbohidratos_g": round(a.carbohidratos_100g * factor, 1),
                        "grasas_g": round(a.grasas_100g * factor, 1),
                    })

            total_kcal = round(sum(a["kcal"] for a in alimentos), 1)
            total_prot = round(sum(a["proteinas_g"] for a in alimentos), 1)
            total_carb = round(sum(a["carbohidratos_g"] for a in alimentos), 1)
            total_gras = round(sum(a["grasas_g"] for a in alimentos), 1)

            comidas.append({
                "tipo": comida_db.tipo,
                "kcal_target": total_kcal,
                "kcal_total": total_kcal,
                "desviacion_pct": 0,
                "proteinas_g": total_prot,
                "carbohidratos_g": total_carb,
                "grasas_g": total_gras,
                "alimentos": alimentos,
            })

        dias.append({
            "dia": dia_db.dia_semana,
            "nombre": nombres_dias[dia_db.dia_semana - 1],
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
        "total_alimentos_distintos": len(set(
            item.alimento_id
            for dia in plan_semanal_db.dias
            for comida in dia.comidas
            for item in comida.items
        ))
    }


# ── GENERAR PLAN SEMANAL ──────────────────────────────────
@router.post("/generar", response_model=PlanSemanalOut)
def generar_menu_semanal(
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Genera un nuevo plan semanal y lo guarda en la BD."""
    campos = ["edad", "peso_kg", "altura_cm", "sexo", "nivel_actividad", "objetivo"]
    faltantes = [c for c in campos if getattr(current_user, c) is None]
    if faltantes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Perfil incompleto. Faltan: {', '.join(faltantes)}"
        )

    plan_nutricional = _get_plan_activo(current_user, db)

    resultado = calcular_plan_completo(
        sexo=current_user.sexo,
        peso_kg=current_user.peso_kg,
        altura_cm=current_user.altura_cm,
        edad=current_user.edad,
        nivel_actividad=current_user.nivel_actividad,
        objetivo=current_user.objetivo
    )
    distribucion = resultado["distribucion_comidas"]

    plan_generado = generar_plan_semanal(
        usuario=current_user,
        distribucion_comidas=distribucion,
        db=db
    )

    plan_semanal_db = PlanSemanal(plan_id=plan_nutricional.id)
    db.add(plan_semanal_db)
    db.commit()
    db.refresh(plan_semanal_db)

    for dia_data in plan_generado["dias"]:
        dia_db = DiaMenu(semana_id=plan_semanal_db.id, dia_semana=dia_data["dia"])
        db.add(dia_db)
        db.commit()
        db.refresh(dia_db)

        for comida_data in dia_data["comidas"]:
            comida_db = Comida(dia_id=dia_db.id, tipo=comida_data["tipo"])
            db.add(comida_db)
            db.commit()
            db.refresh(comida_db)

            for item in comida_data["alimentos"]:
                item_db = ComidaAlimento(
                    comida_id=comida_db.id,
                    alimento_id=item["alimento_id"],
                    cantidad_g=item["cantidad_g"]
                )
                db.add(item_db)

    db.commit()
    return plan_generado


# ── OBTENER ÚLTIMO PLAN SIN REGENERAR ────────────────────
@router.get("/ultimo", response_model=PlanSemanalOut)
def obtener_ultimo_menu(
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Devuelve el último plan guardado sin regenerarlo."""
    plan_nutricional = _get_plan_activo(current_user, db)

    plan_semanal_db = (
        db.query(PlanSemanal)
        .filter(PlanSemanal.plan_id == plan_nutricional.id)
        .order_by(PlanSemanal.created_at.desc())
        .first()
    )

    if not plan_semanal_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No tienes ningún plan generado. Usa POST /menu/generar primero."
        )

    return _reconstruir_plan_desde_db(plan_semanal_db, db)


# ── LISTA DE LA COMPRA ────────────────────────────────────
@router.post("/compra", response_model=ListaCompraOut)
def generar_lista_compra_endpoint(
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Genera la lista de la compra del último plan guardado."""
    plan_nutricional = _get_plan_activo(current_user, db)

    plan_semanal_db = (
        db.query(PlanSemanal)
        .filter(PlanSemanal.plan_id == plan_nutricional.id)
        .order_by(PlanSemanal.created_at.desc())
        .first()
    )

    if not plan_semanal_db:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Primero genera tu plan semanal en POST /menu/generar"
        )

    plan = _reconstruir_plan_desde_db(plan_semanal_db, db)
    lista = generar_lista_compra(plan)
    return lista