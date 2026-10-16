# ⚡ Gestor Estratégico de Tareas — MateCode
> Proyecto Integrador | Módulo 4 | Full Stack Web Development (Henry)

Una aplicación web SPA (*Single Page Application*) moderna, robusta y escalable construida para **MateCode**, diseñada para que empleados y equipos gestionen sus tareas diarias de forma organizada, persistente y accesible desde cualquier dispositivo (Desktop, Tablet y Móvil).

---

## 🚀 1. Stack Tecnológico

| Capa | Tecnología | Propósito |
|---|---|---|
| **Frontend** | React 19 + TypeScript | Interfaz reactiva con tipado estricto y detección temprana de errores |
| **Tooling & Bundler** | Vite 8 + Vitest | Entorno de desarrollo ultra rápido y suite de pruebas moderna |
| **BaaS (Backend as a Service)** | Firebase Auth + Cloud Firestore | Autenticación de usuarios y persistencia de datos en tiempo real en la nube |
| **Drag & Drop** | `@dnd-kit` (Core + Sortable) | Reordenamiento fluido y accesible de tareas |
| **Notificaciones por Email** | AWS SES (Simple Email Service) | Envío de reportes y resúmenes ejecutivos vía serverless functions |
| **Serverless Backend** | Vercel Serverless Functions (`/api`) | Endpoint seguro para invocar AWS SES sin exponer secretos en el cliente |
| **Testing** | Vitest + React Testing Library + JSDOM | Pruebas unitarias de servicios y pruebas de componentes de UI |
| **Despliegue** | Vercel | Hosting SPA optimizado con CI/CD automático |

---

## 🏛️ 2. Arquitectura del Proyecto

El código está estructurado siguiendo los principios de **separación de responsabilidades** y **arquitectura por capas**:

```text
2.0 Borrador de P.I Modulo 4/
├── api/                        # Vercel Serverless Functions
│   └── send-email.ts           # Endpoint seguro de envío de emails con AWS SES
├── functions/                  # Re-export de serverless functions (compatibilidad)
│   └── send-email.ts
├── public/                     # Assets públicos estáticos
├── src/
│   ├── assets/                 # Iconos e imágenes
│   ├── components/             # Componentes de UI reutilizables
│   │   ├── common/             # Componentes transversales (ErrorBoundary)
│   │   ├── EditTaskModal.tsx   # Modal de edición completa de tareas
│   │   ├── TodoForm.tsx        # Formulario de alta con validación y UX expandible
│   │   ├── TodoItem.tsx        # Fila/tarjeta de tarea con chips, drag handle y acciones
│   │   └── TodoList.tsx        # Listado con búsqueda, filtros múltiples y DndContext
│   ├── hooks/                  # Custom hooks (useAuth con manejo de errores bilingüe)
│   ├── pages/                  # Vistas principales de la SPA
│   │   ├── AuthPage.tsx        # Login / Registro con tabs y soporte Google
│   │   ├── NotFoundPage.tsx    # Vista 404 personalizada
│   │   └── TasksPage.tsx       # Dashboard principal con métricas KPI y CRUD
│   ├── routes/                 # Enrutamiento protegido
│   │   └── ProtectedRoute.tsx  # Guard de rutas privadas basado en sesión de usuario
│   ├── services/               # Integración con servicios externos
│   │   ├── emailService.ts     # Cliente para consumir /api/send-email
│   │   ├── firebase.ts         # Inicialización resiliente de Firebase (Auth + Firestore)
│   │   └── taskService.ts      # CRUD completo con Firestore y respaldo local
│   ├── types/                  # Definiciones de TypeScript e interfaces (Task, TaskInput, etc.)
│   ├── App.tsx                 # Configuración del Router y ErrorBoundary
│   ├── index.css               # Design system profesional Vanilla CSS (Mobile First)
│   └── main.tsx                # Punto de entrada de React
├── tests/                      # Suite de pruebas automatizadas
│   ├── components/             # Pruebas de integración de componentes
│   │   ├── TodoForm.test.tsx
│   │   └── TodoList.test.tsx
│   ├── unit/                   # Pruebas unitarias
│   │   ├── emailTemplate.test.ts
│   │   └── taskService.test.ts
│   └── setup.ts                # Configuración global de Vitest y Jest-DOM matchers
├── .env.example                # Plantilla de variables de entorno
├── .gitignore                  # Exclusión estricta de .env y node_modules
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## ✨ 3. Funcionalidades Principales

### 🔐 Autenticación y Seguridad
- **Registro y Login**: Soporte para Email/Password y Google OAuth vía Firebase Auth.
- **Manejo de Errores Amigable**: Traducción y adaptación de códigos de error de Firebase a mensajes claros en español.
- **Rutas Protegidas**: [`ProtectedRoute.tsx`](src/routes/ProtectedRoute.tsx) previene el acceso no autorizado a las tareas antes de iniciar sesión.
- **Aislamiento por Usuario**: Cada usuario únicamente puede leer, crear, modificar o eliminar sus propias tareas (`userId` indexado).
- **Modo Demo Resiliente**: Si el proyecto se ejecuta sin variables de entorno de Firebase, la aplicación activa automáticamente un modo local de demostración para evitar pantallas en blanco y permitir probar toda la interfaz.

### 📋 CRUD Completo de Tareas
- **Create**: Creación con título, descripción, prioridad (Baja, Media, Alta) y fecha de vencimiento.
- **Read**: Listado persistente con cálculo automático de estadísticas ejecutivas (Total, Completadas, Pendientes, Alta Prioridad, % de Progreso).
- **Update**:
  - Marcado rápido de completada/pendiente con actualización visual inmediata.
  - Edición completa de tareas a través de [`EditTaskModal.tsx`](src/components/EditTaskModal.tsx).
- **Delete**: Eliminación segura con confirmación previa.
- **Reordenamiento**: Drag & Drop con `@dnd-kit` persistido en el orden de la base de datos.

### 🔍 Filtros y Búsqueda
- Búsqueda en tiempo real por texto (título y descripción).
- Filtro por estado: *Todas*, *Pendientes*, *Completadas*.
- Filtro por prioridad: *Alta*, *Media*, *Baja*.
- Detección visual de tareas vencidas.

### 📧 Envío de Resúmenes por Email con AWS SES
- Botón en el dashboard: **"Enviar Resumen"**.
- Invoca la función serverless en `/api/send-email`.
- Las credenciales de AWS (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`) se ejecutan únicamente en el entorno serverless y **nunca se exponen en el navegador**.
- Generación de un correo HTML responsivo con tabla de tareas, chips de prioridad y métricas, además de una versión de texto plano.

