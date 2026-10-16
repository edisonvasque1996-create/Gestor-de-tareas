import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("[ErrorBoundary] Error capturado:", error, errorInfo);
    }

    private handleReload = () => {
        window.location.reload();
    };

    private handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    public render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    minHeight: "100vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "24px",
                    background: "#0f172a",
                    color: "#f8fafc",
                    fontFamily: "system-ui, -apple-system, sans-serif"
                }}>
                    <div style={{
                        maxWidth: "520px",
                        width: "100%",
                        background: "#1e293b",
                        border: "1px solid #334155",
                        borderRadius: "12px",
                        padding: "32px",
                        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5)",
                        textAlign: "center"
                    }}>
                        <div style={{
                            width: "56px",
                            height: "56px",
                            borderRadius: "50%",
                            background: "rgba(239, 68, 68, 0.15)",
                            color: "#ef4444",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            margin: "0 auto 16px",
                            fontSize: "28px"
                        }}>
                            ⚠️
                        </div>
                        <h2 style={{ margin: "0 0 8px", fontSize: "22px", fontWeight: 700 }}>
                            Ha ocurrido un error inesperado
                        </h2>
                        <p style={{ margin: "0 0 20px", color: "#94a3b8", fontSize: "14px", lineHeight: "1.5" }}>
                            La aplicación encontró un problema inesperado. No te preocupes, tus datos no se han perdido.
                        </p>
                        {this.state.error && (
                            <pre style={{
                                textAlign: "left",
                                background: "#0f172a",
                                padding: "12px",
                                borderRadius: "6px",
                                fontSize: "12px",
                                color: "#fca5a5",
                                overflowX: "auto",
                                marginBottom: "20px"
                            }}>
                                {this.state.error.message}
                            </pre>
                        )}
                        <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
                            <button
                                onClick={this.handleReset}
                                style={{
                                    padding: "10px 18px",
                                    background: "#334155",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                    fontWeight: 600,
                                    fontSize: "14px"
                                }}
                            >
                                Intentar de nuevo
                            </button>
                            <button
                                onClick={this.handleReload}
                                style={{
                                    padding: "10px 18px",
                                    background: "#3b82f6",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                    fontWeight: 600,
                                    fontSize: "14px"
                                }}
                            >
                                Recargar página
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
