# NutriFit Mobile

App móvil de NutriFit para iOS y Android desarrollada con React Native y Expo. Complemento del Trabajo Fin de Grado (CTFG) en Ingeniería Informática en la Universidad de Almería.

Consume la misma API REST del backend de NutriFit sin necesidad de un backend adicional.

## Tecnologías

- **React Native** + Expo SDK 54
- **expo-router** (navegación basada en archivos)
- **AsyncStorage** (persistencia local)
- **expo-camera** (escáner de código de barras)
- **expo-notifications** (notificaciones locales)
- **expo-sensors** (pedómetro)
- **expo-image-picker** (diario visual de comidas)

## Estructura del proyecto

```
mobile/
├── app/
│   ├── _layout.tsx          ← Layout principal con autenticación
│   ├── index.tsx            ← Redirección inicial
│   ├── (auth)/
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── (tabs)/
│   │   ├── dashboard.tsx    ← Inicio con resumen nutricional
│   │   ├── plan.tsx         ← Plan semanal
│   │   ├── compra.tsx       ← Lista de la compra offline
│   │   ├── buscador.tsx     ← Buscador + escáner de código de barras
│   │   └── perfil.tsx       ← Perfil e intolerancias
│   ├── notificaciones/
│   │   └── index.tsx        ← Recordatorios diarios configurables
│   ├── pedometro/
│   │   └── index.tsx        ← Contador de pasos y calorías quemadas
│   └── diario/
│       └── index.tsx        ← Diario visual de comidas
├── api/
│   └── http.ts              ← Axios con interceptor JWT
└── context/
    └── AuthContext.tsx      ← Gestión de token con AsyncStorage
```

## Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/yea858-ual/NutriFit.git
cd NutriFit/mobile
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar la IP del backend

Abre `api/http.ts` y cambia la `baseURL` por la IP de tu ordenador en la red local:

```ts
baseURL: 'http://TU_IP_LOCAL:8000',
```

### 4. Arrancar Expo

```bash
npx expo start
```

Escanea el QR con la app **Expo Go** desde tu iPhone o Android.

> Asegúrate de que el backend está corriendo con `uvicorn main:app --reload --host 0.0.0.0` y de que el móvil y el ordenador están en la misma red WiFi.

## Funcionalidades nativas

| Funcionalidad | Librería | Descripción |
|---------------|----------|-------------|
| Escáner código de barras | expo-camera | Escanea productos y consulta sus macros en OpenFoodFacts |
| Notificaciones locales | expo-notifications | Recordatorios diarios de comidas e hidratación |
| Pedómetro | expo-sensors | Pasos del día y calorías quemadas via Apple HealthKit |
| Diario visual | expo-image-picker | Fotografía tus comidas y guárdalas por día |
| Compartir lista | Share (React Native) | Envía la lista de la compra por WhatsApp u otras apps |
| Acceso offline | AsyncStorage | Lista de la compra y buscador disponibles sin conexión |