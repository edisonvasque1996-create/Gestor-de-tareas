import {
    createContext,
    useContext,
    useEffect,
    useState,
    type FC,
    type ReactNode,
} from "react";
import {
    type User,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    signOut,
    onAuthStateChanged,
} from "firebase/auth";
import { auth, googleProvider, isFirebaseConfigured } from "../services/firebase";

// ─────────────────────────────────────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────────────────────────────────────
export interface CustomUser {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL?: string | null;
}

interface AuthContextType {
    user: User | CustomUser | null;
    loading: boolean;
    isCloudReady: boolean;
    loginWithEmail:    (email: string, pass: string) => Promise<void>;
    registerWithEmail: (email: string, pass: string) => Promise<void>;
    loginWithGoogle:   () => Promise<void>;
    logout:            () => Promise<void>;
    getFriendlyErrorMessage: (errorCode: string) => string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Utilidad: mensajes de error legibles para el usuario
// ─────────────────────────────────────────────────────────────────────────────
export const getFriendlyAuthError = (errorCodeOrMessage: string): string => {
    if (!errorCodeOrMessage) return "Ha ocurrido un error inesperado.";
    if (errorCodeOrMessage.includes("auth/email-already-in-use"))
        return "Este correo ya está registrado. Por favor, inicia sesión con tus credenciales.";
    if (errorCodeOrMessage.includes("auth/invalid-email"))
        return "El formato del correo electrónico no es válido.";
    if (errorCodeOrMessage.includes("auth/weak-password"))
        return "La contraseña debe tener al menos 6 caracteres.";
    if (errorCodeOrMessage.includes("auth/user-not-found"))
        return "No existe ninguna cuenta con este correo electrónico.";
    if (
        errorCodeOrMessage.includes("auth/wrong-password") ||
        errorCodeOrMessage.includes("auth/invalid-credential")
    )
        return "Correo o contraseña incorrectos. Por favor, verifica tus datos.";
    if (errorCodeOrMessage.includes("auth/popup-closed-by-user"))
        return "Se cerró la ventana emergente antes de completar el inicio de sesión con Google.";
    if (errorCodeOrMessage.includes("auth/network-request-failed"))
        return "Fallo de conexión a la red. Por favor, verifica tu conexión a internet.";
    if (errorCodeOrMessage.includes("auth/too-many-requests"))
        return "Demasiados intentos fallidos. Por seguridad, espera unos momentos antes de reintentar.";
    if (errorCodeOrMessage.includes("auth/configuration-not-found") ||
        errorCodeOrMessage.includes("auth/invalid-api-key"))
        return "Configuración de Firebase no encontrada. Verifica las variables de entorno VITE_FIREBASE_*.";
    return errorCodeOrMessage;
};

// ─────────────────────────────────────────────────────────────────────────────
// Contexto de Autenticación
// ─────────────────────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser]       = useState<User | CustomUser | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        if (!isFirebaseConfigured) {
            // Credenciales no configuradas: la app no puede funcionar en modo nube.
            // Se mantiene loading=false para que el ProtectedRoute redirija al login,
            // donde se muestra el aviso de configuración pendiente.
            console.warn(
                "[Auth] Variables de entorno de Firebase no configuradas.\n" +
                "Copia .env.example como .env y añade tus credenciales de Firebase."
            );
            setUser(null);
            setLoading(false);
            return;
        }

        // Suscripción al estado de autenticación de Firebase
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // ── Iniciar sesión con email/contraseña ───────────────────────────────────
    const loginWithEmail = async (email: string, pass: string): Promise<void> => {
        if (!email.trim() || !pass.trim()) {
            throw new Error("Por favor ingresa tanto el correo como la contraseña.");
        }
        if (!isFirebaseConfigured) {
            throw new Error(
                "Firebase no está configurado. Añade tus credenciales en el archivo .env."
            );
        }
        await signInWithEmailAndPassword(auth, email, pass);
    };

    // ── Registrar cuenta nueva ────────────────────────────────────────────────
    const registerWithEmail = async (email: string, pass: string): Promise<void> => {
        if (!email.trim() || !pass.trim()) {
            throw new Error("Por favor completa todos los campos para el registro.");
        }
        if (pass.length < 6) {
            throw new Error("La contraseña debe tener un mínimo de 6 caracteres.");
        }
        if (!isFirebaseConfigured) {
            throw new Error(
                "Firebase no está configurado. Añade tus credenciales en el archivo .env."
            );
        }
        await createUserWithEmailAndPassword(auth, email, pass);
    };

    // ── Inicio de sesión con Google ───────────────────────────────────────────
    const loginWithGoogle = async (): Promise<void> => {
        if (!isFirebaseConfigured) {
            throw new Error(
                "Firebase no está configurado. Añade tus credenciales en el archivo .env."
            );
        }
        await signInWithPopup(auth, googleProvider);
    };

    // ── Cerrar sesión ─────────────────────────────────────────────────────────
    const logout = async (): Promise<void> => {
        if (isFirebaseConfigured) {
            await signOut(auth);
        }
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                isCloudReady: isFirebaseConfigured,
                loginWithEmail,
                registerWithEmail,
                loginWithGoogle,
                logout,
                getFriendlyErrorMessage: getFriendlyAuthError,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth debe ser usado dentro de un AuthProvider");
    }
    return context;
};