---

## 🛠️ 4. Instalación y Ejecución Local

### Prerrequisitos
- Node.js versión 18 o superior.
- Gestor de paquetes `npm` (incluido con Node).

### Pasos de instalación:
1. Clonar o abrir el repositorio en tu terminal:
   ```bash
   cd "2.0 Borrador de P.I Modulo 4"
   ```

2. Instalar dependencias:
   ```bash
   npm install
   ```

3. Configurar variables de entorno:
   Copia el archivo [`.env.example`](.env.example) y renómbralo a `.env`:
   ```bash
   cp .env.example .env
   ```
   Rellena tus credenciales de Firebase en `.env`.

4. Iniciar el servidor de desarrollo local:
   ```bash
   npm run dev
   ```
   Abre [http://localhost:5173/](http://localhost:5173/) o el puerto indicado en tu terminal.

---

## 🧪 5. Ejecución de Pruebas Automatizadas

La aplicación cuenta con 15 pruebas automatizadas organizadas con Vitest y React Testing Library:

Ejecutar la suite completa de pruebas:
```bash
npm test
```

Ejecutar pruebas en modo observador (watch mode):
```bash
npm run test:watch
```

Verificar la compilación de producción con TypeScript:
```bash
npm run build
```

---

## 🔑 6. Configuración de Variables de Entorno

Consulta el archivo [`.env.example`](.env.example) para ver la plantilla completa.

### Variables en el Frontend (Vite):
Deben empezar con el prefijo `VITE_`:
```env
VITE_FIREBASE_API_KEY=tu_api_key_aqui
VITE_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu_proyecto_id
VITE_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_messaging_sender_id
VITE_FIREBASE_APP_ID=tu_app_id
```

### Variables en Vercel Serverless (AWS SES):
Se configuran en el panel de Vercel (**Project Settings > Environment Variables**):
```env
AWS_ACCESS_KEY_ID=tu_aws_access_key_id
AWS_SECRET_ACCESS_KEY=tu_aws_secret_access_key
AWS_REGION=us-east-1
AWS_SES_SENDER_EMAIL=remitente_verificado@tudominio.com
```

> **Nota sobre AWS SES**:
> Asegúrate de haber verificado la identidad del correo remitente (`AWS_SES_SENDER_EMAIL`) en la consola de AWS SES. Si tu cuenta se encuentra en el modo *Sandbox* de AWS SES, el correo destinatario también debe estar verificado o debes solicitar la salida a producción (*Production Access*) en AWS.

---

## 🌐 7. Despliegue en Vercel

1. Sube tu código a un repositorio de GitHub (el archivo `.gitignore` ya excluye `.env`).
2. Entra en [Vercel](https://vercel.com/) y selecciona **Add New > Project**.
3. Importa tu repositorio de GitHub.
4. En la sección **Environment Variables**, añade las variables descritas arriba.
5. Haz clic en **Deploy**.

---

## 🤖 8. Integración de la IA en el Proceso de Desarrollo

Durante la construcción de este proyecto, la Inteligencia Artificial se integró como un compañero de programación en parejas (*AI Pair Programmer*) de alto nivel:

- **Auditoría y Diagnóstico de Raíz**: Fue determinante para identificar que la causa de la "pantalla en blanco" era una excepción no capturada en tiempo de evaluación de módulos cuando Firebase no recibía claves válidas, permitiendo implementar un patrón de contingencia resiliente con `ErrorBoundary`.
- **Diseño Arquitectónico**: Aceleró la estructuración limpia de los servicios desacoplados (`taskService`, `emailService`), garantizando la separación de responsabilidades y tipado estricto con TypeScript.
- **Testing Exhaustivo**: Permitió diseñar rápidamente casos de prueba para validaciones de formulario, filtrado de tareas en tiempo real y generación de plantillas de correo para AWS SES.
- **Seguridad**: Aseguró que las claves de AWS SES jamás fueran expuestas en el bundle del cliente, canalizándolas a través de una función serverless Vercel Functions.
