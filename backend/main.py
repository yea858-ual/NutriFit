from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import settings
from database import engine
from models.models import Base
from seed import seed_foods, init_db
from database import SessionLocal

# Routers
from routers.alimentos import router as alimentos_router
from routers.auth import router as auth_router
from routers.users import router as users_router
from routers.nutrition import router as nutrition_router
from routers.menu import router as menu_router

app = FastAPI(
    title=settings.APP_NAME,
    description="Servicio web para planificacion nutricional semanal personalizada",
    version=settings.APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(alimentos_router)
app.include_router(auth_router)
app.include_router(users_router)
app.include_router(nutrition_router)
app.include_router(menu_router)


@app.on_event("startup")
def startup_event():
    init_db()
    db = SessionLocal()
    try:
        seed_foods(db)
    finally:
        db.close()


@app.get("/", tags=["Root"])
def root():
    return {
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "docs": "/docs",
        "status": "ok"
    }


@app.get("/health", tags=["Root"])
def health():
    return {"status": "ok"}