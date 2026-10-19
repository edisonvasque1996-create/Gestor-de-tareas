import type { FC } from "react";
import type { SortOption, TaskFilterStatus } from "../types/task";

interface TaskFiltersProps {
    statusFilter: TaskFilterStatus;
    onStatusFilterChange: (status: TaskFilterStatus) => void;
    categoryFilter: string;
    onCategoryFilterChange: (category: string) => void;
    priorityFilter: string;
    onPriorityFilterChange: (priority: string) => void;
    sortBy: SortOption;
    onSortByChange: (sort: SortOption) => void;
    searchQuery: string;
    onSearchQueryChange: (query: string) => void;
    counts?: {
        todas: number;
        pendientes: number;
        en_progreso: number;
        completadas: number;
        hoy: number;
        proximas: number;
        vencidas: number;
    };
}

export const TaskFilters: FC<TaskFiltersProps> = ({
    statusFilter,
    onStatusFilterChange,
    categoryFilter,
    onCategoryFilterChange,
    priorityFilter,
    onPriorityFilterChange,
    sortBy,
    onSortByChange,
    searchQuery,
    onSearchQueryChange,
    counts,
}) => {
    return (
        <div className="filters-container-bar" aria-label="Controles de filtro y ordenamiento">
            {/* Fila 1: Filtro de Búsqueda y Pestañas de Estado */}
            <div className="filters-top-row">
                {/* Search Input inline */}
                <div className="filters-search-box">
                    <span className="filters-search-icon" aria-hidden="true">🔍</span>
                    <input
                        type="text"
                        placeholder="Buscar tareas por título o detalle..."
                        value={searchQuery}
                        onChange={(e) => onSearchQueryChange(e.target.value)}
                        className="filters-search-input"
                        aria-label="Buscar tareas"
                    />
                    {searchQuery && (
                        <button
                            type="button"
                            onClick={() => onSearchQueryChange("")}
                            className="filters-search-clear"
                            aria-label="Limpiar búsqueda"
                        >
                            ✕
                        </button>
                    )}
                </div>

                {/* Segmented Control de Estados */}
                <div className="status-pills-scroll" role="tablist" aria-label="Filtrar por estado">
                    <button
                        type="button"
                        role="tab"
                        aria-selected={statusFilter === "todas"}
                        onClick={() => onStatusFilterChange("todas")}
                        className={`filter-pill ${statusFilter === "todas" ? "active" : ""}`}
                    >
                        Todas {counts ? `(${counts.todas})` : ""}
                    </button>
                    <button
                        type="button"
                        role="tab"
                        aria-selected={statusFilter === "pendientes"}
                        onClick={() => onStatusFilterChange("pendientes")}
                        className={`filter-pill ${statusFilter === "pendientes" ? "active" : ""}`}
                    >
                        Pendientes {counts ? `(${counts.pendientes})` : ""}
                    </button>
                    <button
                        type="button"
                        role="tab"
                        aria-selected={statusFilter === "en_progreso"}
                        onClick={() => onStatusFilterChange("en_progreso")}
                        className={`filter-pill ${statusFilter === "en_progreso" ? "active" : ""}`}
                    >
                        En progreso {counts ? `(${counts.en_progreso})` : ""}
                    </button>
                    <button
                        type="button"
                        role="tab"
                        aria-selected={statusFilter === "completadas"}
                        onClick={() => onStatusFilterChange("completadas")}
                        className={`filter-pill ${statusFilter === "completadas" ? "active" : ""}`}
                    >
                        Completadas {counts ? `(${counts.completadas})` : ""}
                    </button>
                </div>
            </div>

            {/* Fila 2: Accesos rápidos temporales, Categorías, Prioridad y Orden */}
            <div className="filters-bottom-row">
                {/* Filtros temporales */}
                <div className="temporal-chips-group">
                    <button
                        type="button"
                        onClick={() => onStatusFilterChange(statusFilter === "hoy" ? "todas" : "hoy")}
                        className={`chip-btn ${statusFilter === "hoy" ? "active" : ""}`}
                        title="Ver tareas para hoy"
                    >
                        📅 Hoy {counts ? `(${counts.hoy})` : ""}
                    </button>
                    <button
                        type="button"
                        onClick={() => onStatusFilterChange(statusFilter === "proximas" ? "todas" : "proximas")}
                        className={`chip-btn ${statusFilter === "proximas" ? "active" : ""}`}
                        title="Ver tareas de próximos días"
                    >
                        ⏳ Próximas {counts ? `(${counts.proximas})` : ""}
                    </button>
                    <button
                        type="button"
                        onClick={() => onStatusFilterChange(statusFilter === "vencidas" ? "todas" : "vencidas")}
                        className={`chip-btn chip-danger ${statusFilter === "vencidas" ? "active" : ""}`}
                        title="Ver tareas vencidas"
                    >
                        🚨 Vencidas {counts ? `(${counts.vencidas})` : ""}
                    </button>
                </div>

                {/* Selectores de filtrado y orden */}
                <div className="selectors-group">
                    {/* Filtro de Categoría */}
                    <div className="filter-select-wrapper">
                        <select
                            value={categoryFilter}
                            onChange={(e) => onCategoryFilterChange(e.target.value)}
                            className="filter-select"
                            aria-label="Filtrar por categoría"
                        >
                            <option value="todas">Todas las categorías</option>
                            <option value="trabajo">💼 Trabajo</option>
                            <option value="personal">🌱 Personal</option>
                            <option value="estudios">📚 Estudios</option>
                            <option value="casa">🏠 Casa</option>
                        </select>
                    </div>

                    {/* Filtro de Prioridad */}
                    <div className="filter-select-wrapper">
                        <select
                            value={priorityFilter}
                            onChange={(e) => onPriorityFilterChange(e.target.value)}
                            className="filter-select"
                            aria-label="Filtrar por prioridad"
                        >
                            <option value="todas">Todas las prioridades</option>
                            <option value="alta">🔴 Alta prioridad</option>
                            <option value="media">🟡 Media prioridad</option>
                            <option value="baja">🟢 Baja prioridad</option>
                        </select>
                    </div>

                    {/* Selector de Orden */}
                    <div className="filter-select-wrapper sort-wrapper">
                        <select
                            value={sortBy}
                            onChange={(e) => onSortByChange(e.target.value as SortOption)}
                            className="filter-select sort-select"
                            aria-label="Ordenar tareas"
                        >
                            <option value="dueDate">📅 Fecha límite</option>
                            <option value="priority">🔥 Prioridad</option>
                            <option value="createdAt">⏱️ Creación</option>
                            <option value="title">🔤 Nombre A-Z</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
};
