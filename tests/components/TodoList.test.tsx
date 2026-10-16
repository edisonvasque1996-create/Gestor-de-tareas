import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TodoList } from '../../src/components/TodoList';
import type { Task } from '../../src/types/task';

describe('<TodoList /> (Component Tests)', () => {
    const mockTasks: Task[] = [
        {
            id: 't-1',
            userId: 'u-1',
            title: 'Tarea Pendiente',
            description: 'Detalle pendiente',
            completed: false,
            priority: 'alta',
            dueDate: '2026-11-15',
            order: 0,
            createdAt: Date.now(),
        },
        {
            id: 't-2',
            userId: 'u-1',
            title: 'Tarea Completada',
            description: 'Detalle completada',
            completed: true,
            priority: 'baja',
            dueDate: '2026-11-20',
            order: 1,
            createdAt: Date.now(),
        },
    ];

    it('debe renderizar todas las tareas inicialmente', () => {
        render(
            <TodoList
                tasks={mockTasks}
                onToggleComplete={vi.fn()}
                onEdit={vi.fn()}
                onDelete={vi.fn()}
                onReorder={vi.fn()}
            />
        );

        expect(screen.getByText('Tarea Pendiente')).toBeInTheDocument();
        expect(screen.getByText('Tarea Completada')).toBeInTheDocument();
    });

    it('debe filtrar mostrando únicamente las tareas completadas cuando se selecciona el filtro', async () => {
        const user = userEvent.setup();

        render(
            <TodoList
                tasks={mockTasks}
                onToggleComplete={vi.fn()}
                onEdit={vi.fn()}
                onDelete={vi.fn()}
                onReorder={vi.fn()}
            />
        );

        const completadasBtn = screen.getByRole('button', { name: /completadas/i });
        await user.click(completadasBtn);

        expect(screen.getByText('Tarea Completada')).toBeInTheDocument();
        expect(screen.queryByText('Tarea Pendiente')).not.toBeInTheDocument();
    });

    it('debe filtrar tareas según el texto ingresado en la búsqueda', async () => {
        const user = userEvent.setup();

        render(
            <TodoList
                tasks={mockTasks}
                onToggleComplete={vi.fn()}
                onEdit={vi.fn()}
                onDelete={vi.fn()}
                onReorder={vi.fn()}
            />
        );

        const searchInput = screen.getByPlaceholderText(/buscar tareas/i);
        await user.type(searchInput, 'Pendiente');

        expect(screen.getByText('Tarea Pendiente')).toBeInTheDocument();
        expect(screen.queryByText('Tarea Completada')).not.toBeInTheDocument();
    });

    it('debe mostrar el estado vacío cuando no hay tareas que coincidan', async () => {
        const user = userEvent.setup();

        render(
            <TodoList
                tasks={mockTasks}
                onToggleComplete={vi.fn()}
                onEdit={vi.fn()}
                onDelete={vi.fn()}
                onReorder={vi.fn()}
            />
        );

        const searchInput = screen.getByPlaceholderText(/buscar tareas/i);
        await user.type(searchInput, 'PalabraInexistente123');

        expect(screen.getByText(/no hay tareas que coincidan/i)).toBeInTheDocument();
    });
});
