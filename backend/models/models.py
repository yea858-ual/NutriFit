from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime, Text, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from database import Base


class SexoEnum(str, enum.Enum):
    hombre = "hombre"
    mujer = "mujer"


class ObjetivoEnum(str, enum.Enum):
    perder_peso = "perder_peso"
    mantenimiento = "mantenimiento"
    ganar_musculo = "ganar_musculo"


class ActividadEnum(str, enum.Enum):
    sedentario = "sedentario"        # x1.2
    ligero = "ligero"                # x1.375
    moderado = "moderado"            # x1.55
    activo = "activo"                # x1.725
    muy_activo = "muy_activo"        # x1.9


# ── USUARIOS ──────────────────────────────────────────────
class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    edad = Column(Integer, nullable=True)
    peso_kg = Column(Float, nullable=True)
    altura_cm = Column(Float, nullable=True)
    sexo = Column(String, nullable=True)
    nivel_actividad = Column(String, nullable=True)
    objetivo = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # intolerancias (booleanos)
    intolerancia_gluten = Column(Boolean, default=False)
    intolerancia_lactosa = Column(Boolean, default=False)
    alergia_frutos_secos = Column(Boolean, default=False)
    dieta_vegetariana = Column(Boolean, default=False)
    dieta_vegana = Column(Boolean, default=False)

    planes = relationship("PlanNutricional", back_populates="usuario", cascade="all, delete")


# ── ALIMENTOS ─────────────────────────────────────────────
class Alimento(Base):
    __tablename__ = "alimentos"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False, index=True)
    categoria = Column(String, nullable=True)   # carne, verdura, cereal, lácteo, etc.
    kcal_100g = Column(Float, nullable=False)
    proteinas_100g = Column(Float, nullable=False)
    carbohidratos_100g = Column(Float, nullable=False)
    grasas_100g = Column(Float, nullable=False)
    fibra_100g = Column(Float, default=0.0)

    # alérgenos
    contiene_gluten = Column(Boolean, default=False)
    contiene_lactosa = Column(Boolean, default=False)
    contiene_frutos_secos = Column(Boolean, default=False)
    es_vegetariano = Column(Boolean, default=True)
    es_vegano = Column(Boolean, default=False)


# ── PLANES NUTRICIONALES ──────────────────────────────────
class PlanNutricional(Base):
    __tablename__ = "planes"

    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    bmr = Column(Float, nullable=False)
    tdee = Column(Float, nullable=False)
    calorias_objetivo = Column(Float, nullable=False)
    proteinas_g = Column(Float, nullable=False)
    carbohidratos_g = Column(Float, nullable=False)
    grasas_g = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    usuario = relationship("Usuario", back_populates="planes")
    semanas = relationship("PlanSemanal", back_populates="plan", cascade="all, delete")


# ── PLAN SEMANAL ──────────────────────────────────────────
class PlanSemanal(Base):
    __tablename__ = "planes_semanales"

    id = Column(Integer, primary_key=True, index=True)
    plan_id = Column(Integer, ForeignKey("planes.id"), nullable=False)
    semana = Column(Integer, default=1)  # número de semana
    created_at = Column(DateTime, default=datetime.utcnow)

    plan = relationship("PlanNutricional", back_populates="semanas")
    dias = relationship("DiaMenu", back_populates="semana", cascade="all, delete")


# ── DÍA DE MENÚ ───────────────────────────────────────────
class DiaMenu(Base):
    __tablename__ = "dias_menu"

    id = Column(Integer, primary_key=True, index=True)
    semana_id = Column(Integer, ForeignKey("planes_semanales.id"), nullable=False)
    dia_semana = Column(Integer, nullable=False)  # 1=lunes ... 7=domingo

    semana = relationship("PlanSemanal", back_populates="dias")
    comidas = relationship("Comida", back_populates="dia", cascade="all, delete")


# ── COMIDAS ───────────────────────────────────────────────
class Comida(Base):
    __tablename__ = "comidas"

    id = Column(Integer, primary_key=True, index=True)
    dia_id = Column(Integer, ForeignKey("dias_menu.id"), nullable=False)
    tipo = Column(String, nullable=False)  # desayuno, comida, cena

    dia = relationship("DiaMenu", back_populates="comidas")
    items = relationship("ComidaAlimento", back_populates="comida", cascade="all, delete")


# ── ITEMS DE CADA COMIDA ──────────────────────────────────
class ComidaAlimento(Base):
    __tablename__ = "comida_alimentos"

    id = Column(Integer, primary_key=True, index=True)
    comida_id = Column(Integer, ForeignKey("comidas.id"), nullable=False)
    alimento_id = Column(Integer, ForeignKey("alimentos.id"), nullable=False)
    cantidad_g = Column(Float, nullable=False)

    comida = relationship("Comida", back_populates="items")
    alimento = relationship("Alimento")


# ── LISTA DE LA COMPRA ────────────────────────────────────
class ListaCompra(Base):
    __tablename__ = "listas_compra"

    id = Column(Integer, primary_key=True, index=True)
    semana_id = Column(Integer, ForeignKey("planes_semanales.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    items = relationship("ListaCompraItem", back_populates="lista", cascade="all, delete")


class ListaCompraItem(Base):
    __tablename__ = "lista_compra_items"

    id = Column(Integer, primary_key=True, index=True)
    lista_id = Column(Integer, ForeignKey("listas_compra.id"), nullable=False)
    alimento_id = Column(Integer, ForeignKey("alimentos.id"), nullable=False)
    cantidad_total_g = Column(Float, nullable=False)
    categoria = Column(String, nullable=True)  # para agrupar en la lista

    lista = relationship("ListaCompra", back_populates="items")
    alimento = relationship("Alimento")