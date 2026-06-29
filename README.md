# NutriFit

Servicio web y app móvil para la planificación nutricional semanal personalizada con gestión de intolerancias alimentarias.

Desarrollado como Trabajo Fin de Grado (TFG) y su Complemento (CTFG) en el Grado en Ingeniería Informática de la Universidad de Almería, bajo la supervisión del tutor Rafael Cabañas de Paz.

## Descripción

NutriFit calcula automáticamente las necesidades calóricas de cada usuario mediante la fórmula de Harris-Benedict, genera un plan de menús semanal variado adaptado a sus intolerancias alimentarias y produce la lista de la compra con los ingredientes exactos para toda la semana. Disponible como aplicación web y como app nativa para iOS y Android.

## Estructura del repositorio

```
NutriFit/
├── backend/     ← API REST (FastAPI + Python)
├── frontend/    ← Interfaz web (React + Vite)
└── mobile/      ← App móvil (React Native + Expo)
```

## Stack tecnológico

### Backend
- FastAPI + Python 3.12
- SQLAlchemy + SQLite
- JWT (python-jose + bcrypt)
- Pydantic v2

### Frontend
- React 18 + Vite
- TailwindCSS
- Axios + React Router

### Mobile
- React Native + Expo SDK 54
- expo-router
- AsyncStorage
- expo-camera, expo-notifications, expo-sensors, expo-image-picker

## Instalación rápida

```bash
# 1. Clonar el repositorio
git clone https://github.com/yea858-ual/NutriFit.git

# 2. Backend
cd NutriFit/backend
python -m venv venv && venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload

# 3. Frontend (nueva terminal)
cd NutriFit/frontend
npm install && npm run dev

# 4. Mobile (nueva terminal)
cd NutriFit/mobile
npm install && npx expo start
```

Consulta el README de cada carpeta para instrucciones detalladas.

## Autor

**Yasin El Battioui Akodad**  
Grado en Ingeniería Informática — Universidad de Almería  
Tutor: Rafael Cabañas de Paz