/**
 * Tests unitarios del taskService.
 *
 * Como el servicio ahora usa Firestore exclusivamente, mockeamos el módulo
 * de Firebase con vi.mock() para que los tests corran sin red y sin
 * credenciales reales.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';

// ── Tipos del módulo ──────────────────────────────────────────────────────────
import type { TaskInput } from '../../src/types/task';

// ── Mock de firebase/firestore ────────────────────────────────────────────────
// Simulamos una "base de datos en memoria" para los tests.
const mockStore: Record<string, Record<string, unknown>> = {};
let autoId = 0;

vi.mock('firebase/firestore', () => {
    const generateId = () => `mock-doc-${++autoId}`;

    return {
        collection: vi.fn((_db, col) => ({ _col: col })),
        doc: vi.fn((_db, col, id) => ({ _col: col, _id: id })),
        query: vi.fn((colRef, ...constraints) => ({ _col: colRef._col, _constraints: constraints })),
        where: vi.fn((field, op, val) => ({ _field: field, _op: op, _val: val })),
        orderBy: vi.fn((field, dir) => ({ _field: field, _dir: dir })),

        addDoc: vi.fn(async (colRef: { _col: string }, data: Record<string, unknown>) => {
            const id = generateId();
            if (!mockStore[colRef._col]) mockStore[colRef._col] = {};
            mockStore[colRef._col][id] = { ...data };
            return { id };
        }),

        updateDoc: vi.fn(async (docRef: { _col: string; _id: string }, updates: Record<string, unknown>) => {
            if (mockStore[docRef._col]?.[docRef._id]) {
                mockStore[docRef._col][docRef._id] = {
                    ...mockStore[docRef._col][docRef._id],
                    ...updates,
                };
            }
        }),

        deleteDoc: vi.fn(async (docRef: { _col: string; _id: string }) => {
            delete mockStore[docRef._col]?.[docRef._id];
        }),

        onSnapshot: vi.fn((queryObj: { _col: string; _constraints: Array<{ _field: string; _val: unknown }> }, cb: (snap: unknown) => void) => {
            const col = queryObj._col;
            const constraints = queryObj._constraints || [];
            const docs = Object.entries(mockStore[col] || {})
                .filter(([, data]) => {
                    return constraints.every((c) => {
                        if (c._field && '_val' in c) {
                            return (data as Record<string, unknown>)[c._field] === c._val;
                        }
                        return true;
                    });
                })
                .map(([id, data]) => ({
                    id,
                    data: () => data,
                }));
            cb({ docs });
            return () => { }; // unsubscribe noop
        }),

        writeBatch: vi.fn(() => ({
            update: vi.fn((docRef: { _col: string; _id: string }, data: Record<string, unknown>) => {
                if (mockStore[docRef._col]?.[docRef._id]) {
                    mockStore[docRef._col][docRef._id] = {
                        ...mockStore[docRef._col][docRef._id],
                        ...data,
                    };
                }
            }),
            commit: vi.fn(async () => { }),
        })),

        getFirestore: vi.fn(() => ({})),
    };
});

// ── Mock de ./firebase ────────────────────────────────────────────────────────
vi.mock('../../src/services/firebase', () => ({
    db: {},
    isFirebaseConfigured: true,
    auth: {},
    googleProvider: {},
}));

// ── Importar el servicio DESPUÉS de los mocks ─────────────────────────────────
import { createTask, getTasksByUser, updateTask, deleteTask, reorderTasks } from '../../src/services/taskService';

// ─────────────────────────────────────────────────────────────────────────────

describe('taskService (Unit Tests con mock de Firestore)', () => {
    const testUserId = 'test-user-123';

    beforeEach(() => {
        // Limpiar el store en memoria entre cada test
        Object.keys(mockStore).forEach((k) => delete mockStore[k]);
        autoId = 0;
    });

    it('debe crear una nueva tarea correctamente', async () => {
        const input: TaskInput = {
            title: 'Diseñar arquitectura',
            description: 'Definir entidades e interfaces',
            priority: 'alta',
            dueDate: '2026-12-01',
        };

        const newTask = await createTask(testUserId, input, 0);

        expect(newTask.id).toBeDefined();
        expect(newTask.userId).toBe(testUserId);
        expect(newTask.title).toBe('Diseñar arquitectura');
        expect(newTask.completed).toBe(false);
        expect(newTask.priority).toBe('alta');
        expect(newTask.order).toBe(0);
    });

    it('debe arrojar error si el título está vacío', async () => {
        const invalidInput: TaskInput = {
            title: '   ',
            description: 'Sin título',
            priority: 'media',
            dueDate: '',
        };

        await expect(createTask(testUserId, invalidInput, 0)).rejects.toThrow(
            'El título de la tarea es obligatorio'
        );
    });

    it('debe recuperar las tareas creadas para un usuario específico', async () => {
        await createTask(testUserId, { title: 'Tarea 1', description: '', priority: 'baja', dueDate: '' }, 0);
        await createTask(testUserId, { title: 'Tarea 2', description: '', priority: 'media', dueDate: '' }, 1);

        const tasks = await getTasksByUser(testUserId);
        expect(tasks).toHaveLength(2);
    });

    it('debe actualizar una tarea existente (completar y editar título)', async () => {
        const task = await createTask(testUserId, { title: 'Original', description: '', priority: 'baja', dueDate: '' }, 0);

        await updateTask(task.id, { completed: true, title: 'Modificado' });

        const tasks = await getTasksByUser(testUserId);
        const updated = tasks.find(t => t.id === task.id);
        expect(updated?.completed).toBe(true);
        expect(updated?.title).toBe('Modificado');
    });

    it('debe eliminar una tarea por su identificador', async () => {
        const task = await createTask(testUserId, { title: 'A borrar', description: '', priority: 'alta', dueDate: '' }, 0);

        await deleteTask(task.id);

        const tasks = await getTasksByUser(testUserId);
        expect(tasks.find(t => t.id === task.id)).toBeUndefined();
    });

    it('debe reordenar las tareas según los índices asignados (batch)', async () => {
        const t1 = await createTask(testUserId, { title: 'T1', description: '', priority: 'baja', dueDate: '' }, 0);
        const t2 = await createTask(testUserId, { title: 'T2', description: '', priority: 'media', dueDate: '' }, 1);

        // Invertir orden
        await reorderTasks([{ ...t2, order: 0 }, { ...t1, order: 1 }]);

        // El mock de writeBatch.update actualiza el store síncronamente
        const tasks = await getTasksByUser(testUserId);
        const found1 = tasks.find(t => t.id === t1.id);
        const found2 = tasks.find(t => t.id === t2.id);
        expect(found2?.order).toBe(0);
        expect(found1?.order).toBe(1);
    });
});
