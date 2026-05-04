# 🏋️ CRM Gym — Frontend

Interfaz web para la gestión de gimnasios: clientes, pagos, asistencias y métricas.

Diseñada con foco en experiencia de usuario, rendimiento y consumo eficiente de API.

---

## 🚀 Demo

🔗 https://crm-gym-app.vercel.app/login

---

## ⚙️ Funcionalidades

- 👥 Gestión de clientes (crear, editar, buscar)
- 📊 Dashboard con métricas básicas
- 💳 Integración con sistema de pagos
- 🔎 Búsqueda y filtrado en tiempo real
- 💬 Feedback visual y manejo de errores

---

## 🎨 Experiencia de usuario

- Interfaces limpias y responsivas
- Animaciones suaves (transiciones, modales)
- Feedback inmediato en acciones del usuario
- Formularios con validación en tiempo real

---

## 🛠 Stack

- React 18 + Vite  
- Tailwind CSS  
- Zustand (estado global)  
- Axios (consumo de API)  
- Zod (validaciones)  

---

## 🧱 Arquitectura

```text
src/
├── components/
├── pages/
├── store/
├── utils/
├── config/
```

Estructura modular orientada a escalabilidad.

---

## 🔗 Integración

Este frontend consume la API del proyecto CRM Gym Backend:

👉 https://crm-gym-pi.vercel.app

---

## ⚡ Instalación

```bash
pnpm install
pnpm dev
````
Configurar .env:
````text
VITE_API_URL=http://localhost:3000
````
## 🧠 Qué demuestra este proyecto

- Consumo de APIs REST reales
- Manejo de estado global con Zustand
- Construcción de interfaces escalables
- Validación de formularios y UX
- Organización de proyectos frontend

## 👨‍💻 Autor

Guillermo Costilla — Full Stack Developer
