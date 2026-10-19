import type { FC } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Task } from "../types/task";
import { CategoryBadge, PriorityBadge, StatusBadge } from "./Badges";

interface TaskCardProps {
    task: Task;
    onToggleComplete: (id: string, completed: boolean) => void;
    onEdit: (task: Task) => void;
    onDelete: (id: string) => void;
    onViewDetails?: (task: Task) => void;
    isDraggable?: boolean;
}

export const TaskCard: FC<TaskCardProps> = ({
    task,
    onToggleComplete,
    onEdit,
    onDelete,
    onViewDetails,
    isDraggable = true,
}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: task.id,
        disabled: !isDraggable,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
    };

    // Calcular si la tarea está vencida: no completada, con dueDate previa a hoy
    const isOverdue = Boolean(
        !task.completed &&
        task.dueDate &&
        new Date(task.dueDate + "T23:59:59").getTime() < Date.now()
    );

    // Calcular si es para hoy
    const isToday = Boolean(
        task.dueDate &&
        new Date(task.dueDate + "T00:00:00").toDateString() === new Date().toDateString()
    );

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onToggleComplete(task.id, e.target.checked);
    };

    return (
        <article
            ref={setNodeRef}
            style={style}
            className={`modern-task-card ${task.completed ? "is-completed" : ""} ${
                isOverdue ? "is-overdue" : ""
            } ${isDragging ? "is-dragging" : ""}`}
            data-testid={`task-card-${task.id}`}
        >
            <div className="card-main-content">
                {/* Drag Handle */}
                {isDraggable && (
                    <button
                        type="button"
                        {...attributes}
                        {...listeners}
                        className="card-drag-handle"
                        title="Arrastrar para reorganizar orden"
                        aria-label={`Reordenar tarea ${task.title}`}
                    >
                        ⋮⋮
                    </button>
                )}

                {/* Custom Checkbox (con área táctil cómoda >= 44px) */}
                <div className="card-checkbox-wrapper">
                    <input
                        type="checkbox"
                        id={`check-${task.id}`}
                        checked={task.completed}
                        onChange={handleCheckboxChange}
                        className="card-native-checkbox"
                        aria-label={`Marcar como completada: ${task.title}`}
                    />
                    <label htmlFor={`check-${task.id}`} className="card-custom-checkbox">
                        {task.completed && <span className="check-icon">✓</span>}
                    </label>
                </div>

                {/* Task Body */}
                <div className="card-text-body" onClick={() => onViewDetails?.(task)}>
                    <div className="card-title-row">
                        <h3 className={`card-title ${task.completed ? "title-strike" : ""}`}>
                            {task.title}
                        </h3>
                    </div>

                    {task.description && (
                        <p className="card-description">
                            {task.description}
                        </p>
                    )}

                    {/* Metadata & Badges */}
                    <div className="card-meta-chips">
                        {/* Categoría */}
                        <CategoryBadge category={task.category || "trabajo"} />

                        {/* Prioridad */}
                        <PriorityBadge priority={task.priority} />

                        {/* Estado (solo si está en progreso o completada) */}
                        {task.status === "en_progreso" && (
                            <StatusBadge status="en_progreso" />
                        )}

                        {/* Fecha Límite */}
                        {task.dueDate && (
                            <span
                                className={`date-badge ${isOverdue ? "date-badge-overdue" : ""} ${
                                    isToday ? "date-badge-today" : ""
                                }`}
                                title={
                                    isOverdue
                                        ? "Tarea vencida"
                                        : isToday
                                        ? "Vence el día de hoy"
                                        : `Vence el ${task.dueDate}`
                                }
                            >
                                {isOverdue ? "⚠️ Vencida: " : isToday ? "⭐ Hoy: " : "📅 "}
                                {task.dueDate}
                                {task.dueTime ? ` · ${task.dueTime}` : ""}
                            </span>
                        )}
                    </div>
                </div>

                {/* Actions Toolbar */}
                <div className="card-actions-wrapper">
                    {/* Botón Ver Detalles */}
                    <button
                        type="button"
                        onClick={() => onViewDetails?.(task)}
                        className="btn-card-action btn-view"
                        title="Ver detalles de la tarea"
                        aria-label={`Ver detalles de ${task.title}`}
                    >
                        👁️
                    </button>

                    {/* Botón Editar */}
                    <button
                        type="button"
                        onClick={() => onEdit(task)}
                        className="btn-card-action btn-edit"
                        title="Editar tarea"
                        aria-label={`Editar tarea ${task.title}`}
                    >
                        ✏️
                    </button>

                    {/* Botón Eliminar */}
                    <button
                        type="button"
                        onClick={() => onDelete(task.id)}
                        className="btn-card-action btn-delete"
                        title="Eliminar tarea"
                        aria-label={`Eliminar tarea ${task.title}`}
                    >
                        🗑️
                    </button>
                </div>
            </div>
        </article>
    );
};
