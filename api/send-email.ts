import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

// Interfaces para tipado estricto
interface TaskItem {
    id: string;
    title: string;
    description?: string;
    completed: boolean;
    priority: "alta" | "media" | "baja";
    dueDate?: string;
}

interface SummaryStats {
    total: number;
    completed: number;
    pending: number;
    highPriority: number;
    overdue: number;
}

interface RequestBody {
    toEmail: string;
    userName?: string;
    tasks: TaskItem[];
    summary: SummaryStats;
}

export const generateEmailHtml = (
    userName: string,
    toEmail: string,
    tasks: TaskItem[],
    summary: SummaryStats
): string => {
    const completionRate = summary.total > 0 ? Math.round((summary.completed / summary.total) * 100) : 0;

    const tasksRows = tasks
        .map((t) => {
            const priorityColor =
                t.priority === "alta" ? "#dc2626" : t.priority === "media" ? "#d97706" : "#16a34a";
            const statusLabel = t.completed ? "✓ Completada" : "⏳ Pendiente";
            const statusBg = t.completed ? "#f0fdf4" : "#fefce8";
            const statusText = t.completed ? "#15803d" : "#a16207";

            return `
            <tr>
                <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 14px; font-weight: 600; color: #1e293b;">
                    ${t.title}
                    ${t.description ? `<div style="font-size: 12px; color: #64748b; font-weight: normal; margin-top: 4px;">${t.description}</div>` : ""}
                </td>
                <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 13px; text-align: center;">
                    <span style="display: inline-block; padding: 2px 8px; border-radius: 9999px; font-weight: 600; font-size: 11px; text-transform: uppercase; color: ${priorityColor}; background-color: ${priorityColor}15;">
                        ${t.priority}
                    </span>
                </td>
                <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #64748b; text-align: center;">
                    ${t.dueDate || "Sin fecha"}
                </td>
                <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 13px; text-align: center;">
                    <span style="display: inline-block; padding: 4px 10px; border-radius: 6px; font-weight: 600; font-size: 12px; color: ${statusText}; background-color: ${statusBg};">
                        ${statusLabel}
                    </span>
                </td>
            </tr>
        `;
        })
        .join("");

    return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="utf-8">
        <title>Resumen de Tareas Estratégicas - MateCode</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #334155;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 32px 16px;">
            <tr>
                <td align="center">
                    <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 640px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03); border: 1px solid #e2e8f0;">
                        <!-- Encabezado de Marca -->
                        <tr>
                            <td style="background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%); padding: 32px 24px; text-align: center;">
                                <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">
                                    MateCode | Gestor Estratégico de Tareas
                                </h1>
                                <p style="margin: 8px 0 0 0; color: #bfdbfe; font-size: 14px;">
                                    Reporte ejecutivo y estado de tus actividades
                                </p>
                            </td>
                        </tr>

                        <!-- Saludo -->
                        <tr>
                            <td style="padding: 24px 24px 16px 24px;">
                                <h2 style="margin: 0; font-size: 18px; color: #0f172a; font-weight: 700;">
                                    Hola, ${userName || toEmail}
                                </h2>
                                <p style="margin: 8px 0 0 0; font-size: 14px; line-height: 1.5; color: #475569;">
                                    Aquí tienes el resumen actualizado de tus tareas registradas en la plataforma.
                                </p>
                            </td>
                        </tr>

                        <!-- Tarjetas de Estadísticas -->
                        <tr>
                            <td style="padding: 8px 24px 20px 24px;">
                                <table width="100%" cellpadding="0" cellspacing="0">
                                    <tr>
                                        <td width="25%" style="background-color: #eff6ff; border: 1px solid #dbeafe; border-radius: 8px; padding: 12px; text-align: center;">
                                            <div style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: #1e40af;">Total</div>
                                            <div style="font-size: 22px; font-weight: 800; color: #1e3a8a; margin-top: 2px;">${summary.total}</div>
                                        </td>
                                        <td width="5%"></td>
                                        <td width="25%" style="background-color: #f0fdf4; border: 1px solid #dcfce7; border-radius: 8px; padding: 12px; text-align: center;">
                                            <div style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: #166534;">Completas</div>
                                            <div style="font-size: 22px; font-weight: 800; color: #14532d; margin-top: 2px;">${summary.completed}</div>
                                        </td>
                                        <td width="5%"></td>
                                        <td width="25%" style="background-color: #fefce8; border: 1px solid #fef08a; border-radius: 8px; padding: 12px; text-align: center;">
                                            <div style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: #854d0e;">Pendientes</div>
                                            <div style="font-size: 22px; font-weight: 800; color: #713f12; margin-top: 2px;">${summary.pending}</div>
                                        </td>
                                        <td width="5%"></td>
                                        <td width="25%" style="background-color: #fdf2f8; border: 1px solid #fce7f3; border-radius: 8px; padding: 12px; text-align: center;">
                                            <div style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: #9d174d;">Progreso</div>
                                            <div style="font-size: 22px; font-weight: 800; color: #831843; margin-top: 2px;">${completionRate}%</div>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>

                        <!-- Tabla de Tareas -->
                        <tr>
                            <td style="padding: 0 24px 24px 24px;">
                                <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
                                    <thead>
                                        <tr style="background-color: #f1f5f9; text-align: left;">
                                            <th style="padding: 10px 16px; font-size: 12px; font-weight: 700; color: #475569; text-transform: uppercase;">Tarea</th>
                                            <th style="padding: 10px 16px; font-size: 12px; font-weight: 700; color: #475569; text-transform: uppercase; text-align: center;">Prioridad</th>
                                            <th style="padding: 10px 16px; font-size: 12px; font-weight: 700; color: #475569; text-transform: uppercase; text-align: center;">Vence</th>
                                            <th style="padding: 10px 16px; font-size: 12px; font-weight: 700; color: #475569; text-transform: uppercase; text-align: center;">Estado</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${tasks.length > 0 ? tasksRows : `<tr><td colspan="4" style="padding: 24px; text-align: center; color: #94a3b8; font-size: 14px;">No tienes tareas registradas actualmente.</td></tr>`}
                                    </tbody>
                                </table>
                            </td>
                        </tr>

                        <!-- Pie de página -->
                        <tr>
                            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 24px; text-align: center;">
                                <p style="margin: 0; font-size: 12px; color: #64748b;">
                                    Este correo fue generado automáticamente por tu aplicación <strong>Gestor Estratégico de Tareas</strong> a través de <strong>AWS SES</strong> en Vercel Serverless.
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    `;
};

export const generatePlainText = (
    userName: string,
    tasks: TaskItem[],
    summary: SummaryStats
): string => {
    let text = `MATECODE - GESTOR ESTRATÉGICO DE TAREAS\n`;
    text += `Hola ${userName || "Usuario"},\n\n`;
    text += `RESUMEN DE ESTADO:\n`;
    text += `- Total de tareas: ${summary.total}\n`;
    text += `- Completadas: ${summary.completed}\n`;
    text += `- Pendientes: ${summary.pending}\n\n`;
    text += `DETALLE DE TAREAS:\n`;
    tasks.forEach((t, i) => {
        text += `${i + 1}. [${t.completed ? "X" : " "}] ${t.title} (${t.priority}) - Vence: ${t.dueDate || "Sin fecha"}\n`;
        if (t.description) text += `   Nota: ${t.description}\n`;
    });
    return text;
};

// Handler Serverless de Vercel (Edge / Node.js)
export default async function handler(req: any, res: any) {
    // Manejo de CORS
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version");

    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    if (req.method !== "POST") {
        return res.status(405).json({ error: "Método no permitido. Solo se acepta POST." });
    }

    try {
        const body: RequestBody = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
        const { toEmail, userName, tasks = [], summary } = body;

        if (!toEmail) {
            return res.status(400).json({ error: "El campo 'toEmail' es requerido." });
        }

        // Credenciales AWS desde variables de entorno del servidor (¡NUNCA expuestas en el cliente!)
        const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
        const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
        const region = process.env.AWS_REGION || "us-east-1";
        const senderEmail = process.env.AWS_SES_SENDER_EMAIL || process.env.AWS_SENDER_EMAIL;

        if (!accessKeyId || !secretAccessKey || !senderEmail) {
            console.warn("[AWS SES] Credenciales incompletas en variables de entorno del servidor.");
            return res.status(503).json({
                error: "El servicio de correo AWS SES aún no está configurado en las variables de entorno de Vercel (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_SES_SENDER_EMAIL).",
                configured: false,
            });
        }

        const sesClient = new SESClient({
            region,
            credentials: {
                accessKeyId,
                secretAccessKey,
            },
        });

        const htmlContent = generateEmailHtml(userName || "", toEmail, tasks, summary || {
            total: tasks.length,
            completed: tasks.filter((t) => t.completed).length,
            pending: tasks.filter((t) => !t.completed).length,
            highPriority: tasks.filter((t) => t.priority === "alta").length,
            overdue: 0,
        });

        const textContent = generatePlainText(userName || "", tasks, summary || {
            total: tasks.length,
            completed: tasks.filter((t) => t.completed).length,
            pending: tasks.filter((t) => !t.completed).length,
            highPriority: 0,
            overdue: 0,
        });

        const command = new SendEmailCommand({
            Source: senderEmail,
            Destination: {
                ToAddresses: [toEmail],
            },
            Message: {
                Subject: {
                    Data: `📊 Resumen de Tareas Estratégicas - ${new Date().toLocaleDateString("es-ES")}`,
                    Charset: "UTF-8",
                },
                Body: {
                    Html: {
                        Data: htmlContent,
                        Charset: "UTF-8",
                    },
                    Text: {
                        Data: textContent,
                        Charset: "UTF-8",
                    },
                },
            },
        });

        const result = await sesClient.send(command);

        return res.status(200).json({
            success: true,
            message: "Correo enviado con éxito a través de AWS SES.",
            messageId: result.MessageId,
        });
    } catch (error: any) {
        console.error("[AWS SES Error]:", error);
        return res.status(500).json({
            error: error.message || "Error al enviar el correo con AWS SES.",
        });
    }
}
