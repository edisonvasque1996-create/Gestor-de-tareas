import type { FC } from "react";

export interface ToastData {
    id: string;
    text: string;
    type: "success" | "error" | "info";
}

interface ToastProps {
    toast: ToastData | null;
    onClose: () => void;
}

export const Toast: FC<ToastProps> = ({ toast, onClose }) => {
    if (!toast) return null;

    const getIcon = () => {
        switch (toast.type) {
            case "success":
                return "✓";
            case "error":
                return "⚠️";
            case "info":
                return "ℹ️";
        }
    };

    return (
        <div
            className={`toast-notification toast-${toast.type}`}
            role="status"
            aria-live="polite"
        >
            <div className="toast-icon-circle">{getIcon()}</div>
            <span className="toast-message-text">{toast.text}</span>
            <button
                type="button"
                onClick={onClose}
                className="toast-close-btn"
                aria-label="Cerrar notificación"
            >
                ✕
            </button>
        </div>
    );
};
