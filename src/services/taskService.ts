import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    query,
    where,
    orderBy,
    onSnapshot,
    writeBatch,
    type Unsubscribe,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Task, TaskInput, TaskUpdateInput } from "../types/task";

const COLLECTION_NAME = "tasks";

// ─────────────────────────────────────────────────────────────────────────────
// 1. SUSCRIPCIÓN EN TIEMPO REAL
// Retorna una función de cancelación (Unsubscribe).
// El callback recibe el array actualizado de tareas del usuario cada vez que
// Firestore detecte un cambio en la colección.
// ─────────────────────────────────────────────────────────────────────────────
export const subscribeToUserTasks = (
    userId: string,
    onUpdate: (tasks: Task[]) => void,
    onError?: (error: Error) => void
): Unsubscribe => {
    if (!userId) {
        onUpdate([]);
        return () => {};
    }

    const q = query(
        collection(db, COLLECTION_NAME),
        where("userId", "==", userId),
        orderBy("order", "asc")
    );

    return onSnapshot(
        q,
        (snapshot) => {
            const tasks: Task[] = snapshot.docs.map((docSnap) => ({
                id: docSnap.id,
                ...(docSnap.data() as Omit<Task, "id">),
            }));
            onUpdate(tasks);
        },
        (error) => {
            console.error("[taskService] Error en suscripción Firestore:", error);
            onError?.(error);
        }
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. LECTURA PUNTUAL (para compatibilidad con tests y usos sin suscripción)
// Usa un flag para evitar el problema de zona muerta temporal cuando
// onSnapshot llama al callback síncronamente (como hacen los mocks en tests).
// ─────────────────────────────────────────────────────────────────────────────
export const getTasksByUser = async (userId: string): Promise<Task[]> => {
    if (!userId) return [];
    return new Promise((resolve, reject) => {
        let unsubFn: (() => void) | null = null;
        let resolved = false;

        unsubFn = subscribeToUserTasks(
            userId,
            (tasks) => {
                if (!resolved) {
                    resolved = true;
                    // Si onSnapshot es síncrono (mock en tests), unsubFn puede
                    // ser null aún; en ese caso lo llamamos en el microtask siguiente.
                    if (unsubFn) {
                        unsubFn();
                    } else {
                        // Diferir la cancelación para cuando la asignación termine
                        Promise.resolve().then(() => unsubFn?.());
                    }
                    resolve(tasks);
                }
            },
            (error) => {
                if (!resolved) {
                    resolved = true;
                    reject(error);
                }
            }
        );
    });
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. CREAR TAREA
// ─────────────────────────────────────────────────────────────────────────────
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
        title:       taskData.title.trim(),
        description: (taskData.description || "").trim(),
        completed:   taskData.status === "completada",
        priority:    taskData.priority  || "media",
        category:    taskData.category  || "trabajo",
        status:      taskData.status    || "pendiente",
        dueDate:     taskData.dueDate   || "",
        dueTime:     taskData.dueTime   || "",
        order:       currentTotalCount,
        createdAt:   now,
        updatedAt:   now,
    };

    const docRef = await addDoc(collection(db, COLLECTION_NAME), newTaskPayload);
    return { id: docRef.id, ...newTaskPayload };
};

// ─────────────────────────────────────────────────────────────────────────────
// 4. ACTUALIZAR TAREA
// Sincroniza automáticamente los campos `completed` y `status` si solo se
// provee uno de los dos, manteniendo coherencia en el documento Firestore.
// ─────────────────────────────────────────────────────────────────────────────
export const updateTask = async (
    taskId: string,
    updates: TaskUpdateInput
): Promise<void> => {
    if (!taskId) throw new Error("ID de tarea requerido para actualizar.");

    // Sincronización completed ↔ status
    let { completed, status } = updates;
    if (completed !== undefined && status === undefined) {
        status = completed ? "completada" : "pendiente";
    } else if (status !== undefined && completed === undefined) {
        completed = status === "completada";
    }

    const sanitized: Record<string, unknown> = {
        ...updates,
        ...(completed !== undefined ? { completed } : {}),
        ...(status    !== undefined ? { status }    : {}),
        updatedAt: Date.now(),
    };

    const taskRef = doc(db, COLLECTION_NAME, taskId);
    await updateDoc(taskRef, sanitized);
};

// ─────────────────────────────────────────────────────────────────────────────
// 5. ELIMINAR TAREA
// ─────────────────────────────────────────────────────────────────────────────
export const deleteTask = async (taskId: string): Promise<void> => {
    if (!taskId) throw new Error("ID de tarea requerido para eliminar.");
    const taskRef = doc(db, COLLECTION_NAME, taskId);
    await deleteDoc(taskRef);
};

// ─────────────────────────────────────────────────────────────────────────────
// 6. REORDENAR (DRAG & DROP) — batch write para eficiencia
// Actualiza el campo `order` de todas las tareas en una sola operación atómica.
// ─────────────────────────────────────────────────────────────────────────────
export const reorderTasks = async (tasks: Task[]): Promise<void> => {
    const batch = writeBatch(db);
    tasks.forEach((task, index) => {
        const taskRef = doc(db, COLLECTION_NAME, task.id);
        batch.update(taskRef, { order: index, updatedAt: Date.now() });
    });
    await batch.commit();
};