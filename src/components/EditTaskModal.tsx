import { useState, type FC, type FormEvent, useEffect } from "react";
import type { PriorityLevel, Task, TaskCategory, TaskState, TaskUpdateInput } from "../types/task";

interface EditTaskModalProps {
    task: Task | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (taskId: string, updates: TaskUpdateInput) => Promise<void>;
}

export const EditTaskModal: FC<EditTaskModalProps> = ({ task, isOpen, onClose, onSave }) => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState<PriorityLevel>("media");
    const [category, setCategory] = useState<TaskCategory>("trabajo");
    const [status, setStatus] = useState<TaskState>("pendiente");
    const [dueDate, setDueDate] = useState("");
    const [dueTime, setDueTime] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (task) {
            setTitle(task.title);
            setDescription(task.description || "");
            setPriority(task.priority || "media");
            setCategory(task.category || "trabajo");
            setStatus(task.status || (task.completed ? "completada" : "pendiente"));
            setDueDate(task.dueDate || "");
            setDueTime(task.dueTime || "");
            setError("");
        }
    }, [task]);

    // Cerrar con Escape
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

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        const cleanTitle = title.trim();
        if (!cleanTitle) {
            setError("El título de la tarea es obligatorio.");
            return;
        }

        try {
            setSaving(true);
            setError("");
            await onSave(task.id, {
                title: cleanTitle,
                description: description.trim(),
                priority,
                category,
                status,
                completed: status === "completada",
                dueDate,
                dueTime,
            });
            onClose();
        } catch (err: any) {
            setError(err.message || "Error al actualizar la tarea.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div
            className="modal-backdrop"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-modal-title"
        >
            <div
                className="modal-card modal-sheet-mobile"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Mobile Drag Indicator */}
                <div className="sheet-drag-handle" aria-hidden="true" />

                <div className="modal-header">
                    <div className="modal-header-title-box">
                        <span className="modal-icon">✏️</span>
                        <h3 id="edit-modal-title" className="modal-title">
                            Editar Tarea
                        </h3>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="modal-close-btn"
                        aria-label="Cerrar modal de edición"
                    >
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-body-form">
                    {error && (
                        <div className="alert-banner alert-error" role="alert">
                            <span>⚠️ {error}</span>
                        </div>
                    )}

                    <div className="input-group">
                        <label htmlFor="edit-task-title" className="input-label">
                            Título de la tarea <span className="required">*</span>
                        </label>
                        <input
                            id="edit-task-title"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Título claro y accionable"
                            required
                            className="text-input"
                            autoFocus
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="edit-task-desc" className="input-label">
                            Descripción y notas
                        </label>
                        <textarea
                            id="edit-task-desc"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Detalles, notas, objetivos o enlaces relevantes..."
                            rows={3}
                            className="textarea-input"
                        />
                    </div>

                    <div className="form-row-2col">
                        <div className="input-group">
                            <label htmlFor="edit-task-category" className="input-label">
                                Categoría
                            </label>
                            <select
                                id="edit-task-category"
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

                        <div className="input-group">
                            <label htmlFor="edit-task-priority" className="input-label">
                                Prioridad
                            </label>
                            <select
                                id="edit-task-priority"
                                value={priority}
                                onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                                className="select-input"
                            >
                                <option value="baja">🟢 Baja</option>
                                <option value="media">🟡 Media</option>
                                <option value="alta">🔴 Alta</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-row-2col">
                        <div className="input-group">
                            <label htmlFor="edit-task-status" className="input-label">
                                Estado de la tarea
                            </label>
                            <select
                                id="edit-task-status"
                                value={status}
                                onChange={(e) => setStatus(e.target.value as TaskState)}
                                className="select-input"
                            >
                                <option value="pendiente">⚪ Pendiente</option>
                                <option value="en_progreso">🔵 En progreso</option>
                                <option value="completada">🟢 Completada</option>
                            </select>
                        </div>

                        <div className="input-group">
                            <label htmlFor="edit-task-duedate" className="input-label">
                                Fecha de vencimiento
                            </label>
                            <input
                                id="edit-task-duedate"
                                type="date"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                                className="text-input"
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <label htmlFor="edit-task-duetime" className="input-label">
                            Hora límite (opcional)
                        </label>
                        <input
                            id="edit-task-duetime"
                            type="time"
                            value={dueTime}
                            onChange={(e) => setDueTime(e.target.value)}
                            className="text-input"
                        />
                    </div>

                    <div className="modal-actions-footer">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={saving}
                            className="btn-modal-cancel"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={saving || !title.trim()}
                            className="btn-modal-save"
                        >
                            {saving ? "Guardando..." : "Guardar Cambios"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
