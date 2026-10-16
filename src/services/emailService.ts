import type { Task, TaskSummary } from "../types/task";

export interface SendEmailPayload {
    toEmail: string;
    userName?: string;
    tasks: Task[];
    summary: TaskSummary;
}

export interface SendEmailResponse {
    success: boolean;
    message: string;
    messageId?: string;
    isSimulated?: boolean;
}

export const sendTaskSummaryEmail = async (
    payload: SendEmailPayload
): Promise<SendEmailResponse> => {
    if (!payload.toEmail) {
        throw new Error("El correo de destino es obligatorio.");
    }

    try {
        const response = await fetch("/api/send-email", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        // Si estamos en un servidor Vercel con la función desplegada
        if (response.ok) {
            const data = await response.json();
            return {
                success: true,
                message: data.message || "Resumen enviado con éxito por AWS SES.",
                messageId: data.messageId,
            };
        }

        // Si responde error estructurado desde la función
        if (response.status >= 400 && response.status !== 404) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.error || `Error del servidor de correo (código ${response.status})`);
        }

        // Si es 404 (típico en desarrollo local con "vite" sin "vercel dev")
        console.warn("[emailService] Endpoint /api/send-email no disponible en Vite directo. Simulando respuesta exitosa para desarrollo.");
        return {
            success: true,
            message: `Simulación local: El resumen de ${payload.tasks.length} tareas fue procesado para ${payload.toEmail}. En producción en Vercel, AWS SES enviará el correo real.`,
            isSimulated: true,
        };
    } catch (error: any) {
        // Si falló por conexión de red o servidor local
        if (error.message?.includes("Failed to fetch") || error.message?.includes("NetworkError")) {
            console.warn("[emailService] Servidor local sin backend serverless activo. Modo contingencia activado.");
            return {
                success: true,
                message: `Resumen generado para ${payload.toEmail} (${payload.tasks.length} tareas). Al desplegar en Vercel con las credenciales AWS SES configuradas, se emitirá el correo real.`,
                isSimulated: true,
            };
        }
        throw error;
    }
};
