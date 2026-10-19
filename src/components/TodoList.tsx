import { useState, useMemo, type FC } from "react";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from "@dnd-kit/core";
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { PriorityLevel, SortOption, Task, TaskFilterStatus } from "../types/task";
import { TodoItem } from "./TodoItem";

interface TodoListProps {
    tasks: Task[];
    onToggleComplete: (id: string, completed: boolean) => void;
    onEdit: (task: Task) => void;
    onDelete: (id: string) => void;
    onReorder: (newTasks: Task[]) => void;
    onViewDetails?: (task: Task) => void;
    // Props de control opcionales desde el componente contenedor
    controlledStatus?: TaskFilterStatus;
    controlledCategory?: string;
    controlledPriority?: string;
    controlledSearch?: string;
    controlledSort?: SortOption;
    hideInternalControls?: boolean;
}

export const TodoList: FC<TodoListProps> = ({
    tasks,
    onToggleComplete,
    onEdit,
    onDelete,
    onReorder,
    onViewDetails,
    controlledStatus,
    controlledCategory,
    controlledPriority,
    controlledSearch,
    controlledSort,
    hideInternalControls = false,
}) => {
    // Estado interno cuando se usa sin props controladas (ej. en tests unitarios)
    const [internalStatus, setInternalStatus] = useState<TaskFilterStatus>("todas");
    const [internalPriority, setInternalPriority] = useState<string>("todas");
    const [internalSearch, setInternalSearch] = useState<string>("");
    const internalCategory = "todas";
    const internalSort: SortOption = "dueDate";

    const activeStatus = controlledStatus ?? internalStatus;
    const activeCategory = controlledCategory ?? internalCategory;
    const activePriority = controlledPriority ?? internalPriority;
    const activeSearch = controlledSearch ?? internalSearch;
    const activeSort = controlledSort ?? internalSort;

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Filtrado y ordenamiento memoizado de tareas
    const processedTasks = useMemo(() => {
        const todayStr = new Date().toISOString().split("T")[0];

        // 1. Filtrado
        const filtered = tasks.filter((task) => {
            // Filtro por estado / temporalidad
            if (activeStatus === "pendientes" && task.completed) return false;
            if (activeStatus === "completadas" && !task.completed) return false;
            if (activeStatus === "en_progreso" && task.status !== "en_progreso") return false;

            if (activeStatus === "hoy") {
                if (!task.dueDate || task.dueDate !== todayStr) return false;
            } else if (activeStatus === "proximas") {
                if (!task.dueDate || task.dueDate <= todayStr) return false;
            } else if (activeStatus === "vencidas") {
                const isOverdue =
                    !task.completed &&
                    task.dueDate &&
                    new Date(task.dueDate + "T23:59:59").getTime() < Date.now();
                if (!isOverdue) return false;
            }

            // Filtro por categoría
            if (activeCategory !== "todas" && task.category !== activeCategory) return false;

            // Filtro por prioridad
            if (activePriority !== "todas" && task.priority !== activePriority) return false;

            // Filtro por texto de búsqueda
            if (activeSearch.trim()) {
                const query = activeSearch.toLowerCase().trim();
                const matchesTitle = task.title.toLowerCase().includes(query);
                const matchesDesc = (task.description || "").toLowerCase().includes(query);
                if (!matchesTitle && !matchesDesc) return false;
            }

            return true;
        });

        // 2. Ordenamiento
        return filtered.sort((a, b) => {
            if (activeSort === "dueDate") {
                // Tareas con fecha van primero, ordenadas ascendentemente
                if (!a.dueDate && !b.dueDate) return a.order - b.order;
                if (!a.dueDate) return 1;
                if (!b.dueDate) return -1;
                return a.dueDate.localeCompare(b.dueDate);
            }
            if (activeSort === "priority") {
                const priorityWeight: Record<PriorityLevel, number> = {
                    alta: 3,
                    media: 2,
                    baja: 1,
                };
                const weightDiff = (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);
                if (weightDiff !== 0) return weightDiff;
                return a.order - b.order;
            }
            if (activeSort === "createdAt") {
                return (b.createdAt || 0) - (a.createdAt || 0);
            }
            if (activeSort === "title") {
                return a.title.localeCompare(b.title);
            }
            return a.order - b.order;
        });
    }, [tasks, activeStatus, activeCategory, activePriority, activeSearch, activeSort]);

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = tasks.findIndex((t) => t.id === active.id);
        const newIndex = tasks.findIndex((t) => t.id === over.id);

        if (oldIndex !== -1 && newIndex !== -1) {
            const updated = [...tasks];
            const [movedItem] = updated.splice(oldIndex, 1);
            updated.splice(newIndex, 0, movedItem);

            const reindexed = updated.map((t, index) => ({ ...t, order: index }));
            onReorder(reindexed);
        }
    };

    return (
        <section className="todo-list-section" aria-label="Listado de tareas">
            {/* Controles internos de filtro (visibles si no se ocultan desde el padre) */}
            {!hideInternalControls && (
                <div className="filter-controls-bar">
                    {/* Input de Búsqueda */}
                    <div className="search-box">
                        <span className="search-icon">🔍</span>
                        <input
                            type="text"
                            placeholder="Buscar tareas por título o detalle..."
                            value={internalSearch}
                            onChange={(e) => setInternalSearch(e.target.value)}
                            className="search-input"
                            aria-label="Buscar tareas"
                        />
                        {internalSearch && (
                            <button
                                type="button"
                                onClick={() => setInternalSearch("")}
                                className="clear-search-btn"
                                aria-label="Limpiar búsqueda"
                            >
                                ✕
                            </button>
                        )}
                    </div>

                    <div className="filters-group">
                        {/* Botones de Estado */}
                        <div className="segmented-control" role="group" aria-label="Filtrar por estado">
                            {(["todas", "pendientes", "completadas"] as const).map((st) => (
                                <button
                                    key={st}
                                    type="button"
                                    onClick={() => setInternalStatus(st)}
                                    className={`segment-btn ${internalStatus === st ? "active" : ""}`}
                                >
                                    {st === "todas"
                                        ? "Todas"
                                        : st === "pendientes"
                                        ? "Pendientes"
                                        : "Completadas"}
                                </button>
                            ))}
                        </div>

                        {/* Selector de Prioridad */}
                        <select
                            value={internalPriority}
                            onChange={(e) => setInternalPriority(e.target.value)}
                            className="priority-filter-select"
                            aria-label="Filtrar por prioridad"
                        >
                            <option value="todas">Todas las prioridades</option>
                            <option value="alta">🔴 Alta prioridad</option>
                            <option value="media">🟡 Media prioridad</option>
                            <option value="baja">🟢 Baja prioridad</option>
                        </select>
                    </div>
                </div>
            )}

            {/* Listado con Drag & Drop o Estado Vacío */}
            {processedTasks.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">📋</div>
                    <h4 className="empty-state-title">No hay tareas que coincidan</h4>
                    <p className="empty-state-text">
                        {tasks.length === 0
                            ? "Aún no tienes tareas registradas. Utiliza el formulario superior para agregar tu primera tarea estratégica."
                            : "No se encontraron tareas con los filtros actuales. Intenta cambiar los criterios de búsqueda."}
                    </p>
                </div>
            ) : (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext
                        items={processedTasks.map((t) => t.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        <div className="tasks-grid">
                            {processedTasks.map((task) => (
                                <TodoItem
                                    key={task.id}
                                    task={task}
                                    onToggleComplete={onToggleComplete}
                                    onEdit={onEdit}
                                    onDelete={onDelete}
                                    onViewDetails={onViewDetails}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            )}
        </section>
    );
};