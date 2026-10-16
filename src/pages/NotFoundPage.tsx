import type { FC } from "react";
import { Link } from "react-router-dom";

export const NotFoundPage: FC = () => {
    return (
        <div style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            background: "#f8fafc",
            fontFamily: "system-ui, -apple-system, sans-serif",
            textAlign: "center"
        }}>
            <div style={{
                maxWidth: "460px",
                padding: "40px",
                background: "#ffffff",
                borderRadius: "16px",
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)",
                border: "1px solid #e2e8f0"
            }}>
                <div style={{ fontSize: "64px", fontWeight: "900", color: "#3b82f6", lineHeight: 1, marginBottom: "16px" }}>
                    404
                </div>
                <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#1e293b", margin: "0 0 10px" }}>
                    Página no encontrada
                </h1>
                <p style={{ color: "#64748b", fontSize: "15px", lineHeight: "1.5", margin: "0 0 24px" }}>
                    La ruta a la que intentas acceder no existe o fue movida.
                </p>
                <Link
                    to="/"
                    style={{
                        display: "inline-block",
                        padding: "10px 24px",
                        background: "#2563eb",
                        color: "#ffffff",
                        textDecoration: "none",
                        borderRadius: "8px",
                        fontWeight: "600",
                        fontSize: "14px",
                        boxShadow: "0 4px 6px -1px rgba(37, 99, 235, 0.2)"
                    }}
                >
                    Volver al Inicio
                </Link>
            </div>
        </div>
    );
};
