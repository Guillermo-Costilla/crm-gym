# GYM CRM - Sistema de Gestión de Gimnasio

Sistema completo de gestión para gimnasios desarrollado con React 18, Vite, Tailwind CSS, Zustand y Axios.

## Características

- **Autenticación**: Sistema de login y registro con JWT
- **Dashboard**: Métricas en tiempo real con gráficos animados (Recharts)
- **Gestión de Clientes**: CRUD completo con búsqueda y filtros
- **Gestión de Productos**: Inventario con control de stock
- **Ventas**: Registro de transacciones y cálculo de ingresos
- **Pagos**: Gestión de membresías y pagos pendientes
- **Asistencias**: Monitoreo de asistencia con análisis de frecuencia
- **Exportaciones**: Reportes en Excel de pagos y ventas

## Tecnologías

- React 18
- Vite
- Tailwind CSS v4
- Zustand (estado global)
- Axios (peticiones HTTP)
- Recharts (gráficos)
- date-fns (manejo de fechas)
- Lucide React (iconos)

## Instalación

1. Clonar el repositorio
2. Instalar dependencias:

\`\`\`bash
npm install
\`\`\`

3. Configurar variables de entorno:

Crear un archivo `.env` en la raíz del proyecto:

\`\`\`
VITE_API_URL=https://crm-gym-pi.vercel.app
\`\`\`

4. Iniciar el servidor de desarrollo:

\`\`\`bash
npm run dev
\`\`\`

## Estructura del Proyecto

\`\`\`
src/
├── components/
│   └── Layout.jsx          # Layout principal con sidebar
├── pages/
│   ├── Login.jsx           # Página de login
│   ├── Register.jsx        # Página de registro
│   ├── Dashboard.jsx       # Dashboard con métricas
│   ├── Clientes.jsx        # Gestión de clientes
│   ├── Productos.jsx       # Gestión de productos
│   ├── Ventas.jsx          # Gestión de ventas
│   ├── Pagos.jsx           # Gestión de pagos
│   └── Asistencias.jsx     # Monitoreo de asistencias
├── store/
│   └── authStore.js        # Store de autenticación (Zustand)
├── config/
│   └── api.js              # Configuración de Axios
├── lib/
│   └── utils.js            # Utilidades
├── App.jsx                 # Componente principal
└── main.jsx                # Punto de entrada
\`\`\`

## Características del Diseño

- Tema oscuro profesional
- Colores vibrantes (azul, púrpura, cyan, verde)
- Animaciones suaves en transiciones
- Diseño responsive (mobile-first)
- Componentes reutilizables
- Interfaz intuitiva tipo dashboard

## API Backend

El sistema se conecta al backend en: `https://crm-gym-pi.vercel.app`

Endpoints principales:
- `/auth/login` - Autenticación
- `/auth/registro` - Registro de usuarios
- `/dashboard` - Métricas del dashboard
- `/clientes` - CRUD de clientes
- `/productos` - CRUD de productos
- `/ventas` - Gestión de ventas
- `/pagos` - Gestión de pagos
- `/asistencias` - Registro de asistencias
- `/exportaciones/pagos` - Exportar pagos a Excel
- `/exportaciones/ventas` - Exportar ventas a Excel

## Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run preview` - Previsualiza la build de producción

## Licencia

MIT
