from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from models.models import Usuario, PlanNutricional
from schemas.nutrition_schema import PlanNutricionalOut
from services.auth_service import get_current_user
from services.nutrition_service import calcular_plan_completo

router = APIRouter(prefix="/nutrition", tags=["Nutricion"])


# ── CALCULAR Y GUARDAR PLAN ───────────────────────────────
@router.post("/calcular", response_model=PlanNutricionalOut)
def calcular_plan(
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Calcula el plan nutricional del usuario logueado.
    - Usa los datos del perfil (edad, peso, altura, sexo, actividad, objetivo)
    - Aplica la fórmula de Harris-Benedict para BMR y TDEE
    - Guarda el plan en la base de datos
    - Devuelve calorías objetivo y distribución de macronutrientes
    """
    # Verificar que el perfil está completo
    campos_requeridos = ["edad", "peso_kg", "altura_cm", "sexo", "nivel_actividad", "objetivo"]
    faltantes = [c for c in campos_requeridos if getattr(current_user, c) is None]

    if faltantes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Perfil incompleto. Faltan los siguientes datos: {', '.join(faltantes)}"
        )

    # Calcular plan nutricional
    resultado = calcular_plan_completo(
        sexo=current_user.sexo,
        peso_kg=current_user.peso_kg,
        altura_cm=current_user.altura_cm,
        edad=current_user.edad,
        nivel_actividad=current_user.nivel_actividad,
        objetivo=current_user.objetivo
    )

    # Guardar plan en la BD
    plan = PlanNutricional(
        usuario_id=current_user.id,
        bmr=resultado["bmr"],
        tdee=resultado["tdee"],
        calorias_objetivo=resultado["calorias_objetivo"],
        proteinas_g=resultado["proteinas_g"],
        carbohidratos_g=resultado["carbohidratos_g"],
        grasas_g=resultado["grasas_g"],
    )
    db.add(plan)
    db.commit()
    db.refresh(plan)

    return resultado


# ── OBTENER ÚLTIMO PLAN ───────────────────────────────────
@router.get("/ultimo", response_model=PlanNutricionalOut)
def obtener_ultimo_plan(
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Devuelve el último plan nutricional calculado del usuario.
    """
    plan = (
        db.query(PlanNutricional)
        .filter(PlanNutricional.usuario_id == current_user.id)
        .order_by(PlanNutricional.created_at.desc())
        .first()
    )

    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No tienes ningún plan calculado. Usa POST /nutrition/calcular primero."
        )

    # Recalcular para devolver la distribución por comidas
    resultado = calcular_plan_completo(
        sexo=current_user.sexo,
        peso_kg=current_user.peso_kg,
        altura_cm=current_user.altura_cm,
        edad=current_user.edad,
        nivel_actividad=current_user.nivel_actividad,
        objetivo=current_user.objetivo
    )

    return resultado