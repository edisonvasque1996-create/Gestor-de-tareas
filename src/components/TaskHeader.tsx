import type { FC } from "react";

interface TaskHeaderProps {
    onToggleCalendar: () => void;
    isCalendarOpen: boolean;
    searchQuery: string;
    onSearchChange: (query: string) => void;
    pendingCount: number;
}

export const TaskHeader: FC<TaskHeaderProps> = ({
    onToggleCalendar,
    isCalendarOpen,
    searchQuery,
    onSearchChange,
    pendingCount,
}) => {
    // Formatear fecha actual en español
    const todayFormatted = new Intl.DateTimeFormat("es-ES", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    }).format(new Date());

    const capitalizedDate = todayFormatted.charAt(0).toUpperCase() + todayFormatted.slice(1);

    return (
        <header className="tasks-main-header">
            <div className="tasks-header-left">
                <div className="tasks-header-title-row">
                    <h1 className="tasks-page-title">Mis tareas</h1>
                    {pendingCount > 0 && (
                        <span className="tasks-header-badge" title="Tareas pendientes por resolver">
                            {pendingCount} pendientes
                        </span>
                    )}
                </div>
                <p className="tasks-header-date">{capitalizedDate}</p>
            </div>

            <div className="tasks-header-right">
                {/* Search input en header para acceso rápido */}
                <div className="header-search-wrapper">
                    <span className="header-search-icon" aria-hidden="true">🔍</span>
                    <input
                        type="text"
                        placeholder="Buscar por título o detalle..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="header-search-input"
                        aria-label="Buscar tareas"
                    />
                    {searchQuery && (
                        <button
                            type="button"
                            onClick={() => onSearchChange("")}
                            className="header-search-clear"
                            aria-label="Limpiar búsqueda"
                        >
                            ✕
                        </button>
                    )}
                </div>

                {/* Botón Calendario */}
                <button
                    type="button"
                    onClick={onToggleCalendar}
                    className={`btn-header-secondary ${isCalendarOpen ? "active" : ""}`}
                    title={isCalendarOpen ? "Ocultar panel de calendario" : "Ver calendario de tareas"}
                    aria-label="Abrir calendario interactivo"
                >
                    <span className="btn-icon">📅</span>
                    <span className="btn-text-desktop">Calendario</span>
                </button>
            </div>
        </header>
    );
};
