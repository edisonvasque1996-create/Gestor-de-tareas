import { useEffect, useState, useMemo, type FC } from "react";
import { useAuth } from "../hooks/useAuth";
import type { Task, TaskInput, TaskSummary, TaskUpdateInput } from "../types/task";
import { getTasksByUser, createTask, updateTask, deleteTask, reorderTasks } from "../services/taskService";
import { sendTaskSummaryEmail } from "../services/emailService";
import { TodoForm } from "../components/TodoForm";
import { TodoList } from "../components/TodoList";
import { EditTaskModal } from "../components/EditTaskModal";

export const TasksPage: FC = () => {
    const { user, logout, isCloudReady } = useAuth();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // Estado para envío de correo con AWS SES
    const [sendingEmail, setSendingEmail] = useState(false);
    const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);

    const showToast = (text: string, type: "success" | "error" | "info" = "success") => {
        setToastMessage({ text, type });
        setTimeout(() => setToastMessage(null), 5000);
    };

    // Cargar tareas al montar el componente
    useEffect(() => {
        if (user) {
            loadTasks();
        }
    }, [user]);

    const loadTasks = async () => {
        if (!user) return;
        try {
            setLoading(true);
            const userTasks = await getTasksByUser(user.uid);
            setTasks(userTasks);
        } catch (error: any) {
            console.error("Error cargando tareas:", error);
            showToast("No se pudieron cargar las tareas desde el servidor.", "error");
        } finally {
            setLoading(false);
        }
    };

    // 1. CREATE
    const handleAddTask = async (taskData: TaskInput) => {
        if (!user) return;
        const newTask = await createTask(user.uid, taskData, tasks.length);
        setTasks((prev) => [...prev, newTask]);
        showToast("✓ Tarea creada exitosamente.", "success");
    };

    // 2. TOGGLE COMPLETE
    const handleToggleComplete = async (id: string, completed: boolean) => {
        if (!user) return;
        setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed } : t)));
        try {
            await updateTask(id, { completed }, user.uid);
            showToast(completed ? "✓ Tarea completada." : "Tarea marcada como pendiente.", "info");
        } catch {
            showToast("Error al actualizar estado en la nube.", "error");
            loadTasks();
        }
    };

    // 3. EDIT (UPDATE)
    const handleOpenEdit = (task: Task) => {
        setEditingTask(task);
        setIsEditModalOpen(true);
    };

    const handleSaveEdit = async (taskId: string, updates: TaskUpdateInput) => {
        if (!user) return;
        await updateTask(taskId, updates, user.uid);
        setTasks((prev) =>
            prev.map((t) => (t.id === taskId ? { ...t, ...updates, updatedAt: Date.now() } : t))
        );
        showToast("✓ Tarea actualizada correctamente.", "success");
    };

    // 4. DELETE
    const handleDelete = async (id: string) => {
        if (!user) return;
        if (!window.confirm("¿Seguro que deseas eliminar esta tarea permanentemente?")) return;

        setTasks((prev) => prev.filter((t) => t.id !== id));
        try {
            await deleteTask(id, user.uid);
            showToast("Tarea eliminada.", "info");
        } catch {
            showToast("Error al eliminar la tarea en el servidor.", "error");
            loadTasks();
        }
    };

    // 5. REORDER (DRAG & DROP)
    const handleReorder = async (newTasks: Task[]) => {
        if (!user) return;
        setTasks(newTasks);
        try {
            await reorderTasks(newTasks, user.uid);
        } catch {
            console.warn("Fallo temporal sincronizando orden en segundo plano.");
        }
    };

    // KPI / Resumen de métricas
    const summary: TaskSummary = useMemo(() => {
        const total = tasks.length;
        const completed = tasks.filter((t) => t.completed).length;
        const pending = total - completed;
        const highPriority = tasks.filter((t) => t.priority === "alta" && !t.completed).length;
        const overdue = tasks.filter(
            (t) => !t.completed && t.dueDate && new Date(t.dueDate + "T23:59:59").getTime() < Date.now()
        ).length;

        return { total, completed, pending, highPriority, overdue };
    }, [tasks]);

    // ENVÍO DE EMAIL CON AWS SES
    const handleSendEmailSummary = async () => {
        if (!user || !user.email) {
            showToast("No se detectó un correo electrónico válido para enviar el resumen.", "error");
            return;
        }

        try {
            setSendingEmail(true);
            const result = await sendTaskSummaryEmail({
                toEmail: user.email,
                userName: user.displayName || user.email.split("@")[0],
                tasks,
                summary,
            });

            showToast(result.message, result.isSimulated ? "info" : "success");
        } catch (err: any) {
            console.error("Error enviando email:", err);
            showToast(err.message || "Error al invocar el servicio de correo AWS SES.", "error");
        } finally {
            setSendingEmail(false);
        }
    };

    const completionPercent = summary.total > 0 ? Math.round((summary.completed / summary.total) * 100) : 0;

    return (
        <div className="dashboard-container">
            {/* Toast Notification */}
            {toastMessage && (
                <div className={`toast-notification toast-${toastMessage.type}`} role="alert">
                    <span>{toastMessage.text}</span>
                    <button type="button" onClick={() => setToastMessage(null)} className="toast-close">✕</button>
                </div>
            )}

            {/* Banner de Estado de Conexión a la Nube */}
            {!isCloudReady && (
                <div className="setup-banner">
                    <span className="setup-badge">Modo Local / Demo</span>
                    <p className="setup-text">
                        La aplicación está funcionando en modo local offline (datos en tu navegador). Para activar <strong>Cloud Firestore y Firebase Auth</strong> en producción, añade tus credenciales en el archivo <code>.env</code>.
                    </p>
                </div>
            )}

            {/* Header de la Aplicación */}
            <header className="app-header">
                <div className="header-brand">
                    <div className="brand-logo">⚡</div>
                    <div>
                        <h1 className="brand-title">Gestor Estratégico de Tareas</h1>
                        <span className="brand-org">MateCode · Productividad Inteligente</span>
                    </div>
                </div>

                <div className="header-user-section">
                    <div className="user-info-box">
                        <span className="user-name">{user?.displayName || "Usuario"}</span>
                        <span className="user-email">{user?.email}</span>
                    </div>

                    <div className="header-actions">
                        <button
                            type="button"
                            onClick={handleSendEmailSummary}
                            disabled={sendingEmail || tasks.length === 0}
                            className="btn-email-summary"
                            title="Enviar resumen completo a tu correo vía AWS SES"
                        >
                            {sendingEmail ? "Enviando vía AWS SES..." : "📧 Enviar Resumen"}
                        </button>

                        <button
                            type="button"
                            onClick={logout}
                            className="btn-logout"
                            title="Cerrar sesión actual"
                        >
                            Cerrar Sesión
                        </button>
                    </div>
                </div>
            </header>

            {/* Métricas y Resumen Ejecutivo */}
            <section className="stats-grid" aria-label="Métricas de productividad">
                <div className="stat-card">
                    <span className="stat-label">Total Tareas</span>
                    <span className="stat-value">{summary.total}</span>
                    <span className="stat-sub">Registradas</span>
                </div>
                <div className="stat-card stat-success">
                    <span className="stat-label">Completadas</span>
                    <span className="stat-value">{summary.completed}</span>
                    <span className="stat-sub">{completionPercent}% del total</span>
                </div>
                <div className="stat-card stat-warning">
                    <span className="stat-label">Pendientes</span>
                    <span className="stat-value">{summary.pending}</span>
                    <span className="stat-sub">Por ejecutar</span>
                </div>
                <div className="stat-card stat-danger">
                    <span className="stat-label">Alta Prioridad</span>
                    <span className="stat-value">{summary.highPriority}</span>
                    <span className="stat-sub">Urgentes activas</span>
                </div>
            </section>

            {/* Formulario de Creación */}
            <TodoForm onAddTask={handleAddTask} />

            {/* Lista de Tareas y Filtros */}
            {loading ? (
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Sincronizando tareas en la nube...</p>
                </div>
            ) : (
                <TodoList
                    tasks={tasks}
                    onToggleComplete={handleToggleComplete}
                    onEdit={handleOpenEdit}
                    onDelete={handleDelete}
                    onReorder={handleReorder}
                />
            )}

            {/* Modal de Edición de Tarea */}
            <EditTaskModal
                task={editingTask}
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setEditingTask(null);
                }}
                onSave={handleSaveEdit}
            />
        </div>
    );
};