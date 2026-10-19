import type { FC } from "react";
import type { Task, TaskCategory } from "../types/task";
import { CATEGORY_CONFIG } from "./Badges";

interface SidebarProps {
    activeTab: "tasks" | "calendar" | "profile";
    onSelectTab: (tab: "tasks" | "calendar" | "profile") => void;
    activeCategory: string;
    onSelectCategory: (category: string) => void;
    tasks: Task[];
    user: any;
    onLogout: () => void;
}

export const Sidebar: FC<SidebarProps> = ({
    activeTab,
    onSelectTab,
    activeCategory,
    onSelectCategory,
    tasks,
    user,
    onLogout,
}) => {
    // Calcular conteos
    const pendingCount = tasks.filter((t) => !t.completed).length;

    const countByCategory = (cat: TaskCategory) => {
        return tasks.filter((t) => t.category === cat && !t.completed).length;
    };

    return (
        <aside className="app-sidebar" aria-label="Navegación principal de escritorio">
            {/* Brand Logo & Title */}
            <div className="sidebar-brand">
                <div className="sidebar-logo-icon">⚡</div>
                <div className="sidebar-brand-text">
                    <span className="sidebar-brand-name">MateCode</span>
                    <span className="sidebar-brand-sub">Productividad Estratégica</span>
                </div>
            </div>

            {/* Navigation Sections */}
            <nav className="sidebar-nav">
                <div className="sidebar-section-title">Vistas Principales</div>

                {/* 1. Mis Tareas */}
                <button
                    type="button"
                    onClick={() => {
                        onSelectTab("tasks");
                        onSelectCategory("todas");
                    }}
                    className={`sidebar-nav-item ${activeTab === "tasks" && activeCategory === "todas" ? "active" : ""}`}
                >
                    <span className="sidebar-nav-icon">📋</span>
                    <span className="sidebar-nav-label">Mis Tareas</span>
                    {pendingCount > 0 && (
                        <span className="sidebar-nav-badge">{pendingCount}</span>
                    )}
                </button>

                {/* 2. Calendario */}
                <button
                    type="button"
                    onClick={() => onSelectTab("calendar")}
                    className={`sidebar-nav-item ${activeTab === "calendar" ? "active" : ""}`}
                >
                    <span className="sidebar-nav-icon">📅</span>
                    <span className="sidebar-nav-label">Calendario</span>
                </button>

                {/* 3. Mi Perfil (Tercera vista) */}
                <button
                    type="button"
                    onClick={() => onSelectTab("profile")}
                    className={`sidebar-nav-item ${activeTab === "profile" ? "active" : ""}`}
                >
                    <span className="sidebar-nav-icon">👤</span>
                    <span className="sidebar-nav-label">Mi Perfil</span>
                </button>

                {/* Categorías / Contextos */}
                <div className="sidebar-section-title" style={{ marginTop: "24px" }}>
                    Categorías
                </div>

                {(Object.keys(CATEGORY_CONFIG) as TaskCategory[]).map((catKey) => {
                    const cfg = CATEGORY_CONFIG[catKey];
                    const count = countByCategory(catKey);
                    const isSelected = activeTab === "tasks" && activeCategory === catKey;

                    return (
                        <button
                            key={catKey}
                            type="button"
                            onClick={() => {
                                onSelectTab("tasks");
                                onSelectCategory(catKey);
                            }}
                            className={`sidebar-nav-item sidebar-cat-item ${isSelected ? "active" : ""}`}
                        >
                            <span
                                className="sidebar-cat-dot"
                                style={{ backgroundColor: cfg.color }}
                            />
                            <span className="sidebar-nav-label">{cfg.label}</span>
                            {count > 0 && (
                                <span className="sidebar-cat-count">{count}</span>
                            )}
                        </button>
                    );
                })}
            </nav>

            {/* Sidebar User Footer */}
            <div className="sidebar-footer">
                <div className="sidebar-user-card" onClick={() => onSelectTab("profile")}>
                    <div className="sidebar-user-avatar">
                        {(user?.displayName || user?.email || "U").charAt(0).toUpperCase()}
                    </div>
                    <div className="sidebar-user-details">
                        <span className="sidebar-user-name">
                            {user?.displayName || "Usuario Demo"}
                        </span>
                        <span className="sidebar-user-email">
                            {user?.email || "demo@matecode.dev"}
                        </span>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={onLogout}
                    className="sidebar-logout-btn"
                    title="Cerrar sesión"
                    aria-label="Cerrar sesión"
                >
                    Cerrar sesión
                </button>
            </div>
        </aside>
    );
};
