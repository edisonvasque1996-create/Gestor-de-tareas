import { type FC } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Task } from "../types/task";
import { CategoryBadge, PriorityBadge, StatusBadge } from "./Badges";

interface TodoItemProps {
    task: Task;
    onToggleComplete: (id: string, completed: boolean) => void;
    onEdit: (task: Task) => void;
    onDelete: (id: string) => void;
    onViewDetails?: (task: Task) => void;
}

export const TodoItem: FC<TodoItemProps> = ({
    task,
    onToggleComplete,
    onEdit,
    onDelete,
    onViewDetails,
}) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: task.id,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
    };

    // Comprobar si la tarea está vencida
    const isOverdue = Boolean(
        !task.completed &&
        task.dueDate &&
        new Date(task.dueDate + "T23:59:59").getTime() < Date.now()
    );

    const isToday = Boolean(
        task.dueDate &&
        new Date(task.dueDate + "T00:00:00").toDateString() === new Date().toDateString()
    );

    return (
        <article
            ref={setNodeRef}
            style={style}
            className={`task-card modern-task-card ${task.completed ? "task-completed is-completed" : ""} ${
                isOverdue ? "is-overdue" : ""
            } ${isDragging ? "task-dragging is-dragging" : ""}`}
            data-testid={`task-item-${task.id}`}
        >
            <div className="task-content-wrapper">
                {/* Drag Handle */}
                <button
                    type="button"
                    {...attributes}
                    {...listeners}
                    className="drag-handle card-drag-handle"
                    title="Arrastrar para reordenar"
                    aria-label={`Reordenar tarea ${task.title}`}
                >
                    ⋮⋮
                </button>

                {/* Checkbox táctil */}
                <div className="task-checkbox-container">
                    <input
                        type="checkbox"
                        id={`task-check-${task.id}`}
                        checked={task.completed}
                        onChange={(e) => onToggleComplete(task.id, e.target.checked)}
                        className="task-checkbox"
                        aria-label={`Marcar como completada: ${task.title}`}
                    />
                    <label htmlFor={`task-check-${task.id}`} className="task-checkbox-custom">
                        {task.completed && <span className="check-mark">✓</span>}
                    </label>
                </div>

                {/* Info */}
                <div className="task-body" onClick={() => onViewDetails?.(task)}>
                    <label
                        htmlFor={`task-check-${task.id}`}
                        className={`task-title ${task.completed ? "title-strike" : ""}`}
                    >
                        {task.title}
                    </label>

                    {task.description && (
                        <p className="task-description">{task.description}</p>
                    )}

                    <div className="task-meta">
                        {/* Categoría */}
                        <CategoryBadge category={task.category || "trabajo"} />

                        {/* Prioridad */}
                        <PriorityBadge priority={task.priority} />

                        {/* Estado */}
                        {task.status === "en_progreso" && (
                            <StatusBadge status="en_progreso" />
                        )}

                        {/* Fecha */}
                        {task.dueDate && (
                            <span
                                className={`date-chip ${isOverdue ? "date-overdue" : ""} ${
                                    isToday ? "date-today" : ""
                                }`}
                            >
                                {isOverdue ? "⚠️ Vencida: " : isToday ? "⭐ Hoy: " : "📅 "}
                                {task.dueDate}
                                {task.dueTime ? ` · ${task.dueTime}` : ""}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Acciones */}
            <div className="task-actions">
                {onViewDetails && (
                    <button
                        type="button"
                        onClick={() => onViewDetails(task)}
                        className="btn-action btn-view"
                        title="Ver detalles"
                        aria-label={`Ver detalles de ${task.title}`}
                    >
                        👁️
                    </button>
                )}

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
        </article>
    );
};