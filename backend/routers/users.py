from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from models.models import Usuario
from schemas.user_schema import UsuarioPerfil, UsuarioOut
from services.auth_service import get_current_user

router = APIRouter(prefix="/users", tags=["Usuarios"])


# ── VER MI PERFIL ─────────────────────────────────────────
@router.get("/me", response_model=UsuarioOut)
def obtener_perfil(current_user: Usuario = Depends(get_current_user)):
    """
    Devuelve los datos del usuario logueado.
    Requiere token JWT en la cabecera.
    """
    return current_user


# ── ACTUALIZAR MI PERFIL ──────────────────────────────────
@router.put("/me", response_model=UsuarioOut)
def actualizar_perfil(
    datos: UsuarioPerfil,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Actualiza el perfil del usuario logueado.
    Solo actualiza los campos que se envíen (el resto queda igual).
    """
    campos = datos.model_dump(exclude_none=True)

    for campo, valor in campos.items():
        setattr(current_user, campo, valor)

    db.commit()
    db.refresh(current_user)
    return current_user


# ── ELIMINAR MI CUENTA ────────────────────────────────────
@router.delete("/me", status_code=204)
def eliminar_cuenta(
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Elimina la cuenta del usuario logueado y todos sus datos.
    """
    db.delete(current_user)
    db.commit()
    return None