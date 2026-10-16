import { describe, it, expect } from 'vitest';
import { generateEmailHtml, generatePlainText } from '../../api/send-email';

describe('AWS SES Email Templates (Unit Tests)', () => {
    const mockTasks = [
        {
            id: '1',
            title: 'Configurar AWS SES',
            description: 'Crear plantilla y verificar remitente',
            completed: true,
            priority: 'alta' as const,
            dueDate: '2026-10-20',
        },
        {
            id: '2',
            title: 'Ejecutar pruebas unitarias',
            description: 'Vitest y React Testing Library',
            completed: false,
            priority: 'media' as const,
            dueDate: '2026-10-25',
        },
    ];

    const mockSummary = {
        total: 2,
        completed: 1,
        pending: 1,
        highPriority: 1,
        overdue: 0,
    };

    it('debe generar la plantilla HTML con el remitente, métricas y detalles de tareas', () => {
        const html = generateEmailHtml('Juan Perez', 'juan@matecode.com', mockTasks, mockSummary);

        expect(html).toContain('MateCode | Gestor Estratégico de Tareas');
        expect(html).toContain('Juan Perez');
        expect(html).toContain('Configurar AWS SES');
        expect(html).toContain('Ejecutar pruebas unitarias');
        expect(html).toContain('50%'); // Completion rate 1/2
        expect(html).toContain('Total');
        expect(html).toContain('Completas');
        expect(html).toContain('Pendientes');
    });

    it('debe generar la versión de texto plano con la información clave', () => {
        const text = generatePlainText('Juan Perez', mockTasks, mockSummary);

        expect(text).toContain('MATECODE - GESTOR ESTRATÉGICO DE TAREAS');
        expect(text).toContain('Total de tareas: 2');
        expect(text).toContain('Completadas: 1');
        expect(text).toContain('[X] Configurar AWS SES');
        expect(text).toContain('[ ] Ejecutar pruebas unitarias');
    });
});
