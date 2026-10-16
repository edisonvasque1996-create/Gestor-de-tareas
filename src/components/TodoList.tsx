import { useState, useMemo, type FC } from "react";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent
} from "@dnd-kit/core";
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy
} from "@dnd-kit/sortable";
import type { Task, TaskStatus } from "../types/task";
import { TodoItem } from "./TodoItem";

interface TodoListProps {
    tasks: Task[];
    onToggleComplete: (id: string, completed: boolean) => void;
    onEdit: (task: Task) => void;
    onDelete: (id: string) => void;
    onReorder: (newTasks: Task[]) => void;
}

export const TodoList: FC<TodoListProps> = ({
    tasks,
    onToggleComplete,
    onEdit,
    onDelete,
    onReorder,
}) => {
    const [statusFilter, setStatusFilter] = useState<TaskStatus>("todas");
    const [priorityFilter, setPriorityFilter] = useState<string>("todas");
    const [searchQuery, setSearchQuery] = useState("");

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

    // Filtrado memoizado de tareas
    const filteredTasks = useMemo(() => {
        return tasks.filter((task) => {
            // Filtro por estado
            if (statusFilter === "pendientes" && task.completed) return false;
            if (statusFilter === "completadas" && !task.completed) return false;

            // Filtro por prioridad
            if (priorityFilter !== "todas" && task.priority !== priorityFilter) return false;

            // Filtro por texto de búsqueda
            if (searchQuery.trim()) {
                const query = searchQuery.toLowerCase();
                const matchesTitle = task.title.toLowerCase().includes(query);
                const matchesDesc = (task.description || "").toLowerCase().includes(query);
                if (!matchesTitle && !matchesDesc) return false;
            }

            return true;
        });
    }, [tasks, statusFilter, priorityFilter, searchQuery]);

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
            {/* Barra de Búsqueda y Filtros */}
            <div className="filter-controls-bar">
                {/* Input de Búsqueda */}
                <div className="search-box">
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        placeholder="Buscar tareas por título o detalle..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search-input"
                    />
                    {searchQuery && (
                        <button
                            type="button"
                            onClick={() => setSearchQuery("")}
                            className="clear-search-btn"
                        >
                            ✕
                        </button>
                    )}
                </div>

                <div className="filters-group">
                    {/* Botones de Estado */}
                    <div className="segmented-control" role="group" aria-label="Filtrar por estado">
                        {(["todas", "pendientes", "completadas"] as TaskStatus[]).map((st) => (
                            <button
                                key={st}
                                type="button"
                                onClick={() => setStatusFilter(st)}
                                className={`segment-btn ${statusFilter === st ? "active" : ""}`}
                            >
                                {st === "todas" ? "Todas" : st === "pendientes" ? "Pendientes" : "Completadas"}
                            </button>
                        ))}
                    </div>

                    {/* Selector de Prioridad */}
                    <select
                        value={priorityFilter}
                        onChange={(e) => setPriorityFilter(e.target.value)}
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

            {/* Listado con Drag & Drop */}
            {filteredTasks.length === 0 ? (
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
                    <SortableContext items={filteredTasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
                        <div className="tasks-grid">
                            {filteredTasks.map((task) => (
                                <TodoItem
                                    key={task.id}
                                    task={task}
                                    onToggleComplete={onToggleComplete}
                                    onEdit={onEdit}
                                    onDelete={onDelete}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            )}
        </section>
    );
};