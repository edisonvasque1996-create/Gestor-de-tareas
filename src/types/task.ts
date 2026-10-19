export type PriorityLevel = 'baja' | 'media' | 'alta';

export type TaskCategory = 'trabajo' | 'personal' | 'estudios' | 'casa';

export type TaskState = 'pendiente' | 'en_progreso' | 'completada';

export type TaskStatus = 'todas' | 'pendientes' | 'completadas';

export type TaskFilterStatus = 'todas' | 'pendientes' | 'en_progreso' | 'completadas' | 'hoy' | 'proximas' | 'vencidas';

export type SortOption = 'dueDate' | 'priority' | 'createdAt' | 'title';

export interface Task {
    id: string;               // Identificador único (Firestore ID o UUID local)
    userId: string;           // UID del usuario dueño de la tarea (aislamiento estricto)
    title: string;            // Título de la tarea
    description: string;      // Descripción detallada
    completed: boolean;       // Estado de completado
    priority: PriorityLevel;  // Prioridad: baja, media o alta
    dueDate: string;          // Fecha de vencimiento (YYYY-MM-DD)
    order: number;            // Índice numérico para drag & drop
    createdAt: number;        // Timestamp de creación
    updatedAt?: number;       // Timestamp de última actualización
    category?: TaskCategory;  // Categoría: trabajo, personal, estudios, casa
    status?: TaskState;       // Estado visual: pendiente, en_progreso, completada
    dueTime?: string;         // Hora opcional (HH:mm)
}

export interface TaskInput {
    title: string;
    description: string;
    priority: PriorityLevel;
    dueDate: string;
    category?: TaskCategory;
    status?: TaskState;
    dueTime?: string;
}

export interface TaskUpdateInput {
    title?: string;
    description?: string;
    completed?: boolean;
    priority?: PriorityLevel;
    dueDate?: string;
    order?: number;
    category?: TaskCategory;
    status?: TaskState;
    dueTime?: string;
}

export interface TaskSummary {
    total: number;
    completed: number;
    pending: number;
    inProgress?: number;
    highPriority: number;
    overdue: number;
}