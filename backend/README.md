# NutriFit — Backend

API REST para planificación nutricional semanal personalizada con gestión de intolerancias alimentarias. Desarrollada como Trabajo Fin de Grado en Ingeniería Informática en la Universidad de Almería.

## Tecnologías

- **FastAPI** + Python 3.12
- **SQLAlchemy** + SQLite
- **Pydantic v2**
- **JWT** (python-jose + bcrypt)

## Estructura del proyecto

```
backend/
├── main.py              ← Punto de entrada FastAPI
├── config.py            ← Configuración y variables de entorno
├── database.py          ← Conexión SQLite
├── seed.py              ← Carga inicial de alimentos
├── requirements.txt
├── models/
│   └── models.py        ← Modelos SQLAlchemy
├── schemas/
│   ├── alimento_schema.py
│   ├── user_schema.py
│   ├── nutrition_schema.py
│   └── menu_schema.py
├── routers/
│   ├── alimentos.py
│   ├── auth.py
│   ├── users.py
│   ├── nutrition.py
│   └── menu.py
├── services/
│   ├── auth_service.py
│   ├── nutrition_service.py
│   ├── menu_service.py
│   └── shopping_service.py
└── data/
    └── foods.csv        ← 295 alimentos españoles con alérgenos
```

## Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/yea858-ual/NutriFit.git
cd NutriFit/backend
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

### 4. Arrancar el servidor

```bash
# Desarrollo local
uvicorn main:app --reload

# Accesible desde red local (para NutriFit Mobile)
uvicorn main:app --reload --host 0.0.0.0
```

El servidor estará disponible en:
- API: http://127.0.0.1:8000
- Swagger UI: http://127.0.0.1:8000/docs

> La base de datos SQLite (`nutrifit.db`) y los 295 alimentos se crean automáticamente al arrancar por primera vez.

## Endpoints

| Método | Endpoint | Auth | Descripción |
|--------|----------|------|-------------|
| POST | `/auth/registro` | No | Registro de usuario |
| POST | `/auth/login` | No | Inicio de sesión |
| GET | `/users/me` | Sí | Datos del usuario |
| PUT | `/users/me` | Sí | Actualizar perfil |
| DELETE | `/users/me` | Sí | Eliminar cuenta |
| POST | `/nutrition/calcular` | Sí | Calcular BMR/TDEE/macros |
| GET | `/nutrition/ultimo` | Sí | Último plan nutricional |
| POST | `/menu/generar` | Sí | Generar plan semanal |
| GET | `/menu/ultimo` | Sí | Último plan semanal |
| POST | `/menu/compra` | Sí | Generar lista de la compra |
| GET | `/alimentos/buscar?q=pollo` | No | Buscar alimento local |
| GET | `/alimentos/{id}/calcular?gramos=150` | No | Calcular macros por cantidad |
| GET | `/alimentos/openfoodfacts/buscar?q=...` | No | Búsqueda en OpenFoodFacts |

## Usuario de prueba

- **Email:** yasinelbattioui04@gmail.com
- **Contraseña:** 45359959A