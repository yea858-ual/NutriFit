# NutriFit — Frontend

Interfaz web de NutriFit, servicio de planificación nutricional semanal personalizada con gestión de intolerancias alimentarias. Desarrollada como Trabajo Fin de Grado en Ingeniería Informática en la Universidad de Almería.

## Tecnologías

- **React 18** + Vite
- **TailwindCSS**
- **Axios** + React Router
- **OpenFoodFacts API**

## Estructura del proyecto

```
frontend/src/
├── api/
│   └── http.js          ← Axios con interceptor JWT
├── components/
│   └── Layout.jsx       ← Sidebar verde con navegación
├── context/
│   └── AuthContext.jsx  ← Gestión de token JWT
└── pages/
    ├── Login.jsx
    ├── Register.jsx
    ├── Perfil.jsx
    ├── Dashboard.jsx
    ├── PlanSemanal.jsx
    ├── ListaCompra.jsx
    └── Buscador.jsx
```

## Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/yea858-ual/NutriFit.git
cd NutriFit/frontend
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Arrancar el servidor de desarrollo

```bash
npm run dev
```

El frontend estará disponible en http://localhost:5173.

> Asegúrate de que el backend está corriendo en http://127.0.0.1:8000 antes de arrancar el frontend.

## Páginas

| Ruta | Descripción |
|------|-------------|
| `/login` | Inicio de sesión |
| `/register` | Registro de cuenta |
| `/perfil` | Gestión del perfil e intolerancias |
| `/dashboard` | Resumen nutricional diario |
| `/plan` | Plan semanal con pestañas por día |
| `/compra` | Lista de la compra con checkboxes |
| `/buscador` | Buscador local y OpenFoodFacts con calculadora de macros |