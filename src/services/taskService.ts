import {
    collection,
    addDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    doc,
    query,
    where
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "./firebase";
import type { Task, TaskInput, TaskUpdateInput } from "../types/task";

const COLLECTION_NAME = "tasks";
const LOCAL_STORAGE_PREFIX = "gestor_tasks_";

// Helper para almacenamiento local en modo offline / contingencia
const getLocalTasks = (userId: string): Task[] => {
    try {
        const raw = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}${userId}`);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
};

const saveLocalTasks = (userId: string, tasks: Task[]): void => {
    try {
        localStorage.setItem(`${LOCAL_STORAGE_PREFIX}${userId}`, JSON.stringify(tasks));
    } catch (e) {
        console.error("Error guardando en almacenamiento local:", e);
    }
};

// 1. READ: Obtener todas las tareas de un usuario específico
export const getTasksByUser = async (userId: string): Promise<Task[]> => {
    if (!userId) return [];

    if (isFirebaseConfigured && db) {
        try {
            const q = query(
                collection(db, COLLECTION_NAME),
                where("userId", "==", userId)
            );
            const querySnapshot = await getDocs(q);
            const tasks: Task[] = [];

            querySnapshot.forEach((docSnap) => {
                tasks.push({ id: docSnap.id, ...docSnap.data() } as Task);
            });

            // Ordenamiento por campo order y fecha de creación
            return tasks.sort((a, b) => a.order - b.order || b.createdAt - a.createdAt);
        } catch (error) {
            console.warn("[taskService] Fallo al consultar Firestore, usando respaldo local:", error);
            const local = getLocalTasks(userId);
            return local.sort((a, b) => a.order - b.order || b.createdAt - a.createdAt);
        }
    } else {
        // Modo local
        const local = getLocalTasks(userId);
        return local.sort((a, b) => a.order - b.order || b.createdAt - a.createdAt);
    }
};

// 2. CREATE: Crear una nueva tarea asignada al usuario
export const createTask = async (
    userId: string,
    taskData: TaskInput,
    currentTotalCount: number
): Promise<Task> => {
    if (!userId) throw new Error("Se requiere el UID del usuario para crear una tarea.");
    if (!taskData.title.trim()) throw new Error("El título de la tarea es obligatorio.");

    const now = Date.now();
    const newTaskPayload = {
        userId,
        title: taskData.title.trim(),
        description: taskData.description.trim(),
        completed: false,
        priority: taskData.priority || "media",
        dueDate: taskData.dueDate || "",
        order: currentTotalCount,
        createdAt: now,
        updatedAt: now,
    };

    if (isFirebaseConfigured && db) {
        try {
            const docRef = await addDoc(collection(db, COLLECTION_NAME), newTaskPayload);
            return {
                id: docRef.id,
                ...newTaskPayload,
            };
        } catch (error) {
            console.error("[taskService] Error creando tarea en Firestore:", error);
            throw error;
        }
    } else {
        const localTask: Task = {
            id: "task-" + Math.random().toString(36).substring(2, 9) + "-" + Date.now(),
            ...newTaskPayload,
        };
        const current = getLocalTasks(userId);
        saveLocalTasks(userId, [...current, localTask]);
        return localTask;
    }
};

// 3. UPDATE: Actualizar una tarea existente (Edición completa de título, descripción, prioridad, fecha, estado)
export const updateTask = async (
    taskId: string,
    updates: TaskUpdateInput,
    userId?: string
): Promise<void> => {
    if (!taskId) throw new Error("ID de tarea requerido para actualizar.");

    const sanitizedUpdates = {
        ...updates,
        updatedAt: Date.now(),
    };

    if (isFirebaseConfigured && db) {
        try {
            const taskRef = doc(db, COLLECTION_NAME, taskId);
            await updateDoc(taskRef, sanitizedUpdates);
        } catch (error) {
            console.error("[taskService] Error actualizando tarea en Firestore:", error);
            throw error;
        }
    }

    // Mantener sincronizado el almacenamiento local
    if (userId) {
        const current = getLocalTasks(userId);
        const updated = current.map((t) => (t.id === taskId ? { ...t, ...sanitizedUpdates } : t));
        saveLocalTasks(userId, updated);
    }
};

// 4. DELETE: Eliminar una tarea por ID
export const deleteTask = async (taskId: string, userId?: string): Promise<void> => {
    if (!taskId) throw new Error("ID de tarea requerido para eliminar.");

    if (isFirebaseConfigured && db) {
        try {
            const taskRef = doc(db, COLLECTION_NAME, taskId);
            await deleteDoc(taskRef);
        } catch (error) {
            console.error("[taskService] Error eliminando tarea en Firestore:", error);
            throw error;
        }
    }

    if (userId) {
        const current = getLocalTasks(userId);
        const filtered = current.filter((t) => t.id !== taskId);
        saveLocalTasks(userId, filtered);
    }
};

// 5. REORDER: Actualizar el orden de las tareas tras Drag & Drop
export const reorderTasks = async (tasks: Task[], userId?: string): Promise<void> => {
    // Actualizar concurrentemente o en batch
    const updates = tasks.map((task, index) =>
        updateTask(task.id, { order: index }, userId)
    );
    await Promise.all(updates);
};