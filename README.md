# SystemDate — Frontend

Interfaz de usuario moderna y profesional construida con **Next.js**, enfocada en la velocidad y la experiencia del usuario.

## 🚀 Tecnologías

- **Framework**: Next.js 15 (App Router)
- **Estilos**: TailwindCSS 4 (Glassmorphism, animaciones suaves)
- **Estado/Data Fetching**: TanStack React Query v5
- **Iconografía**: Lucide React
- **Lenguaje**: TypeScript

## ✨ Características de Interfaz

- **Landing Page Premium**: Diseño visualmente impactante con efectos de blur y gradientes.
- **Wizard de Agendamiento**: Proceso simplificado en 3 pasos.
- **Panel Administrativo**: Interfaz tipo SPA con gestión de agenda, servicios y perfil.
- **Responsive**: Totalmente adaptado a dispositivos móviles y escritorio.

## 🛠️ Instalación y Uso

1. Instalar dependencias:
   ```bash
   pnpm install
   ```

2. Configurar variables de entorno:
   Copiar `.env.local.example` a `.env.local` y ajustar la URL de la API.

3. Correr en desarrollo:
   ```bash
   pnpm dev
   ```

## 📁 Estructura src/

- `/app`: Rutas del sistema (admin, auth, mi-cuenta, agendar).
- `/components`: Componentes reutilizables organizados por módulos.
- `/hooks`: Lógica de estado y llamadas a API con React Query.
- `/services`: Definición de peticiones HTTP.
- `/lib`: Utilidades y configuraciones.

## 🐳 Docker

```bash
docker build -t system-date-frontend .
docker compose up -d
```
