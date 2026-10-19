import { useState, type FC, type FormEvent } from "react";
import type { PriorityLevel, TaskCategory, TaskInput, TaskState } from "../types/task";

interface TodoFormProps {
    onAddTask: (task: TaskInput) => Promise<void>;
    initialDate?: string;
    onCancel?: () => void;
    isModalMode?: boolean;
}

export const TodoForm: FC<TodoFormProps> = ({
    onAddTask,
    initialDate = "",
    onCancel,
    isModalMode = false,
}) => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState<PriorityLevel>("media");
    const [category, setCategory] = useState<TaskCategory>("trabajo");
    const [status, setStatus] = useState<TaskState>("pendiente");
    const [dueDate, setDueDate] = useState(initialDate);
    const [dueTime, setDueTime] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [isExpanded, setIsExpanded] = useState(isModalMode);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (loading) return;
        const cleanTitle = title.trim();

        if (!cleanTitle) {
            setError("Por favor ingresa un título para la tarea.");
            return;
        }

        if (cleanTitle.length > 120) {
            setError("El título no debe superar los 120 caracteres.");
            return;
        }

        try {
            setLoading(true);
            setError("");
            await onAddTask({
                title: cleanTitle,
                description: description.trim(),
                priority,
                category,
                status,
                dueDate,
                dueTime,
            });

            // Limpieza
            setTitle("");
            setDescription("");
            setPriority("media");
            setCategory("trabajo");
            setStatus("pendiente");
            setDueDate(initialDate);
            setDueTime("");
            if (!isModalMode) {
                setIsExpanded(false);
            }
        } catch (err: any) {
            setError(err.message || "No se pudo guardar la tarea. Intenta nuevamente.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className={`task-form-card ${isModalMode ? "form-in-modal" : ""}`}
            role="form"
            aria-label="Crear nueva tarea"
        >
            <div className="form-header">
                <div>
                    <h3 className="form-title">⚡ Nueva Tarea Estratégica</h3>
                    <span className="form-subtitle">Planifica, prioriza y ejecuta con claridad</span>
                </div>
                {onCancel && isModalMode && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="modal-close-btn"
                        aria-label="Cerrar formulario"
                    >
                        ✕
                    </button>
                )}
            </div>

            {error && (
                <div className="alert-banner alert-error" role="alert">
                    <span>⚠️ {error}</span>
                    <button type="button" onClick={() => setError("")} className="alert-close">
                        ✕
                    </button>
                </div>
            )}

            <div className="form-fields">
                <div className="input-group">
                    <label htmlFor="task-title-input" className="input-label">
                        Título de la tarea <span className="required">*</span>
                    </label>
                    <input
                        id="task-title-input"
                        type="text"
                        placeholder="Ej. Diseñar arquitectura de base de datos..."
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        onFocus={() => setIsExpanded(true)}
                        required
                        className="text-input"
                        autoFocus={isModalMode}
                    />
                </div>

                {/* Campos expandibles / siempre visibles en modal */}
                {(isExpanded || description || dueDate || priority !== "media" || category !== "trabajo") && (
                    <>
                        <div className="input-group">
                            <label htmlFor="task-desc-input" className="input-label">
                                Descripción y notas adicionales
                            </label>
                            <textarea
                                id="task-desc-input"
                                placeholder="Criterios de aceptación, enlaces, notas de contexto..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={2}
                                className="textarea-input"
                            />
                        </div>

                        <div className="form-row-2col">
                            {/* Categoría */}
                            <div className="input-group">
                                <label htmlFor="task-category-select" className="input-label">
                                    Categoría
                                </label>
                                <select
                                    id="task-category-select"
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value as TaskCategory)}
                                    className="select-input"
                                >
                                    <option value="trabajo">💼 Trabajo</option>
                                    <option value="personal">🌱 Personal</option>
                                    <option value="estudios">📚 Estudios</option>
                                    <option value="casa">🏠 Casa</option>
                                </select>
                            </div>

                            {/* Prioridad */}
                            <div className="input-group">
                                <label htmlFor="task-priority-select" className="input-label">
                                    Nivel de Prioridad
                                </label>
                                <select
                                    id="task-priority-select"
                                    value={priority}
                                    onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                                    className="select-input"
                                >
                                    <option value="baja">🟢 Baja prioridad</option>
                                    <option value="media">🟡 Media prioridad</option>
                                    <option value="alta">🔴 Alta prioridad</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-row-2col">
                            {/* Estado inicial */}
                            <div className="input-group">
                                <label htmlFor="task-status-select" className="input-label">
                                    Estado
                                </label>
                                <select
                                    id="task-status-select"
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value as TaskState)}
                                    className="select-input"
                                >
                                    <option value="pendiente">⚪ Pendiente</option>
                                    <option value="en_progreso">🔵 En progreso</option>
                                    <option value="completada">🟢 Completada</option>
                                </select>
                            </div>

                            {/* Fecha Límite */}
                            <div className="input-group">
                                <label htmlFor="task-date-input" className="input-label">
                                    Fecha límite de entrega
                                </label>
                                <input
                                    id="task-date-input"
                                    type="date"
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                    className="text-input"
                                />
                            </div>
                        </div>

                        {/* Hora opcional */}
                        <div className="input-group">
                            <label htmlFor="task-time-input" className="input-label">
                                Hora límite (opcional)
                            </label>
                            <input
                                id="task-time-input"
                                type="time"
                                value={dueTime}
                                onChange={(e) => setDueTime(e.target.value)}
                                className="text-input"
                            />
                        </div>
                    </>
                )}

                <div className="form-submit-row">
                    {onCancel && isModalMode ? (
                        <button
                            type="button"
                            onClick={onCancel}
                            disabled={loading}
                            className="btn-text"
                        >
                            Cancelar
                        </button>
                    ) : (
                        isExpanded && (
                            <button
                                type="button"
                                onClick={() => setIsExpanded(false)}
                                className="btn-text"
                            >
                                Menos opciones
                            </button>
                        )
                    )}

                    <button
                        type="submit"
                        disabled={loading || !title.trim()}
                        className="btn-primary"
                    >
                        {loading ? "Guardando..." : "＋ Agregar Tarea"}
                    </button>
                </div>
            </div>
        </form>
    );
};