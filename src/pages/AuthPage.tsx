import { useState, type FC, type FormEvent } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

export const AuthPage: FC = () => {
    const [isRegistering, setIsRegistering] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { loginWithEmail, registerWithEmail, loginWithGoogle, getFriendlyErrorMessage, isCloudReady } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError("");

        if (!email.trim() || !password.trim()) {
            setError("Por favor completa tu correo y contraseña.");
            return;
        }

        try {
            setLoading(true);
            if (isRegistering) {
                await registerWithEmail(email, password);
            } else {
                await loginWithEmail(email, password);
            }
            navigate("/");
        } catch (err: any) {
            setError(getFriendlyErrorMessage(err.code || err.message));
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setError("");
        try {
            setLoading(true);
            await loginWithGoogle();
            navigate("/");
        } catch (err: any) {
            setError(getFriendlyErrorMessage(err.code || err.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page-container">
            <div className="auth-card">
                {/* Brand Header */}
                <div className="auth-brand">
                    <div className="auth-logo-badge">⚡</div>
                    <h1 className="auth-title">MateCode</h1>
                    <p className="auth-subtitle">Gestor Estratégico de Tareas</p>
                </div>

                {!isCloudReady && (
                    <div className="auth-demo-notice">
                        💡 <strong>Modo Demo / Local Activo:</strong> Puedes ingresar cualquier correo y contraseña para explorar la aplicación de inmediato sin necesidad de crear cuenta previa en Firebase.
                    </div>
                )}

                {/* Tab Switcher */}
                <div className="auth-tabs" role="tablist">
                    <button
                        type="button"
                        role="tab"
                        aria-selected={!isRegistering}
                        onClick={() => { setIsRegistering(false); setError(""); }}
                        className={`auth-tab ${!isRegistering ? "active" : ""}`}
                    >
                        Iniciar Sesión
                    </button>
                    <button
                        type="button"
                        role="tab"
                        aria-selected={isRegistering}
                        onClick={() => { setIsRegistering(true); setError(""); }}
                        className={`auth-tab ${isRegistering ? "active" : ""}`}
                    >
                        Crear Cuenta
                    </button>
                </div>

                {error && (
                    <div className="alert-banner alert-error" role="alert">
                        <span>⚠️ {error}</span>
                        <button type="button" onClick={() => setError("")} className="alert-close">✕</button>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="input-group">
                        <label htmlFor="auth-email-input" className="input-label">
                            Correo Electrónico
                        </label>
                        <input
                            id="auth-email-input"
                            type="email"
                            placeholder="nombre@empresa.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="text-input"
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="auth-password-input" className="input-label">
                            Contraseña
                        </label>
                        <input
                            id="auth-password-input"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                            className="text-input"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary btn-block"
                    >
                        {loading ? "Procesando..." : isRegistering ? "Registrarse en MateCode" : "Entrar a mi Cuenta"}
                    </button>
                </form>

                <div className="auth-divider">
                    <span>o continúa con</span>
                </div>

                <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="btn-google"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24">
                        <path
                            fill="#4285F4"
                            d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                        />
                        <path
                            fill="#34A853"
                            d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                        />
                        <path
                            fill="#FBBC05"
                            d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 10.03 0 12s.45 3.83 1.25 5.42l4.03-3.15z"
                        />
                        <path
                            fill="#EA4335"
                            d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                        />
                    </svg>
                    <span>Google</span>
                </button>
            </div>
        </div>
    );
};
