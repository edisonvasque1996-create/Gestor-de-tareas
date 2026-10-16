import { describe, it, expect, beforeEach } from 'vitest';
import { createTask, getTasksByUser, updateTask, deleteTask, reorderTasks } from '../../src/services/taskService';
import type { TaskInput } from '../../src/types/task';

describe('taskService (Unit Tests)', () => {
    const testUserId = 'test-user-123';

    beforeEach(() => {
        localStorage.clear();
    });

    it('debe crear una nueva tarea correctamente en almacenamiento local', async () => {
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
        expect(tasks[0].title).toBe('Tarea 1');
        expect(tasks[1].title).toBe('Tarea 2');
    });

    it('debe actualizar una tarea existente (completar y editar título)', async () => {
        const task = await createTask(testUserId, { title: 'Original', description: '', priority: 'baja', dueDate: '' }, 0);

        await updateTask(task.id, { completed: true, title: 'Modificado' }, testUserId);

        const tasks = await getTasksByUser(testUserId);
        const updated = tasks.find(t => t.id === task.id);
        expect(updated?.completed).toBe(true);
        expect(updated?.title).toBe('Modificado');
    });

    it('debe eliminar una tarea por su identificador', async () => {
        const task = await createTask(testUserId, { title: 'A borrar', description: '', priority: 'alta', dueDate: '' }, 0);

        await deleteTask(task.id, testUserId);

        const tasks = await getTasksByUser(testUserId);
        expect(tasks.find(t => t.id === task.id)).toBeUndefined();
    });

    it('debe reordenar las tareas según los índices asignados', async () => {
        const t1 = await createTask(testUserId, { title: 'T1', description: '', priority: 'baja', dueDate: '' }, 0);
        const t2 = await createTask(testUserId, { title: 'T2', description: '', priority: 'media', dueDate: '' }, 1);

        // Invertir orden
        await reorderTasks([t2, t1], testUserId);

        const tasks = await getTasksByUser(testUserId);
        expect(tasks[0].title).toBe('T2');
        expect(tasks[1].title).toBe('T1');
    });
});
