import { useState, useMemo, type FC } from "react";
import type { Task, TaskCategory } from "../types/task";
import { CATEGORY_CONFIG, CategoryBadge, PriorityBadge } from "./Badges";

interface CalendarPanelProps {
    tasks: Task[];
    isOpen: boolean;
    onClose: () => void;
    onToggleComplete: (id: string, completed: boolean) => void;
    onEditTask: (task: Task) => void;
    onCreateTaskForDate: (dateStr: string) => void;
    isMobileView?: boolean;
}

const WEEKDAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

export const CalendarPanel: FC<CalendarPanelProps> = ({
    tasks,
    isOpen,
    onClose,
    onToggleComplete,
    onEditTask,
    onCreateTaskForDate,
    isMobileView = false,
}) => {
    // Fecha actual de referencia
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];

    const [currentYear, setCurrentYear] = useState<number>(today.getFullYear());
    const [currentMonth, setCurrentMonth] = useState<number>(today.getMonth()); // 0-indexed (0 = Ene)
    const [selectedDate, setSelectedDate] = useState<string>(todayStr);

    // Navegar mes
    const handlePrevMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear((y) => y - 1);
        } else {
            setCurrentMonth((m) => m - 1);
        }
    };

    const handleNextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear((y) => y + 1);
        } else {
            setCurrentMonth((m) => m + 1);
        }
    };

    const handleJumpToToday = () => {
        setCurrentYear(today.getFullYear());
        setCurrentMonth(today.getMonth());
        setSelectedDate(todayStr);
    };

    // Nombre del mes y año formateado
    const monthName = new Intl.DateTimeFormat("es-ES", { month: "long" }).format(
        new Date(currentYear, currentMonth, 1)
    );
    const capitalizedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1);

    // Mapeo de tareas por fecha YYYY-MM-DD (excluyendo tareas sin fecha)
    const tasksByDate = useMemo(() => {
        const map = new Map<string, Task[]>();
        tasks.forEach((task) => {
            if (task.dueDate && task.dueDate.trim()) {
                const existing = map.get(task.dueDate) || [];
                existing.push(task);
                map.set(task.dueDate, existing);
            }
        });
        return map;
    }, [tasks]);

    // Generar cuadrícula de días para el mes
    const calendarDays = useMemo(() => {
        const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
        const totalDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

        // Obtener el día de la semana (0 = Domingo, 1 = Lunes, etc.)
        // Convertimos a base Lunes: Lun=0, Mar=1, ..., Dom=6
        let startDayIndex = firstDayOfMonth.getDay() - 1;
        if (startDayIndex < 0) startDayIndex = 6;

        const totalDaysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

        const days = [];

        // Días del mes previo (para rellenar la primera fila)
        for (let i = startDayIndex - 1; i >= 0; i--) {
            const dayNum = totalDaysInPrevMonth - i;
            const prevMonthDate = new Date(currentYear, currentMonth - 1, dayNum);
            const dateStr = prevMonthDate.toISOString().split("T")[0];
            days.push({
                dayNumber: dayNum,
                dateString: dateStr,
                isCurrentMonth: false,
                isToday: dateStr === todayStr,
                isSelected: dateStr === selectedDate,
                tasks: tasksByDate.get(dateStr) || [],
            });
        }

        // Días del mes actual
        for (let dayNum = 1; dayNum <= totalDaysInMonth; dayNum++) {
            const dateObj = new Date(currentYear, currentMonth, dayNum);
            // Asegurar formato YYYY-MM-DD
            const y = dateObj.getFullYear();
            const m = String(dateObj.getMonth() + 1).padStart(2, "0");
            const d = String(dateObj.getDate()).padStart(2, "0");
            const dateStr = `${y}-${m}-${d}`;

            days.push({
                dayNumber: dayNum,
                dateString: dateStr,
                isCurrentMonth: true,
                isToday: dateStr === todayStr,
                isSelected: dateStr === selectedDate,
                tasks: tasksByDate.get(dateStr) || [],
            });
        }

        // Días del próximo mes para completar cuadrícula (hasta múltiplos de 7)
        const remainingCells = (7 - (days.length % 7)) % 7;
        for (let dayNum = 1; dayNum <= remainingCells; dayNum++) {
            const nextMonthDate = new Date(currentYear, currentMonth + 1, dayNum);
            const dateStr = nextMonthDate.toISOString().split("T")[0];
            days.push({
                dayNumber: dayNum,
                dateString: dateStr,
                isCurrentMonth: false,
                isToday: dateStr === todayStr,
                isSelected: dateStr === selectedDate,
                tasks: tasksByDate.get(dateStr) || [],
            });
        }

        return days;
    }, [currentYear, currentMonth, selectedDate, tasksByDate, todayStr]);

    // Tareas de la fecha seleccionada
    const selectedDateTasks = useMemo(() => {
        return tasksByDate.get(selectedDate) || [];
    }, [selectedDate, tasksByDate]);

    // Formato amigable de la fecha seleccionada
    const formattedSelectedDate = useMemo(() => {
        try {
            const parts = selectedDate.split("-");
            if (parts.length === 3) {
                const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
                return new Intl.DateTimeFormat("es-ES", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                }).format(d);
            }
        } catch {
            // fallback
        }
        return selectedDate;
    }, [selectedDate]);

    if (!isOpen && !isMobileView) return null;

    return (
        <aside
            className={`calendar-panel-container ${
                isMobileView ? "calendar-mobile-fullscreen" : "calendar-desktop-sidebar"
            }`}
            aria-label="Panel de calendario interactivo"
        >
            {/* Encabezado del panel */}
            <div className="calendar-panel-header">
                {isMobileView ? (
                    <button
                        type="button"
                        onClick={onClose}
                        className="btn-back-calendar"
                        aria-label="Volver a la lista de tareas"
                    >
                        ← Volver a Tareas
                    </button>
                ) : (
                    <div className="calendar-title-box">
                        <span className="calendar-icon">📅</span>
                        <h2 className="calendar-panel-title">Calendario</h2>
                    </div>
                )}

                <div className="calendar-header-actions">
                    <button
                        type="button"
                        onClick={handleJumpToToday}
                        className="btn-today-pill"
                        title="Ir a la fecha actual"
                    >
                        Hoy
                    </button>

                    {!isMobileView && (
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn-close-calendar"
                            aria-label="Cerrar panel de calendario"
                        >
                            ✕
                        </button>
                    )}
                </div>
            </div>

            {/* Selector de Mes */}
            <div className="calendar-month-navigator">
                <button
                    type="button"
                    onClick={handlePrevMonth}
                    className="btn-month-nav"
                    aria-label="Mes anterior"
                    title="Mes anterior"
                >
                    ‹
                </button>

                <h3 className="calendar-current-month-label">
                    {capitalizedMonth} <span className="year-number">{currentYear}</span>
                </h3>

                <button
                    type="button"
                    onClick={handleNextMonth}
                    className="btn-month-nav"
                    aria-label="Mes siguiente"
                    title="Mes siguiente"
                >
                    ›
                </button>
            </div>

            {/* Días de la semana */}
            <div className="calendar-weekdays-row" aria-hidden="true">
                {WEEKDAYS.map((day) => (
                    <div key={day} className="calendar-weekday-cell">
                        {day}
                    </div>
                ))}
            </div>

            {/* Cuadrícula de días */}
            <div className="calendar-grid" role="grid" aria-label={`Calendario de ${capitalizedMonth} ${currentYear}`}>
                {calendarDays.map((day) => {
                    // Obtener categorías únicas presentes en este día
                    const categoriesInDay = Array.from(
                        new Set(day.tasks.map((t) => t.category || "trabajo"))
                    ) as TaskCategory[];

                    return (
                        <button
                            key={day.dateString}
                            type="button"
                            onClick={() => setSelectedDate(day.dateString)}
                            className={`calendar-day-cell ${
                                !day.isCurrentMonth ? "day-outside-month" : ""
                            } ${day.isToday ? "day-is-today" : ""} ${
                                day.isSelected ? "day-is-selected" : ""
                            } ${day.tasks.length > 0 ? "day-has-tasks" : ""}`}
                            aria-label={`${day.dayNumber} de ${capitalizedMonth}. ${
                                day.tasks.length
                            } tareas.`}
                        >
                            <span className="day-number">{day.dayNumber}</span>

                            {/* Puntos de color por categoría */}
                            {categoriesInDay.length > 0 && (
                                <div className="day-dots-container">
                                    {categoriesInDay.slice(0, 4).map((cat) => (
                                        <span
                                            key={cat}
                                            className="day-category-dot"
                                            style={{
                                                backgroundColor:
                                                    CATEGORY_CONFIG[cat]?.color || "#38bdf8",
                                            }}
                                            title={`Tarea de categoría ${cat}`}
                                        />
                                    ))}
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Leyenda de categorías por color */}
            <div className="calendar-legend-bar" aria-label="Leyenda de categorías">
                <span className="legend-label">Categorías:</span>
                <div className="legend-items-list">
                    {(Object.keys(CATEGORY_CONFIG) as TaskCategory[]).map((catKey) => {
                        const item = CATEGORY_CONFIG[catKey];
                        return (
                            <div key={catKey} className="legend-item">
                                <span
                                    className="legend-dot"
                                    style={{ backgroundColor: item.color }}
                                />
                                <span className="legend-name">{item.label}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Sección de tareas para la fecha seleccionada */}
            <div className="calendar-selected-date-section">
                <div className="selected-date-header">
                    <div className="selected-date-title-box">
                        <span className="selected-date-title">
                            {formattedSelectedDate.charAt(0).toUpperCase() +
                                formattedSelectedDate.slice(1)}
                        </span>
                        <span className="selected-date-count">
                            {selectedDateTasks.length} {selectedDateTasks.length === 1 ? "tarea" : "tareas"}
                        </span>
                    </div>

                    <button
                        type="button"
                        onClick={() => onCreateTaskForDate(selectedDate)}
                        className="btn-create-for-date"
                        title={`Crear nueva tarea para ${selectedDate}`}
                    >
                        ＋ Crear tarea
                    </button>
                </div>

                {/* Listado de tareas de la fecha */}
                {selectedDateTasks.length === 0 ? (
                    <div className="calendar-empty-day">
                        <span className="empty-day-icon">☕</span>
                        <p className="empty-day-text">No hay tareas programadas para esta fecha.</p>
                        <button
                            type="button"
                            onClick={() => onCreateTaskForDate(selectedDate)}
                            className="btn-empty-create"
                        >
                            Programar tarea para este día
                        </button>
                    </div>
                ) : (
                    <div className="calendar-tasks-list">
                        {selectedDateTasks.map((t) => (
                            <div
                                key={t.id}
                                className={`calendar-task-item ${
                                    t.completed ? "task-item-completed" : ""
                                }`}
                            >
                                <input
                                    type="checkbox"
                                    id={`cal-task-${t.id}`}
                                    checked={t.completed}
                                    onChange={(e) => onToggleComplete(t.id, e.target.checked)}
                                    className="calendar-task-checkbox"
                                    aria-label={`Completar: ${t.title}`}
                                />
                                <div className="calendar-task-info">
                                    <label
                                        htmlFor={`cal-task-${t.id}`}
                                        className={`calendar-task-title ${
                                            t.completed ? "title-strike" : ""
                                        }`}
                                    >
                                        {t.title}
                                    </label>
                                    <div className="calendar-task-chips">
                                        <CategoryBadge category={t.category || "trabajo"} size="sm" />
                                        <PriorityBadge priority={t.priority} size="sm" />
                                        {t.dueTime && (
                                            <span className="calendar-time-chip">⏰ {t.dueTime}</span>
                                        )}
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => onEditTask(t)}
                                    className="btn-cal-edit"
                                    title="Editar tarea"
                                    aria-label={`Editar ${t.title}`}
                                >
                                    ✏️
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </aside>
    );
};
