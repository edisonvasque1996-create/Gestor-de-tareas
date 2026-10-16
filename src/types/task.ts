export type PriorityLevel = 'baja' | 'media' | 'alta';

export type TaskStatus = 'todas' | 'pendientes' | 'completadas';

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
}

export interface TaskInput {
    title: string;
    description: string;
    priority: PriorityLevel;
    dueDate: string;
}

export interface TaskUpdateInput {
    title?: string;
    description?: string;
    completed?: boolean;
    priority?: PriorityLevel;
    dueDate?: string;
    order?: number;
}

export interface TaskSummary {
    total: number;
    completed: number;
    pending: number;
    highPriority: number;
    overdue: number;
}