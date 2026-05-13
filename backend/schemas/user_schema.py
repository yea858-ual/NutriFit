from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional


# ── REGISTRO ──────────────────────────────────────────────
class UsuarioRegistro(BaseModel):
    """Datos necesarios para registrarse."""
    nombre: str
    email: EmailStr
    password: str

    @field_validator("password")
    def password_minima(cls, v):
        if len(v) < 6:
            raise ValueError("La contraseña debe tener al menos 6 caracteres.")
        return v

    @field_validator("nombre")
    def nombre_no_vacio(cls, v):
        if not v.strip():
            raise ValueError("El nombre no puede estar vacío.")
        return v.strip()


# ── LOGIN ─────────────────────────────────────────────────
class UsuarioLogin(BaseModel):
    """Datos para iniciar sesión."""
    email: EmailStr
    password: str


# ── TOKEN RESPUESTA ───────────────────────────────────────
class TokenResponse(BaseModel):
    """Respuesta del login con el token JWT."""
    access_token: str
    token_type: str = "bearer"
    nombre: str
    email: str


# ── PERFIL (actualizar) ───────────────────────────────────
class UsuarioPerfil(BaseModel):
    """Datos del perfil nutricional del usuario."""
    edad: Optional[int] = None
    peso_kg: Optional[float] = None
    altura_cm: Optional[float] = None
    sexo: Optional[str] = None
    nivel_actividad: Optional[str] = None
    objetivo: Optional[str] = None
    intolerancia_gluten: Optional[bool] = False
    intolerancia_lactosa: Optional[bool] = False
    alergia_frutos_secos: Optional[bool] = False
    dieta_vegetariana: Optional[bool] = False
    dieta_vegana: Optional[bool] = False

    @field_validator("sexo")
    def validar_sexo(cls, v):
        if v is not None and v not in ["hombre", "mujer"]:
            raise ValueError("El sexo debe ser 'hombre' o 'mujer'.")
        return v

    @field_validator("nivel_actividad")
    def validar_actividad(cls, v):
        opciones = ["sedentario", "ligero", "moderado", "activo", "muy_activo"]
        if v is not None and v not in opciones:
            raise ValueError(f"El nivel de actividad debe ser uno de: {opciones}")
        return v

    @field_validator("objetivo")
    def validar_objetivo(cls, v):
        opciones = ["perder_peso", "mantenimiento", "ganar_musculo"]
        if v is not None and v not in opciones:
            raise ValueError(f"El objetivo debe ser uno de: {opciones}")
        return v

    @field_validator("edad")
    def validar_edad(cls, v):
        if v is not None and (v < 10 or v > 100):
            raise ValueError("La edad debe estar entre 10 y 100 años.")
        return v

    @field_validator("peso_kg")
    def validar_peso(cls, v):
        if v is not None and (v < 20 or v > 300):
            raise ValueError("El peso debe estar entre 20 y 300 kg.")
        return v

    @field_validator("altura_cm")
    def validar_altura(cls, v):
        if v is not None and (v < 100 or v > 250):
            raise ValueError("La altura debe estar entre 100 y 250 cm.")
        return v


# ── RESPUESTA USUARIO ─────────────────────────────────────
class UsuarioOut(BaseModel):
    """Datos del usuario que devuelve la API (sin contraseña)."""
    id: int
    nombre: str
    email: str
    edad: Optional[int] = None
    peso_kg: Optional[float] = None
    altura_cm: Optional[float] = None
    sexo: Optional[str] = None
    nivel_actividad: Optional[str] = None
    objetivo: Optional[str] = None
    intolerancia_gluten: bool = False
    intolerancia_lactosa: bool = False
    alergia_frutos_secos: bool = False
    dieta_vegetariana: bool = False
    dieta_vegana: bool = False

    class Config:
        from_attributes = True