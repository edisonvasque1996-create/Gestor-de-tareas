import type { FC } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Task } from "../types/task";

interface TodoItemProps {
    task: Task;
    onToggleComplete: (id: string, completed: boolean) => void;
    onEdit: (task: Task) => void;
    onDelete: (id: string) => void;
}

export const TodoItem: FC<TodoItemProps> = ({ task, onToggleComplete, onEdit, onDelete }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const getPriorityBadge = (priority: string) => {
        switch (priority) {
            case "alta":
                return { label: "Alta", bg: "#fef2f2", text: "#dc2626", border: "#fecaca" };
            case "media":
                return { label: "Media", bg: "#fffbeb", text: "#d97706", border: "#fde68a" };
            case "baja":
                return { label: "Baja", bg: "#f0fdf4", text: "#16a34a", border: "#bbf7d0" };
            default:
                return { label: priority, bg: "#f8fafc", text: "#64748b", border: "#e2e8f0" };
        }
    };

    const priorityBadge = getPriorityBadge(task.priority);

    // Comprobar si la tarea está vencida
    const isOverdue = Boolean(
        !task.completed &&
        task.dueDate &&
        new Date(task.dueDate + "T23:59:59").getTime() < Date.now()
    );

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`task-card ${task.completed ? "task-completed" : ""} ${isDragging ? "task-dragging" : ""}`}
        >
            <div className="task-content-wrapper">
                {/* Drag Handle */}
                <button
                    type="button"
                    {...attributes}
                    {...listeners}
                    className="drag-handle"
                    title="Arrastrar para reordenar"
                    aria-label="Reordenar tarea"
                >
                    ⠿
                </button>

                {/* Checkbox */}
                <input
                    type="checkbox"
                    id={`task-check-${task.id}`}
                    checked={task.completed}
                    onChange={(e) => onToggleComplete(task.id, e.target.checked)}
                    className="task-checkbox"
                    aria-label={`Marcar como completada: ${task.title}`}
                />

                {/* Info */}
                <div className="task-body">
                    <label htmlFor={`task-check-${task.id}`} className="task-title">
                        {task.title}
                    </label>

                    {task.description && (
                        <p className="task-description">{task.description}</p>
                    )}

                    <div className="task-meta">
                        <span
                            className="priority-chip"
                            style={{
                                backgroundColor: priorityBadge.bg,
                                color: priorityBadge.text,
                                borderColor: priorityBadge.border,
                            }}
                        >
                            ● {priorityBadge.label}
                        </span>

                        {task.dueDate && (
                            <span className={`date-chip ${isOverdue ? "date-overdue" : ""}`}>
                                📅 {task.dueDate} {isOverdue && "(Vencida)"}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Acciones */}
            <div className="task-actions">
                <button
                    type="button"
                    onClick={() => onEdit(task)}
                    className="btn-action btn-edit"
                    title="Editar tarea"
                    aria-label={`Editar tarea ${task.title}`}
                >
                    ✏️ Editar
                </button>

                <button
                    type="button"
                    onClick={() => onDelete(task.id)}
                    className="btn-action btn-delete"
                    title="Eliminar tarea"
                    aria-label={`Eliminar tarea ${task.title}`}
                >
                    🗑️
                </button>
            </div>
        </div>
    );
};