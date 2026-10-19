import { useEffect, type FC } from "react";
import type { TaskInput } from "../types/task";
import { TodoForm } from "./TodoForm";

interface TaskFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddTask: (task: TaskInput) => Promise<void>;
    initialDate?: string;
}

export const TaskFormModal: FC<TaskFormModalProps> = ({
    isOpen,
    onClose,
    onAddTask,
    initialDate = "",
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

    if (!isOpen) return null;

    const handleSave = async (task: TaskInput) => {
        await onAddTask(task);
        onClose();
    };

    return (
        <div
            className="modal-backdrop"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-label="Modal para crear nueva tarea"
        >
            <div
                className="modal-card modal-sheet-mobile"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="sheet-drag-handle" aria-hidden="true" />
                <TodoForm
                    onAddTask={handleSave}
                    initialDate={initialDate}
                    onCancel={onClose}
                    isModalMode={true}
                />
            </div>
        </div>
    );
};
