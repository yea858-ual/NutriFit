from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from database import get_db
from models.models import Usuario
from schemas.user_schema import UsuarioRegistro, TokenResponse
from services.auth_service import cifrar_password, verificar_password, crear_token

router = APIRouter(prefix="/auth", tags=["Autenticacion"])


# ── REGISTRO ──────────────────────────────────────────────
@router.post("/registro", response_model=TokenResponse, status_code=201)
def registro(datos: UsuarioRegistro, db: Session = Depends(get_db)):
    """
    Registra un nuevo usuario.
    - Comprueba que el email no este ya registrado
    - Cifra la contrasena con bcrypt
    - Devuelve un token JWT listo para usar
    """
    existe = db.query(Usuario).filter(Usuario.email == datos.email).first()
    if existe:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Este email ya esta registrado. Prueba a iniciar sesion."
        )

    nuevo_usuario = Usuario(
        nombre=datos.nombre,
        email=datos.email,
        hashed_password=cifrar_password(datos.password)
    )
    db.add(nuevo_usuario)
    db.commit()
    db.refresh(nuevo_usuario)

    token = crear_token({"sub": nuevo_usuario.email})
    return TokenResponse(
        access_token=token,
        nombre=nuevo_usuario.nombre,
        email=nuevo_usuario.email
    )


# ── LOGIN ─────────────────────────────────────────────────
@router.post("/login", response_model=TokenResponse)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """
    Inicia sesion con email y contrasena.
    - Busca el usuario por email
    - Verifica la contrasena
    - Devuelve un token JWT listo para usar
    """
    usuario = db.query(Usuario).filter(Usuario.email == form_data.username).first()

    if not usuario or not verificar_password(form_data.password, usuario.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contrasena incorrectos."
        )

    token = crear_token({"sub": usuario.email})
    return TokenResponse(
        access_token=token,
        nombre=usuario.nombre,
        email=usuario.email
    )