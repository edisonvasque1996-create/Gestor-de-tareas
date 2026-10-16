import { useState, type FC, type FormEvent, useEffect } from "react";
import type { PriorityLevel, Task, TaskUpdateInput } from "../types/task";

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
    const [dueDate, setDueDate] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (task) {
            setTitle(task.title);
            setDescription(task.description || "");
            setPriority(task.priority || "media");
            setDueDate(task.dueDate || "");
            setError("");
        }
    }, [task]);

    if (!isOpen || !task) return null;

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!title.trim()) {
            setError("El título de la tarea es obligatorio.");
            return;
        }

        try {
            setSaving(true);
            setError("");
            await onSave(task.id, {
                title: title.trim(),
                description: description.trim(),
                priority,
                dueDate,
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
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(15, 23, 42, 0.6)",
                backdropFilter: "blur(4px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1000,
                padding: "16px",
            }}
            onClick={onClose}
        >
            <div
                className="modal-card"
                style={{
                    backgroundColor: "#ffffff",
                    borderRadius: "16px",
                    width: "100%",
                    maxWidth: "500px",
                    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                    overflow: "hidden",
                    border: "1px solid #e2e8f0",
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div style={{
                    padding: "20px 24px",
                    borderBottom: "1px solid #f1f5f9",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}>
                    <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "700", color: "#0f172a" }}>
                        ✏️ Editar Tarea Estratégica
                    </h3>
                    <button
                        onClick={onClose}
                        style={{
                            background: "transparent",
                            border: "none",
                            fontSize: "20px",
                            color: "#94a3b8",
                            cursor: "pointer",
                            padding: "4px 8px",
                            borderRadius: "6px",
                        }}
                    >
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={{ padding: "24px" }}>
                    {error && (
                        <div style={{
                            padding: "10px 14px",
                            backgroundColor: "#fef2f2",
                            border: "1px solid #fee2e2",
                            color: "#b91c1c",
                            borderRadius: "8px",
                            fontSize: "13px",
                            marginBottom: "16px",
                        }}>
                            {error}
                        </div>
                    )}

                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        <div>
                            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
                                Título de la tarea *
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Título claro y accionable"
                                required
                                style={{
                                    width: "100%",
                                    boxSizing: "border-box",
                                    padding: "10px 14px",
                                    borderRadius: "8px",
                                    border: "1px solid #cbd5e1",
                                    fontSize: "14px",
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
                                Descripción
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Detalles, objetivos o notas relevantes..."
                                rows={3}
                                style={{
                                    width: "100%",
                                    boxSizing: "border-box",
                                    padding: "10px 14px",
                                    borderRadius: "8px",
                                    border: "1px solid #cbd5e1",
                                    fontSize: "14px",
                                    fontFamily: "inherit",
                                    resize: "vertical",
                                }}
                            />
                        </div>

                        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                            <div style={{ flex: 1, minWidth: "160px" }}>
                                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
                                    Prioridad
                                </label>
                                <select
                                    value={priority}
                                    onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                                    style={{
                                        width: "100%",
                                        boxSizing: "border-box",
                                        padding: "10px 14px",
                                        borderRadius: "8px",
                                        border: "1px solid #cbd5e1",
                                        fontSize: "14px",
                                        backgroundColor: "#fff",
                                    }}
                                >
                                    <option value="baja">🟢 Baja</option>
                                    <option value="media">🟡 Media</option>
                                    <option value="alta">🔴 Alta</option>
                                </select>
                            </div>

                            <div style={{ flex: 1, minWidth: "160px" }}>
                                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
                                    Fecha de vencimiento
                                </label>
                                <input
                                    type="date"
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                    style={{
                                        width: "100%",
                                        boxSizing: "border-box",
                                        padding: "10px 14px",
                                        borderRadius: "8px",
                                        border: "1px solid #cbd5e1",
                                        fontSize: "14px",
                                    }}
                                />
                            </div>
                        </div>

                        <div style={{
                            display: "flex",
                            justifyContent: "flex-end",
                            gap: "12px",
                            marginTop: "8px",
                            paddingTop: "16px",
                            borderTop: "1px solid #f1f5f9",
                        }}>
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={saving}
                                style={{
                                    padding: "9px 18px",
                                    borderRadius: "8px",
                                    border: "1px solid #cbd5e1",
                                    backgroundColor: "#ffffff",
                                    color: "#475569",
                                    fontWeight: 600,
                                    fontSize: "14px",
                                    cursor: "pointer",
                                }}
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                style={{
                                    padding: "9px 20px",
                                    borderRadius: "8px",
                                    border: "none",
                                    backgroundColor: "#2563eb",
                                    color: "#ffffff",
                                    fontWeight: 600,
                                    fontSize: "14px",
                                    cursor: saving ? "not-allowed" : "pointer",
                                    boxShadow: "0 2px 4px rgba(37, 99, 235, 0.2)",
                                }}
                            >
                                {saving ? "Guardando..." : "Guardar Cambios"}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};
