import { useEffect, useState, useMemo, useRef, type FC } from "react";
import { useAuth } from "../hooks/useAuth";
import type {
    SortOption,
    Task,
    TaskFilterStatus,
    TaskInput,
    TaskSummary as TaskSummaryType,
    TaskUpdateInput,
} from "../types/task";
import {
    subscribeToUserTasks,
    createTask,
    updateTask,
    deleteTask,
    reorderTasks,
} from "../services/taskService";
import { sendTaskSummaryEmail } from "../services/emailService";
import { Sidebar } from "../components/Sidebar";
import { BottomNavigation } from "../components/BottomNavigation";
import { TaskHeader } from "../components/TaskHeader";
import { TaskSummary } from "../components/TaskSummary";
import { TaskFilters } from "../components/TaskFilters";
import { TodoList } from "../components/TodoList";
import { CalendarPanel } from "../components/CalendarPanel";
import { ProfileView } from "../components/ProfileView";
import { TaskFormModal } from "../components/TaskFormModal";
import { EditTaskModal } from "../components/EditTaskModal";
import { TaskDetailsModal } from "../components/TaskDetailsModal";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { Toast, type ToastData } from "../components/Toast";

export const TasksPage: FC = () => {
    const { user, logout, isCloudReady } = useAuth();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    // Navegación de pestañas principales (SPA)
    const [activeTab, setActiveTab] = useState<"tasks" | "calendar" | "profile">("tasks");

    // Filtros y ordenamiento
    const [statusFilter, setStatusFilter] = useState<TaskFilterStatus>("todas");
    const [categoryFilter, setCategoryFilter] = useState<string>("todas");
    const [priorityFilter, setPriorityFilter] = useState<string>("todas");
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [sortBy, setSortBy] = useState<SortOption>("dueDate");

    // Panel de calendario en escritorio (colapsable a la derecha)
    const [isCalendarOpen, setIsCalendarOpen] = useState<boolean>(true);

    // Modales
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [createInitialDate, setCreateInitialDate] = useState("");
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [viewingDetailsTask, setViewingDetailsTask] = useState<Task | null>(null);
    const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);

    // Email AWS SES y Toast feedback
    const [sendingEmail, setSendingEmail] = useState(false);
    const [toast, setToast] = useState<ToastData | null>(null);

    const showToast = (text: string, type: "success" | "error" | "info" = "success") => {
        const id = Math.random().toString(36).substring(2, 9);
        setToast({ id, text, type });
        setTimeout(() => {
            setToast((current) => (current?.id === id ? null : current));
        }, 4500);
    };

    // Referencia a la función de cancelación de la suscripción en tiempo real
    const unsubscribeRef = useRef<(() => void) | null>(null);

    // Suscripción en tiempo real a Firestore — se actualiza automáticamente
    useEffect(() => {
        // Cancelar suscripción anterior si el usuario cambia
        if (unsubscribeRef.current) {
            unsubscribeRef.current();
            unsubscribeRef.current = null;
        }

        if (!user) {
            setTasks([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        unsubscribeRef.current = subscribeToUserTasks(
            user.uid,
            (updatedTasks) => {
                setTasks(updatedTasks);
                setLoading(false);
            },
            (error) => {
                console.error("Error en suscripción Firestore:", error);
                showToast("No se pudieron cargar las tareas en tiempo real.", "error");
                setLoading(false);
            }
        );

        // Limpiar suscripción al desmontar o cambiar usuario
        return () => {
            unsubscribeRef.current?.();
        };
    }, [user]);


    // 1. CREAR TAREA
    const handleAddTask = async (taskData: TaskInput) => {
        if (!user) return;
        try {
            await createTask(user.uid, taskData, tasks.length);
            // Nota: no hacemos setTasks([...prev, newTask]) manualmente aquí,
            // ya que Firestore onSnapshot (subscribeToUserTasks) sincroniza y actualiza
            // el estado en tiempo real automáticamente, evitando tareas duplicadas.
            showToast("✓ Tarea creada exitosamente.", "success");
        } catch (err: any) {
            showToast(err.message || "Error al crear la tarea.", "error");
        }
    };

    // Abrir creación con fecha específica (desde el calendario)
    const handleOpenCreateForDate = (dateStr: string) => {
        setCreateInitialDate(dateStr);
        setIsCreateModalOpen(true);
    };

    // 2. TOGGLE COMPLETAR / PENDIENTE
    const handleToggleComplete = async (id: string, completed: boolean) => {
        if (!user) return;
        setTasks((prev) =>
            prev.map((t) =>
                t.id === id
                    ? {
                          ...t,
                          completed,
                          status: completed ? "completada" : "pendiente",
                          updatedAt: Date.now(),
                      }
                    : t
            )
        );

        if (viewingDetailsTask && viewingDetailsTask.id === id) {
            setViewingDetailsTask((prev) =>
                prev
                    ? {
                          ...prev,
                          completed,
                          status: completed ? "completada" : "pendiente",
                      }
                    : null
            );
        }

        try {
            await updateTask(
                id,
                { completed, status: completed ? "completada" : "pendiente" }
            );
            showToast(completed ? "✓ Tarea completada." : "Tarea marcada como pendiente.", "info");
        } catch {
            showToast("Error actualizando tarea.", "error");
        }
    };

    // 3. EDITAR TAREA
    const handleOpenEdit = (task: Task) => {
        setEditingTask(task);
        setIsEditModalOpen(true);
    };

    const handleSaveEdit = async (taskId: string, updates: TaskUpdateInput) => {
        if (!user) return;
        try {
            await updateTask(taskId, updates);
            // El onSnapshot actualizará el estado automáticamente
            if (viewingDetailsTask && viewingDetailsTask.id === taskId) {
                setViewingDetailsTask((prev) =>
                    prev ? { ...prev, ...updates, updatedAt: Date.now() } : null
                );
            }
            showToast("✓ Tarea actualizada correctamente.", "success");
        } catch (err: any) {
            showToast(err.message || "Error al actualizar la tarea.", "error");
        }
    };

    // 4. ELIMINAR TAREA
    const handlePromptDelete = (id: string) => {
        setDeletingTaskId(id);
    };

    const handleConfirmDelete = async () => {
        if (!user || !deletingTaskId) return;
        const idToDelete = deletingTaskId;
        setDeletingTaskId(null);

        if (viewingDetailsTask && viewingDetailsTask.id === idToDelete) {
            setViewingDetailsTask(null);
        }

        try {
            await deleteTask(idToDelete);
            showToast("Tarea eliminada.", "info");
        } catch {
            showToast("Error al eliminar la tarea.", "error");
        }
    };

    // 5. REORDENAR (DRAG & DROP)
    const handleReorder = async (newTasks: Task[]) => {
        if (!user) return;
        // Actualización optimista del UI antes de que Firestore confirme
        setTasks(newTasks);
        try {
            await reorderTasks(newTasks);
        } catch {
            console.warn("Fallo temporal sincronizando orden en segundo plano.");
        }
    };

    // 6. ENVIAR RESUMEN POR EMAIL (AWS SES)
    const handleSendEmailSummary = async () => {
        if (!user || !user.email) {
            showToast("No se detectó un correo electrónico válido.", "error");
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
            showToast(err.message || "Error al invocar servicio AWS SES.", "error");
        } finally {
            setSendingEmail(false);
        }
    };

    // Resumen de Métricas (KPIs)
    const summary: TaskSummaryType = useMemo(() => {
        const total = tasks.length;
        const completed = tasks.filter((t) => t.completed).length;
        const pending = tasks.filter((t) => !t.completed).length;
        const inProgress = tasks.filter((t) => t.status === "en_progreso" && !t.completed).length;
        const highPriority = tasks.filter((t) => t.priority === "alta" && !t.completed).length;
        const overdue = tasks.filter(
            (t) =>
                !t.completed &&
                t.dueDate &&
                new Date(t.dueDate + "T23:59:59").getTime() < Date.now()
        ).length;

        return { total, completed, pending, inProgress, highPriority, overdue };
    }, [tasks]);

    // Conteos para los botones de filtros
    const filterCounts = useMemo(() => {
        const todayStr = new Date().toISOString().split("T")[0];
        return {
            todas: tasks.length,
            pendientes: tasks.filter((t) => !t.completed).length,
            en_progreso: tasks.filter((t) => t.status === "en_progreso" && !t.completed).length,
            completadas: tasks.filter((t) => t.completed).length,
            hoy: tasks.filter((t) => t.dueDate === todayStr).length,
            proximas: tasks.filter((t) => t.dueDate && t.dueDate > todayStr).length,
            vencidas: tasks.filter(
                (t) =>
                    !t.completed &&
                    t.dueDate &&
                    new Date(t.dueDate + "T23:59:59").getTime() < Date.now()
            ).length,
        };
    }, [tasks]);

    return (
        <div className="spa-app-layout">
            {/* Toast flotante */}
            <Toast toast={toast} onClose={() => setToast(null)} />

            {/* Modal para Crear Nueva Tarea */}
            <TaskFormModal
                isOpen={isCreateModalOpen}
                onClose={() => {
                    setIsCreateModalOpen(false);
                    setCreateInitialDate("");
                }}
                onAddTask={handleAddTask}
                initialDate={createInitialDate}
            />

            {/* Modal para Editar Tarea */}
            <EditTaskModal
                task={editingTask}
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setEditingTask(null);
                }}
                onSave={handleSaveEdit}
            />

            {/* Modal para Ver Detalles de Tarea */}
            <TaskDetailsModal
                task={viewingDetailsTask}
                isOpen={Boolean(viewingDetailsTask)}
                onClose={() => setViewingDetailsTask(null)}
                onEdit={handleOpenEdit}
                onToggleComplete={handleToggleComplete}
                onDelete={handlePromptDelete}
            />

            {/* Diálogo de Confirmación para Eliminar */}
            <ConfirmDialog
                isOpen={Boolean(deletingTaskId)}
                title="¿Eliminar tarea?"
                message="Esta acción no se puede deshacer. La tarea será eliminada permanentemente del gestor."
                confirmText="Sí, eliminar"
                cancelText="Cancelar"
                onConfirm={handleConfirmDelete}
                onCancel={() => setDeletingTaskId(null)}
            />

            {/* =========================================================================
                ZONA 1: BARRA IZQUIERDA (SIDEBAR - ESCRITORIO >= 1024px)
               ========================================================================= */}
            <Sidebar
                activeTab={activeTab}
                onSelectTab={setActiveTab}
                activeCategory={categoryFilter}
                onSelectCategory={setCategoryFilter}
                tasks={tasks}
                user={user}
                onLogout={logout}
            />

            {/* =========================================================================
                ZONA 2: ÁREA CENTRAL (MAIN CONTENT)
               ========================================================================= */}
            <main className="spa-main-content">
                {/* Banner de Modo Demo / Local (discreto y profesional) */}
                {!isCloudReady && (
                    <div className="demo-status-pill-banner">
                        <span className="demo-pill-badge">Modo Demo Local</span>
                        <span className="demo-pill-desc">
                            Datos simulados en memoria · Sincronización instantánea activa
                        </span>
                    </div>
                )}

                {/* VISTA 1: MIS TAREAS */}
                {activeTab === "tasks" && (
                    <div className="tasks-view-wrapper">
                        {/* 6.1. Encabezado */}
                        <TaskHeader
                            onToggleCalendar={() => setIsCalendarOpen((prev) => !prev)}
                            isCalendarOpen={isCalendarOpen}
                            searchQuery={searchQuery}
                            onSearchChange={setSearchQuery}
                            pendingCount={summary.pending}
                        />

                        {/* 6.2. Resumen Visual de Productividad */}
                        <TaskSummary
                            summary={summary}
                            activeFilter={statusFilter}
                            onSelectFilter={(filterType) => setStatusFilter(filterType)}
                        />

                        {/* 6.3 & 9. Filtros, Búsqueda y Ordenamiento */}
                        <TaskFilters
                            statusFilter={statusFilter}
                            onStatusFilterChange={setStatusFilter}
                            categoryFilter={categoryFilter}
                            onCategoryFilterChange={setCategoryFilter}
                            priorityFilter={priorityFilter}
                            onPriorityFilterChange={setPriorityFilter}
                            sortBy={sortBy}
                            onSortByChange={setSortBy}
                            searchQuery={searchQuery}
                            onSearchQueryChange={setSearchQuery}
                            counts={filterCounts}
                        />

                        {/* 6.4. Listado de Tareas con Drag & Drop */}
                        {loading ? (
                            <div className="loading-state-box">
                                <div className="spinner-indicator" />
                                <p>Cargando tareas estratégicas...</p>
                            </div>
                        ) : (
                            <TodoList
                                tasks={tasks}
                                onToggleComplete={handleToggleComplete}
                                onEdit={handleOpenEdit}
                                onDelete={handlePromptDelete}
                                onReorder={handleReorder}
                                onViewDetails={(task) => setViewingDetailsTask(task)}
                                controlledStatus={statusFilter}
                                controlledCategory={categoryFilter}
                                controlledPriority={priorityFilter}
                                controlledSearch={searchQuery}
                                controlledSort={sortBy}
                                hideInternalControls={true}
                            />
                        )}

                        {/* FAB Flotante — Crear Nueva Tarea */}
                        <button
                            type="button"
                            onClick={() => setIsCreateModalOpen(true)}
                            className="tasks-fab"
                            title="Crear nueva tarea"
                            aria-label="Crear nueva tarea"
                        >
                            <span className="tasks-fab-icon" aria-hidden="true">+</span>
                        </button>
                    </div>
                )}

                {/* VISTA 2: CALENDARIO EN PANTALLA COMPLETA (Móvil / Tablet o selección directa) */}
                {activeTab === "calendar" && (
                    <div className="calendar-fullview-wrapper">
                        <CalendarPanel
                            tasks={tasks}
                            isOpen={true}
                            onClose={() => setActiveTab("tasks")}
                            onToggleComplete={handleToggleComplete}
                            onEditTask={handleOpenEdit}
                            onCreateTaskForDate={handleOpenCreateForDate}
                            isMobileView={true}
                        />
                    </div>
                )}

                {/* VISTA 3: PERFIL DE USUARIO / CONFIGURACIÓN (Tercera vista) */}
                {activeTab === "profile" && (
                    <div className="profile-view-wrapper">
                        <ProfileView
                            user={user}
                            tasks={tasks}
                            summary={summary}
                            onLogout={logout}
                            onBackToTasks={() => setActiveTab("tasks")}
                            onSendEmailSummary={handleSendEmailSummary}
                            sendingEmail={sendingEmail}
                        />
                    </div>
                )}
            </main>

            {/* =========================================================================
                ZONA 3: PANEL DERECHO (CALENDARIO MENSUAL DESPLEGABLE - ESCRITORIO)
               ========================================================================= */}
            {activeTab === "tasks" && (
                <CalendarPanel
                    tasks={tasks}
                    isOpen={isCalendarOpen}
                    onClose={() => setIsCalendarOpen(false)}
                    onToggleComplete={handleToggleComplete}
                    onEditTask={handleOpenEdit}
                    onCreateTaskForDate={handleOpenCreateForDate}
                    isMobileView={false}
                />
            )}

            {/* =========================================================================
                NAVEGACIÓN INFERIOR (MOBILE FIRST - < 768px)
               ========================================================================= */}
            <BottomNavigation
                activeTab={activeTab}
                onSelectTab={setActiveTab}
                onOpenNewTask={() => setIsCreateModalOpen(true)}
                pendingCount={summary.pending}
            />
        </div>
    );
};