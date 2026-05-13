import pandas as pd
from sqlalchemy.orm import Session
from database import engine, SessionLocal
from models.models import Base, Alimento


def init_db():
    """Crea todas las tablas si no existen."""
    Base.metadata.create_all(bind=engine)
    print("✅ Tablas creadas correctamente.")


def seed_foods(db: Session):
    """Carga los alimentos del CSV si la tabla está vacía."""
    if db.query(Alimento).count() > 0:
        print("ℹ️  La tabla de alimentos ya tiene datos, omitiendo seed.")
        return

    df = pd.read_csv("data/foods.csv")

    def parse_bool(val):
        return str(val).strip().lower() == "true"

    for _, row in df.iterrows():
        alimento = Alimento(
            nombre=row["nombre"],
            categoria=row["categoria"],
            kcal_100g=float(row["kcal_100g"]),
            proteinas_100g=float(row["proteinas_100g"]),
            carbohidratos_100g=float(row["carbohidratos_100g"]),
            grasas_100g=float(row["grasas_100g"]),
            fibra_100g=float(row["fibra_100g"]),
            contiene_gluten=parse_bool(row["contiene_gluten"]),
            contiene_lactosa=parse_bool(row["contiene_lactosa"]),
            contiene_frutos_secos=parse_bool(row["contiene_frutos_secos"]),
            es_vegetariano=parse_bool(row["es_vegetariano"]),
            es_vegano=parse_bool(row["es_vegano"]),
        )
        db.add(alimento)

    db.commit()
    print(f"✅ {len(df)} alimentos cargados desde foods.csv.")


if __name__ == "__main__":
    init_db()
    db = SessionLocal()
    try:
        seed_foods(db)
    finally:
        db.close()