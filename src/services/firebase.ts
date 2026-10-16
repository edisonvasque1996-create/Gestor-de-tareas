import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

// Verificación de variables de entorno para evitar pantalla en blanco en ausencia de .env
const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;

export const isFirebaseConfigured = Boolean(
    apiKey &&
    projectId &&
    apiKey !== "tu_api_key_aqui" &&
    projectId !== "tu_project_id_aqui"
);

const firebaseConfig = {
    apiKey: apiKey || "AIzaSyDummyKeyForFallbackMode123456789",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "gestor-tareas-demo.firebaseapp.com",
    projectId: projectId || "gestor-tareas-demo",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "gestor-tareas-demo.appspot.com",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789012",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789012:web:abcdef123456",
};

let app: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;

try {
    if (getApps().length === 0) {
        app = initializeApp(firebaseConfig);
    } else {
        app = getApps()[0];
    }

    if (isFirebaseConfigured) {
        authInstance = getAuth(app);
        dbInstance = getFirestore(app);
    }
} catch (error) {
    console.warn("[Firebase] No se pudo conectar con Firebase en la nube. Activando modo local de contingencia:", error);
}

export const auth = authInstance;
export const googleProvider = new GoogleAuthProvider();
export const db = dbInstance;
export { app };