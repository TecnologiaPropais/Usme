# Impulso Local

Aplicación web para la gestión de proyectos locales.

## Requisitos Previos

- Node.js (versión 14 o superior)
- npm o yarn
- Git

## Instalación

1. Clonar el repositorio:
```bash
git clone https://github.com/tu-usuario/impulso-local.git
cd impulso-local
```

2. Instalar dependencias del frontend:
```bash
cd impulso-local-front
npm install
```

3. Instalar dependencias del backend:
```bash
cd ../impulso-local-back
npm install
```

## Configuración

1. Crear archivo `.env` en el directorio `impulso-local-front`:
```
VITE_API_URL=http://localhost:4000/api
```

2. Crear archivo `.env` en el directorio `impulso-local-back`:
```
PORT=4000
DB_HOST=localhost
DB_USER=tu_usuario
DB_PASSWORD=tu_password
DB_NAME=impulso_local
JWT_SECRET=tu_secreto_jwt
```

## Desarrollo

1. Iniciar el backend:
```bash
cd impulso-local-back
npm run dev
```

2. Iniciar el frontend:
```bash
cd impulso-local-front
npm run dev
```

## Despliegue

### Backend (Render)

1. Crear una cuenta en [Render](https://render.com)
2. Crear un nuevo Web Service
3. Conectar con el repositorio de GitHub
4. Configurar las variables de entorno en Render
5. Deploy

### Frontend (Netlify)

1. Crear una cuenta en [Netlify](https://netlify.com)
2. Crear un nuevo sitio desde Git
3. Conectar con el repositorio de GitHub
4. Configurar las variables de entorno en Netlify:
   - `VITE_API_URL`: URL de tu backend en Render
5. Deploy

## Estructura del Proyecto

```
impulso-local/
├── impulso-local-front/    # Frontend (React)
└── impulso-local-back/     # Backend (Node.js/Express)
```

## Tecnologías Utilizadas

- Frontend:
  - React
  - Vite
  - Tailwind CSS
  - Axios

- Backend:
  - Node.js
  - Express
  - MySQL
  - JWT para autenticación 