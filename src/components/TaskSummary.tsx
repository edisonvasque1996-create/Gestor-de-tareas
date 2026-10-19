import type { FC } from "react";
import type { TaskSummary as TaskSummaryType } from "../types/task";

interface TaskSummaryProps {
    summary: TaskSummaryType;
    onSelectFilter?: (filterType: "pendientes" | "completadas" | "vencidas" | "todas") => void;
    activeFilter?: string;
}

export const TaskSummary: FC<TaskSummaryProps> = ({ summary, onSelectFilter, activeFilter }) => {
    const completionPercent = summary.total > 0 ? Math.round((summary.completed / summary.total) * 100) : 0;

    return (
        <section className="summary-section" aria-label="Resumen de productividad">
            <div className="summary-cards-grid">
                {/* 1. Pendientes */}
                <div
                    className={`summary-card card-pending ${activeFilter === "pendientes" ? "active" : ""}`}
                    onClick={() => onSelectFilter?.("pendientes")}
                    role="button"
                    tabIndex={0}
                    title="Filtrar por tareas pendientes"
                    aria-label={`${summary.pending} tareas pendientes`}
                >
                    <div className="summary-card-header">
                        <span className="summary-card-icon">⏳</span>
                        <span className="summary-card-label">Pendientes</span>
                    </div>
                    <div className="summary-card-body">
                        <span className="summary-card-value">{summary.pending}</span>
                        <span className="summary-card-sub">Por ejecutar</span>
                    </div>
                </div>

                {/* 2. Completadas */}
                <div
                    className={`summary-card card-completed ${activeFilter === "completadas" ? "active" : ""}`}
                    onClick={() => onSelectFilter?.("completadas")}
                    role="button"
                    tabIndex={0}
                    title="Filtrar por tareas completadas"
                    aria-label={`${summary.completed} tareas completadas`}
                >
                    <div className="summary-card-header">
                        <span className="summary-card-icon">✅</span>
                        <span className="summary-card-label">Completadas</span>
                    </div>
                    <div className="summary-card-body">
                        <span className="summary-card-value">{summary.completed}</span>
                        <span className="summary-card-sub">{completionPercent}% de avance</span>
                    </div>
                </div>

                {/* 3. Vencidas */}
                <div
                    className={`summary-card card-overdue ${activeFilter === "vencidas" ? "active" : ""}`}
                    onClick={() => onSelectFilter?.("vencidas")}
                    role="button"
                    tabIndex={0}
                    title="Filtrar por tareas vencidas"
                    aria-label={`${summary.overdue} tareas vencidas`}
                >
                    <div className="summary-card-header">
                        <span className="summary-card-icon">⚠️</span>
                        <span className="summary-card-label">Vencidas</span>
                    </div>
                    <div className="summary-card-body">
                        <span className="summary-card-value">{summary.overdue}</span>
                        <span className="summary-card-sub">
                            {summary.overdue > 0 ? "Requieren atención" : "Al día"}
                        </span>
                    </div>
                </div>

                {/* 4. Progreso con barra */}
                <div className="summary-card card-progress">
                    <div className="summary-card-header">
                        <span className="summary-card-icon">🎯</span>
                        <span className="summary-card-label">Progreso</span>
                        <span className="summary-progress-text">{completionPercent}%</span>
                    </div>
                    <div className="summary-card-body progress-body">
                        <div
                            className="progress-bar-track"
                            role="progressbar"
                            aria-valuenow={completionPercent}
                            aria-valuemin={0}
                            aria-valuemax={100}
                        >
                            <div
                                className="progress-bar-fill"
                                style={{ width: `${completionPercent}%` }}
                            />
                        </div>
                        <span className="summary-card-sub">
                            {summary.completed} de {summary.total} tareas finalizadas
                        </span>
                    </div>
                </div>
            </div>
        </section>
    );
};
