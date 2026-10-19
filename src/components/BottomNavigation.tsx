import type { FC } from "react";

interface BottomNavigationProps {
    activeTab: "tasks" | "calendar" | "profile";
    onSelectTab: (tab: "tasks" | "calendar" | "profile") => void;
    onOpenNewTask: () => void;
    pendingCount: number;
}

export const BottomNavigation: FC<BottomNavigationProps> = ({
    activeTab,
    onSelectTab,
    pendingCount,
}) => {
    return (
        <nav className="mobile-bottom-nav" aria-label="Navegación inferior móvil">
            {/* 1. Tareas */}
            <button
                type="button"
                onClick={() => onSelectTab("tasks")}
                className={`bottom-nav-item ${activeTab === "tasks" ? "active" : ""}`}
                aria-label="Ir a lista de tareas"
            >
                <div className="bottom-nav-icon-box">
                    <span className="bottom-nav-icon">📋</span>
                    {pendingCount > 0 && (
                        <span className="bottom-nav-badge">{pendingCount}</span>
                    )}
                </div>
                <span className="bottom-nav-text">Tareas</span>
            </button>

            {/* 2. Calendario */}
            <button
                type="button"
                onClick={() => onSelectTab("calendar")}
                className={`bottom-nav-item ${activeTab === "calendar" ? "active" : ""}`}
                aria-label="Abrir vista de calendario"
            >
                <div className="bottom-nav-icon-box">
                    <span className="bottom-nav-icon">📅</span>
                </div>
                <span className="bottom-nav-text">Calendario</span>
            </button>

            {/* 3. Perfil */}
            <button
                type="button"
                onClick={() => onSelectTab("profile")}
                className={`bottom-nav-item ${activeTab === "profile" ? "active" : ""}`}
                aria-label="Ver mi perfil"
            >
                <div className="bottom-nav-icon-box">
                    <span className="bottom-nav-icon">👤</span>
                </div>
                <span className="bottom-nav-text">Perfil</span>
            </button>
        </nav>
    );
};
