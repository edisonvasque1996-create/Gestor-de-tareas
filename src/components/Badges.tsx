import type { FC } from "react";
import type { PriorityLevel, TaskCategory, TaskState } from "../types/task";

export const CATEGORY_CONFIG: Record<TaskCategory, { label: string; color: string; bg: string; border: string; icon: string }> = {
    trabajo: {
        label: "Trabajo",
        color: "#38bdf8",
        bg: "rgba(56, 189, 248, 0.12)",
        border: "rgba(56, 189, 248, 0.25)",
        icon: "💼",
    },
    personal: {
        label: "Personal",
        color: "#34d399",
        bg: "rgba(52, 211, 153, 0.12)",
        border: "rgba(52, 211, 153, 0.25)",
        icon: "🌱",
    },
    estudios: {
        label: "Estudios",
        color: "#a78bfa",
        bg: "rgba(167, 139, 250, 0.12)",
        border: "rgba(167, 139, 250, 0.25)",
        icon: "📚",
    },
    casa: {
        label: "Casa",
        color: "#fb923c",
        bg: "rgba(251, 146, 60, 0.12)",
        border: "rgba(251, 146, 60, 0.25)",
        icon: "🏠",
    },
};

export const PRIORITY_CONFIG: Record<PriorityLevel, { label: string; color: string; bg: string; border: string; dot: string }> = {
    alta: {
        label: "Alta",
        color: "#f87171",
        bg: "rgba(248, 113, 113, 0.12)",
        border: "rgba(248, 113, 113, 0.25)",
        dot: "#ef4444",
    },
    media: {
        label: "Media",
        color: "#fbbf24",
        bg: "rgba(251, 191, 36, 0.12)",
        border: "rgba(251, 191, 36, 0.25)",
        dot: "#f59e0b",
    },
    baja: {
        label: "Baja",
        color: "#4ade80",
        bg: "rgba(74, 222, 128, 0.12)",
        border: "rgba(74, 222, 128, 0.25)",
        dot: "#10b981",
    },
};

export const STATUS_CONFIG: Record<TaskState, { label: string; color: string; bg: string }> = {
    pendiente: {
        label: "Pendiente",
        color: "#94a3b8",
        bg: "rgba(148, 163, 184, 0.12)",
    },
    en_progreso: {
        label: "En progreso",
        color: "#38bdf8",
        bg: "rgba(56, 189, 248, 0.14)",
    },
    completada: {
        label: "Completada",
        color: "#34d399",
        bg: "rgba(52, 211, 153, 0.14)",
    },
};

export const CategoryBadge: FC<{ category?: TaskCategory; size?: "sm" | "md" }> = ({
    category = "trabajo",
    size = "sm",
}) => {
    const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.trabajo;
    return (
        <span
            className={`badge category-badge category-badge-${category} badge-${size}`}
            style={{
                backgroundColor: config.bg,
                color: config.color,
                borderColor: config.border,
            }}
            title={`Categoría: ${config.label}`}
        >
            <span className="badge-dot" style={{ backgroundColor: config.color }} />
            {config.label}
        </span>
    );
};

export const PriorityBadge: FC<{ priority?: PriorityLevel; size?: "sm" | "md" }> = ({
    priority = "media",
    size = "sm",
}) => {
    const config = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.media;
    return (
        <span
            className={`badge priority-badge priority-badge-${priority} badge-${size}`}
            style={{
                backgroundColor: config.bg,
                color: config.color,
                borderColor: config.border,
            }}
            title={`Prioridad: ${config.label}`}
        >
            <span className="badge-dot" style={{ backgroundColor: config.dot }} />
            {config.label}
        </span>
    );
};

export const StatusBadge: FC<{ status?: TaskState }> = ({ status = "pendiente" }) => {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.pendiente;
    return (
        <span
            className={`badge status-badge status-badge-${status}`}
            style={{
                backgroundColor: config.bg,
                color: config.color,
            }}
            title={`Estado: ${config.label}`}
        >
            {config.label}
        </span>
    );
};
