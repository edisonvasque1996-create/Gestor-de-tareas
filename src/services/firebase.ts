import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { GoogleAuthProvider } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

// ─────────────────────────────────────────────────────────────────────────────
// Configuración de Firebase leída desde variables de entorno (Vite)
// Asegúrate de definir estas variables en tu archivo .env local o en el
// Dashboard de tu plataforma de despliegue (Vercel / Netlify / etc.)
// ─────────────────────────────────────────────────────────────────────────────
const firebaseConfig = {
    apiKey:            import.meta.env.VITE_FIREBASE_API_KEY            as string,
    authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN        as string,
    projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID         as string,
    storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET     as string,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string,
    appId:             import.meta.env.VITE_FIREBASE_APP_ID             as string,
};

// ─────────────────────────────────────────────────────────────────────────────
// Validación: detecta si las variables de entorno reales están presentes.
// Esto permite mostrar un mensaje de error claro en lugar de un fallo silencioso.
// ─────────────────────────────────────────────────────────────────────────────
export const isFirebaseConfigured: boolean = Boolean(
    firebaseConfig.apiKey &&
    firebaseConfig.projectId &&
    !firebaseConfig.apiKey.startsWith("tu_") &&
    !firebaseConfig.projectId.startsWith("tu_")
);

// ─────────────────────────────────────────────────────────────────────────────
// Inicialización del SDK de Firebase (singleton — evita registrar la app dos veces)
// ─────────────────────────────────────────────────────────────────────────────
const app: FirebaseApp = getApps().length === 0
    ? initializeApp(firebaseConfig)
    : getApps()[0];

// ─────────────────────────────────────────────────────────────────────────────
// Instancias de los servicios que la aplicación usa
// ─────────────────────────────────────────────────────────────────────────────
export const auth: Auth             = getAuth(app);
export const db: Firestore          = getFirestore(app);
export const googleProvider         = new GoogleAuthProvider();

export { app };