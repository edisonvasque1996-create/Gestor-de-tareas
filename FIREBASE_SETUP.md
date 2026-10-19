# 🔥 Guía de Configuración Firebase — Gestor Estratégico de Tareas

> Sigue estos pasos para conectar la aplicación a Firebase Authentication y Cloud Firestore.

---

## 1. Crear el proyecto Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com) e inicia sesión con tu cuenta Google.
2. Haz clic en **"Agregar proyecto"** y ponle un nombre (ej. `gestor-tareas`).
3. Desactiva Google Analytics si no lo necesitas y haz clic en **"Crear proyecto"**.

---

## 2. Registrar la app web

1. En la pantalla de inicio del proyecto, haz clic en el ícono `</>` (Web).
2. Asigna un nombre a la app (ej. `gestor-tareas-web`) y haz clic en **"Registrar app"**.
3. **Copia** el objeto `firebaseConfig` que aparece — lo necesitarás en el siguiente paso.

---

## 3. Configurar las variables de entorno

1. En la raíz del proyecto, el archivo `.env` ya existe. Simplemente reemplaza cada valor con los datos de tu `firebaseConfig`:

   | Variable en `.env`                     | Campo en `firebaseConfig` |
   |----------------------------------------|---------------------------|
   | `VITE_FIREBASE_API_KEY`                | `apiKey`                  |
   | `VITE_FIREBASE_AUTH_DOMAIN`            | `authDomain`              |
   | `VITE_FIREBASE_PROJECT_ID`             | `projectId`               |
   | `VITE_FIREBASE_STORAGE_BUCKET`         | `storageBucket`           |
   | `VITE_FIREBASE_MESSAGING_SENDER_ID`    | `messagingSenderId`       |
   | `VITE_FIREBASE_APP_ID`                 | `appId`                   |

2. Guarda el archivo. **No lo subas al repositorio** (ya está en `.gitignore`).

---

## 4. Habilitar Firebase Authentication

1. En Firebase Console, ve a **"Authentication"** en el menú lateral.
2. Haz clic en **"Comenzar"**.
3. En la pestaña **"Sign-in method"**, habilita los proveedores que desees:
   - **Correo electrónico/contraseña** → Activar → Guardar
   - **Google** → Activar → elige tu email de soporte → Guardar

---

## 5. Crear la base de datos Firestore

1. Ve a **"Firestore Database"** en el menú lateral.
2. Haz clic en **"Crear base de datos"**.
3. Selecciona la ubicación más cercana a ti (ej. `us-central1` o `southamerica-east1`).
4. Elige **"Iniciar en modo de producción"** (aplicaremos las reglas manualmente).
5. Haz clic en **"Listo"**.

---

## 6. Aplicar las Reglas de Seguridad de Firestore

Las reglas garantizan que **cada usuario solo accede a sus propias tareas**.

1. En Firestore Console, ve a la pestaña **"Reglas"**.
2. Reemplaza el contenido con el del archivo `firestore.rules` en la raíz del proyecto.
3. Haz clic en **"Publicar"**.

---

## 7. Crear el índice compuesto en Firestore (requerido para las consultas)

La query del `taskService` usa `where("userId", "==", uid)` + `orderBy("order", "asc")`.
Firestore necesita un índice compuesto para esta combinación.

**Opción A — Automática (recomendada):**
Al ejecutar la app por primera vez, la consola del navegador mostrará un enlace directo para crear el índice. Haz clic en él y confirma.

**Opción B — Manual:**
1. En Firestore Console → **"Índices"** → **"Índices compuestos"** → **"Agregar índice"**.
2. Colección: `tasks`
3. Campos:
   - `userId` → Ascendente
   - `order` → Ascendente
4. Haz clic en **"Crear"**.

---

## 8. Ejecutar la aplicación

```bash
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173) y crea tu primera cuenta. Los datos se guardarán en la nube automáticamente con actualizaciones en tiempo real.

---

## 9. Ejecutar los tests

```bash
npm run test
```

Los tests usan mocks de Firestore y corren sin necesidad de credenciales reales.

---

## Estructura de datos en Firestore

```
tasks/                         (colección)
  └── {taskId}                 (documento — ID generado por Firestore)
        ├── userId: string     ← UID del propietario (aislamiento estricto)
        ├── title: string
        ├── description: string
        ├── completed: boolean
        ├── priority: "baja" | "media" | "alta"
        ├── category: "trabajo" | "personal" | "estudios" | "casa"
        ├── status: "pendiente" | "en_progreso" | "completada"
        ├── dueDate: string    ← formato YYYY-MM-DD
        ├── dueTime: string    ← formato HH:mm (opcional)
        ├── order: number      ← índice para drag & drop
        ├── createdAt: number  ← timestamp Unix (ms)
        └── updatedAt: number  ← timestamp Unix (ms)
```

---

> **Tip:** Para desplegar en producción, añade las mismas variables `VITE_FIREBASE_*` en el dashboard de tu plataforma (Vercel, Netlify, etc.) como variables de entorno de producción.
