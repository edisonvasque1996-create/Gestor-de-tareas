import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TodoForm } from '../../src/components/TodoForm';

describe('<TodoForm /> (Component Tests)', () => {
    it('debe renderizar los campos principales del formulario', () => {
        render(<TodoForm onAddTask={vi.fn()} />);

        expect(screen.getByPlaceholderText(/ej. diseñar arquitectura/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /agregar tarea/i })).toBeInTheDocument();
    });

    it('debe enviar la tarea con los datos ingresados al hacer submit', async () => {
        const handleAddTask = vi.fn().mockResolvedValue(undefined);
        const user = userEvent.setup();

        render(<TodoForm onAddTask={handleAddTask} />);

        const titleInput = screen.getByPlaceholderText(/ej. diseñar arquitectura/i);
        await user.type(titleInput, 'Implementar autenticación');

        const submitBtn = screen.getByRole('button', { name: /agregar tarea/i });
        await user.click(submitBtn);

        await waitFor(() => {
            expect(handleAddTask).toHaveBeenCalledTimes(1);
            expect(handleAddTask).toHaveBeenCalledWith(
                expect.objectContaining({
                    title: 'Implementar autenticación',
                    priority: 'media',
                })
            );
        });

        // El campo debe limpiarse tras el envío
        expect(titleInput).toHaveValue('');
    });

    it('no debe llamar onAddTask si el título está vacío', async () => {
        const handleAddTask = vi.fn();
        render(<TodoForm onAddTask={handleAddTask} />);

        const form = screen.getByRole('form', { name: /crear nueva tarea/i });
        fireEvent.submit(form);

        expect(handleAddTask).not.toHaveBeenCalled();
    });
});
