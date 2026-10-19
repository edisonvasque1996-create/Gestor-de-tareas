import type { FC } from "react";
import type { Task, TaskSummary } from "../types/task";
import { CATEGORY_CONFIG } from "./Badges";

interface ProfileViewProps {
    user: any;
    tasks: Task[];
    summary: TaskSummary;
    onLogout: () => void;
    onBackToTasks: () => void;
    onSendEmailSummary: () => void;
    sendingEmail: boolean;
}

export const ProfileView: FC<ProfileViewProps> = ({
    user,
    tasks,
    summary,
    onLogout,
    onBackToTasks,
    onSendEmailSummary,
    sendingEmail,
}) => {
    const completionPercent = summary.total > 0 ? Math.round((summary.completed / summary.total) * 100) : 0;

    return (
        <section className="profile-view-container" aria-label="Perfil de usuario y configuración">
            {/* Top Navigation */}
            <div className="profile-header-bar">
                <button
                    type="button"
                    onClick={onBackToTasks}
                    className="btn-back-calendar"
                    aria-label="Volver a la lista de tareas"
                >
                    ← Volver a Tareas
                </button>
                <h1 className="profile-header-title">Mi Perfil</h1>
            </div>

            {/* Profile Card */}
            <div className="profile-user-card">
                <div className="profile-avatar-large">
                    {(user?.displayName || user?.email || "U").charAt(0).toUpperCase()}
                </div>
                <div className="profile-user-info">
                    <div className="profile-name-row">
                        <h2 className="profile-display-name">
                            {user?.displayName || "Usuario MateCode"}
                        </h2>
                        <span className="profile-badge-pro">Plan Pro</span>
                    </div>
                    <p className="profile-email-text">{user?.email || "demo@matecode.dev"}</p>
                    <span className="profile-uid-text">
                        ID: <code>{user?.uid || "local-demo-123"}</code> · Modo Local Activo
                    </span>
                </div>
            </div>

            {/* Productivity Stats Grid */}
            <div className="profile-section-block">
                <h3 className="profile-section-title">📊 Rendimiento de Productividad</h3>
                <div className="profile-stats-grid">
                    <div className="profile-stat-box">
                        <span className="stat-box-value">{summary.total}</span>
                        <span className="stat-box-label">Tareas Totales</span>
                    </div>
                    <div className="profile-stat-box stat-box-success">
                        <span className="stat-box-value">{summary.completed}</span>
                        <span className="stat-box-label">Completadas</span>
                    </div>
                    <div className="profile-stat-box stat-box-primary">
                        <span className="stat-box-value">{completionPercent}%</span>
                        <span className="stat-box-label">Tasa de Éxito</span>
                    </div>
                    <div className="profile-stat-box stat-box-warning">
                        <span className="stat-box-value">{summary.overdue}</span>
                        <span className="stat-box-label">Vencidas</span>
                    </div>
                </div>
            </div>

            {/* Category Breakdown */}
            <div className="profile-section-block">
                <h3 className="profile-section-title">📂 Distribución por Categorías</h3>
                <div className="category-breakdown-list">
                    {(["trabajo", "personal", "estudios", "casa"] as const).map((catKey) => {
                        const cfg = CATEGORY_CONFIG[catKey];
                        const catTasks = tasks.filter((t) => t.category === catKey);
                        const catTotal = catTasks.length;
                        const catDone = catTasks.filter((t) => t.completed).length;
                        const catPercent = catTotal > 0 ? Math.round((catDone / catTotal) * 100) : 0;

                        return (
                            <div key={catKey} className="category-breakdown-card">
                                <div className="category-breakdown-header">
                                    <div className="category-tag-wrap">
                                        <span className="category-tag-dot" style={{ backgroundColor: cfg.color }} />
                                        <span className="category-tag-title">{cfg.label}</span>
                                    </div>
                                    <span className="category-tag-count">
                                        {catDone} / {catTotal} completadas ({catPercent}%)
                                    </span>
                                </div>
                                <div className="category-progress-track">
                                    <div
                                        className="category-progress-fill"
                                        style={{
                                            width: `${catPercent}%`,
                                            backgroundColor: cfg.color,
                                        }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Actions & Settings */}
            <div className="profile-section-block">
                <h3 className="profile-section-title">⚡ Acciones de Cuenta</h3>
                <div className="profile-actions-grid">
                    <button
                        type="button"
                        onClick={onSendEmailSummary}
                        disabled={sendingEmail || tasks.length === 0}
                        className="btn-profile-action btn-profile-email"
                        title="Enviar resumen completo de productividad por correo"
                    >
                        <span className="btn-action-icon">📧</span>
                        <div className="btn-action-texts">
                            <span className="btn-action-title">
                                {sendingEmail ? "Enviando vía AWS SES..." : "Enviar Resumen por Email"}
                            </span>
                            <span className="btn-action-subtitle">
                                Recibe tus métricas consolidadas en tu bandeja de entrada
                            </span>
                        </div>
                    </button>

                    <button
                        type="button"
                        onClick={onLogout}
                        className="btn-profile-action btn-profile-logout"
                        title="Cerrar sesión actual de usuario"
                    >
                        <span className="btn-action-icon">🚪</span>
                        <div className="btn-action-texts">
                            <span className="btn-action-title">Cerrar Sesión</span>
                            <span className="btn-action-subtitle">
                                Salir de tu cuenta y volver a la pantalla de acceso
                            </span>
                        </div>
                    </button>
                </div>
            </div>
        </section>
    );
};
