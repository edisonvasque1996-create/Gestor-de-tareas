import { useEffect, type FC } from "react";
import type { Task } from "../types/task";
import { CategoryBadge, PriorityBadge, StatusBadge } from "./Badges";

interface TaskDetailsModalProps {
    task: Task | null;
    isOpen: boolean;
    onClose: () => void;
    onEdit: (task: Task) => void;
    onToggleComplete: (id: string, completed: boolean) => void;
    onDelete: (id: string) => void;
}

export const TaskDetailsModal: FC<TaskDetailsModalProps> = ({
    task,
    isOpen,
    onClose,
    onEdit,
    onToggleComplete,
    onDelete,
}) => {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen) {
                onClose();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen || !task) return null;

    const isOverdue = Boolean(
        !task.completed &&
        task.dueDate &&
        new Date(task.dueDate + "T23:59:59").getTime() < Date.now()
    );

    const formattedCreated = new Intl.DateTimeFormat("es-ES", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(task.createdAt));

    return (
        <div
            className="modal-backdrop"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="details-modal-title"
        >
            <div
                className="modal-card modal-sheet-mobile"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="sheet-drag-handle" aria-hidden="true" />

                <div className="modal-header">
                    <div className="modal-header-title-box">
                        <span className="modal-icon">📋</span>
                        <h3 id="details-modal-title" className="modal-title">
                            Detalles de la Tarea
                        </h3>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="modal-close-btn"
                        aria-label="Cerrar modal de detalles"
                    >
                        ✕
                    </button>
                </div>

                <div className="modal-body-details">
                    {/* Status & Badges */}
                    <div className="details-badges-row">
                        <CategoryBadge category={task.category || "trabajo"} size="md" />
                        <PriorityBadge priority={task.priority} size="md" />
                        <StatusBadge status={task.status || (task.completed ? "completada" : "pendiente")} />
                    </div>

                    {/* Title */}
                    <h2 className={`details-title ${task.completed ? "title-strike" : ""}`}>
                        {task.title}
                    </h2>

                    {/* Description */}
                    {task.description ? (
                        <div className="details-description-box">
                            <h4 className="details-section-label">Descripción</h4>
                            <p className="details-description-text">{task.description}</p>
                        </div>
                    ) : (
                        <p className="details-description-empty">Sin descripción adicional.</p>
                    )}

                    {/* Meta Info Grid */}
                    <div className="details-meta-grid">
                        <div className="details-meta-item">
                            <span className="details-meta-label">Fecha límite:</span>
                            <span
                                className={`details-meta-value ${
                                    isOverdue ? "text-danger-highlight" : ""
                                }`}
                            >
                                {task.dueDate ? `📅 ${task.dueDate}` : "Sin fecha asignada"}
                                {task.dueTime ? ` (${task.dueTime})` : ""}
                                {isOverdue && " — ¡Vencida!"}
                            </span>
                        </div>

                        <div className="details-meta-item">
                            <span className="details-meta-label">Fecha de creación:</span>
                            <span className="details-meta-value">⏱️ {formattedCreated}</span>
                        </div>
                    </div>

                    {/* Actions Footer */}
                    <div className="details-actions-footer">
                        <button
                            type="button"
                            onClick={() => {
                                onToggleComplete(task.id, !task.completed);
                            }}
                            className={`btn-action-primary ${
                                task.completed ? "btn-undo-complete" : "btn-mark-complete"
                            }`}
                        >
                            {task.completed ? "Marcar como pendiente" : "✓ Marcar como completada"}
                        </button>

                        <div className="details-secondary-actions">
                            <button
                                type="button"
                                onClick={() => {
                                    onClose();
                                    onEdit(task);
                                }}
                                className="btn-modal-cancel"
                            >
                                ✏️ Editar
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    onDelete(task.id);
                                    onClose();
                                }}
                                className="btn-action-danger"
                            >
                                🗑️ Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
