# NutriFit — Backend

Servicio web para planificación nutricional semanal personalizada con gestión de intolerancias alimentarias.

## Tecnologías

- **FastAPI** + Python 3.11+
- **SQLite** (vía SQLAlchemy)
- **Pydantic v2**
- **JWT** para autenticación

## Estructura del proyecto

```
backend/
├── main.py              ← Punto de entrada FastAPI
├── config.py            ← Variables de entorno (.env)
├── database.py          ← Conexión SQLite
├── seed.py              ← Carga inicial de alimentos
├── requirements.txt
├── .env                 ← Variables de entorno (NO subir a git)
├── models/
│   └── models.py        ← Modelos SQLAlchemy
├── schemas/
│   └── alimento_schema.py
├── routers/
│   └── alimentos.py     ← Endpoints de alimentos
├── services/            ← Lógica de negocio (próximas fases)
└── data/
    └── foods.csv        ← ~170 alimentos españoles con alérgenos
```

## Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/nutrifit.git
cd nutrifit/backend
```

### 2. Crear entorno virtual

```bash
python -m venv venv

# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate
```

### 3. Instalar dependencias

```bash
pip install -r requirements.txt
```

### 4. Configurar variables de entorno

Copia el archivo `.env` y ajusta la `SECRET_KEY`:

```bash
cp .env.example .env
```

### 5. Arrancar el servidor

```bash
uvicorn main:app --reload
```

El servidor estará disponible en:
- API: http://127.0.0.1:8000
- Swagger UI: http://127.0.0.1:8000/docs
- ReDoc: http://127.0.0.1:8000/redoc

> La base de datos SQLite (`nutrifit.db`) y los alimentos se crean automáticamente al arrancar por primera vez.

## Endpoints disponibles (Fase 1)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/` | Estado de la API |
| GET | `/health` | Health check |
| GET | `/alimentos/` | Listar alimentos (paginado) |
| GET | `/alimentos/buscar?q=pollo` | Buscar por nombre |
| GET | `/alimentos/{id}` | Obtener alimento por ID |
| GET | `/alimentos/{id}/calcular?gramos=150` | Calcular macros para X gramos |
| GET | `/alimentos/meta/categorias` | Listar categorías |
| GET | `/alimentos/openfoodfacts/buscar?q=coca cola` | Búsqueda externa |

## .gitignore recomendado

```
__pycache__/
*.pyc
.env
nutrifit.db
venv/
```
