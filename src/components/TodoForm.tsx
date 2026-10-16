import { useState, type FC, type FormEvent } from "react";
import type { PriorityLevel, TaskInput } from "../types/task";

interface TodoFormProps {
    onAddTask: (task: TaskInput) => Promise<void>;
}

export const TodoForm: FC<TodoFormProps> = ({ onAddTask }) => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState<PriorityLevel>("media");
    const [dueDate, setDueDate] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [isExpanded, setIsExpanded] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
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
                dueDate,
            });

            // Limpieza
            setTitle("");
            setDescription("");
            setPriority("media");
            setDueDate("");
            setIsExpanded(false);
        } catch (err: any) {
            setError(err.message || "No se pudo guardar la tarea. Intenta nuevamente.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="task-form-card" aria-label="Crear nueva tarea">
            <div className="form-header">
                <h3 className="form-title">⚡ Nueva Tarea Estratégica</h3>
                <span className="form-subtitle">Planifica, prioriza y ejecuta con claridad</span>
            </div>

            {error && (
                <div className="alert-banner alert-error" role="alert">
                    <span>⚠️ {error}</span>
                    <button type="button" onClick={() => setError("")} className="alert-close">✕</button>
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
                    />
                </div>

                {/* Campos expandibles para una experiencia ágil */}
                {(isExpanded || description || dueDate || priority !== "media") && (
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
                    </>
                )}

                <div className="form-submit-row">
                    {isExpanded && (
                        <button
                            type="button"
                            onClick={() => setIsExpanded(false)}
                            className="btn-text"
                        >
                            Menos opciones
                        </button>
                    )}
                    <button
                        type="submit"
                        disabled={loading || !title.trim()}
                        className="btn-primary"
                    >
                        {loading ? "Guardando en la nube..." : "＋ Agregar Tarea"}
                    </button>
                </div>
            </div>
        </form>
    );
};