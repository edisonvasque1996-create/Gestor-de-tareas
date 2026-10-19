import { useEffect, type FC } from "react";

interface ConfirmDialogProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export const ConfirmDialog: FC<ConfirmDialogProps> = ({
    isOpen,
    title,
    message,
    confirmText = "Eliminar",
    cancelText = "Cancelar",
    onConfirm,
    onCancel,
}) => {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen) {
                onCancel();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onCancel]);

    if (!isOpen) return null;

    return (
        <div
            className="modal-backdrop"
            onClick={onCancel}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-dialog-title"
            aria-describedby="confirm-dialog-desc"
        >
            <div
                className="modal-card confirm-dialog-card"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="confirm-icon-box">🗑️</div>
                <h3 id="confirm-dialog-title" className="confirm-title">
                    {title}
                </h3>
                <p id="confirm-dialog-desc" className="confirm-message">
                    {message}
                </p>

                <div className="confirm-actions-row">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="btn-modal-cancel"
                        autoFocus
                    >
                        {cancelText}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        className="btn-action-danger"
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};
