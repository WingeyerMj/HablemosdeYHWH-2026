const nodemailer = require('nodemailer');
const Subscriber = require('../models/Subscriber');

// Crear transporte reutilizable
function getTransporter() {
    if (process.env.SMTP_HOST && process.env.SMTP_USER) {
        return nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT) || 587,
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
    }

    // Default: Gmail
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER || 'hablemosdeyhwh2024@gmail.com',
            pass: process.env.GMAIL_APP_PASSWORD || ''
        }
    });
}

const typeLabels = {
    parasha: { title: '📖 Nueva Parashá de la Torá', color: '#d4a853', bg: '#2b231d' },
    ensenanza: { title: '📚 Nueva Enseñanza Bíblica', color: '#38bdf8', bg: '#0f172a' },
    haftara: { title: '📜 Nueva Haftará (Lectura Profética)', color: '#fbbf24', bg: '#1c1917' },
    semillas: { title: '🌱 Semillas de Torah · Novedad Infantil', color: '#c084fc', bg: '#3b0764' },
    blog: { title: '📰 Nuevo Artículo / Estudio', color: '#34d399', bg: '#064e3b' },
    evento: { title: '🗓️ Próximo Evento / Encuentro', color: '#f97316', bg: '#431407' },
    general: { title: '✨ Novedad en Hablemos de YHWH', color: '#d4a853', bg: '#181411' }
};

class NotificationService {
    /**
     * Enviar notificación automática a todos los suscriptores cuando se publica nuevo contenido
     */
    static async notifySubscribers({ type = 'general', title, subtitle = '', link = '/', description = '', image_url = '', author = 'Hablemos de YHWH' }) {
        try {
            const subscribers = await Subscriber.getActive();
            if (!subscribers || subscribers.length === 0) {
                console.log('ℹ️ No hay suscriptores activos para notificar.');
                return { success: true, count: 0 };
            }

            const emails = subscribers.map(s => s.email).filter(Boolean);
            if (emails.length === 0) return { success: true, count: 0 };

            const config = typeLabels[type] || typeLabels.general;
            const fullUrl = link.startsWith('http') ? link : `https://www.hablemosdeyhwh.com${link.startsWith('/') ? link : '/' + link}`;
            const fullImg = image_url ? (image_url.startsWith('http') ? image_url : `https://www.hablemosdeyhwh.com${image_url.startsWith('/') ? image_url : '/' + image_url}`) : '';

            const emailSubject = `✨ ${config.title}: ${title}`;

            const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${emailSubject}</title>
            </head>
            <body style="margin: 0; padding: 0; background-color: #f4efe6; font-family: 'Segoe UI', Helvetica, Arial, sans-serif; color: #2c2520;">
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f4efe6; padding: 30px 15px;">
                    <tr>
                        <td align="center">
                            <table width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.08); border: 1px solid #e5dcce;">
                                
                                <!-- Encabezado Dorado / Institucional -->
                                <tr>
                                    <td align="center" style="background: linear-gradient(135deg, #181411 0%, #2b231d 50%, #151210 100%); padding: 35px 25px; border-bottom: 3px solid #d4a853;">
                                        <div style="color: #d4a853; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 6px;">
                                            COMUNIDAD DE FE Y RAÍCES HEBREAS
                                        </div>
                                        <h1 style="color: #ffffff; font-size: 26px; margin: 0; font-weight: 800; letter-spacing: 0.5px;">
                                            Hablemos de YHWH
                                        </h1>
                                        <div style="color: rgba(255,255,255,0.7); font-size: 13px; margin-top: 5px;">
                                            www.hablemosdeyhwh.com
                                        </div>
                                    </td>
                                </tr>

                                <!-- Categoría / Badge -->
                                <tr>
                                    <td style="padding: 25px 30px 10px 30px;">
                                        <span style="display: inline-block; background-color: ${config.bg}; color: ${config.color}; font-size: 12px; font-weight: 700; padding: 6px 14px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.5px;">
                                            ${config.title}
                                        </span>
                                    </td>
                                </tr>

                                <!-- Título Principal -->
                                <tr>
                                    <td style="padding: 10px 30px 15px 30px;">
                                        <h2 style="color: #1a1614; font-size: 24px; font-weight: 800; line-height: 1.35; margin: 0;">
                                            ${title}
                                        </h2>
                                        ${subtitle ? `<div style="color: #d4a853; font-size: 16px; font-weight: 600; margin-top: 6px;">${subtitle}</div>` : ''}
                                    </td>
                                </tr>

                                <!-- Imagen de Portada si existe -->
                                ${fullImg ? `
                                <tr>
                                    <td style="padding: 0 30px 20px 30px;">
                                        <div style="border-radius: 12px; overflow: hidden; border: 1px solid #eee; background-color: #000; text-align: center;">
                                            <img src="${fullImg}" alt="${title}" style="max-width: 100%; height: auto; display: block; margin: 0 auto;">
                                        </div>
                                    </td>
                                </tr>
                                ` : ''}

                                <!-- Descripción / Mensaje -->
                                <tr>
                                    <td style="padding: 0 30px 25px 30px; font-size: 16px; line-height: 1.75; color: #4a4036;">
                                        ${description ? `<p style="margin: 0 0 15px 0;">${description}</p>` : ''}
                                        <p style="margin: 0; font-size: 14px; color: #776e65;">
                                            <em>Impartido / Publicado por: <strong>${author}</strong></em>
                                        </p>
                                    </td>
                                </tr>

                                <!-- Botón de Llamado a la Acción -->
                                <tr>
                                    <td align="center" style="padding: 10px 30px 35px 30px;">
                                        <a href="${fullUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #d4a853 0%, #b8860b 100%); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 700; padding: 14px 36px; border-radius: 30px; box-shadow: 0 4px 15px rgba(212,168,83,0.35);">
                                            Ver Estudio y Contenido Completo &rarr;
                                        </a>
                                    </td>
                                </tr>

                                <!-- Pie de Página del Boletín -->
                                <tr>
                                    <td style="background-color: #faf7f2; padding: 25px 30px; border-top: 1px solid #ede5d8; text-align: center; font-size: 12px; color: #8c8278; line-height: 1.6;">
                                        <p style="margin: 0 0 8px 0; font-weight: 600; color: #5a524a;">
                                            Recibes este correo porque estás suscrito al boletín de <strong>Hablemos de YHWH</strong>.
                                        </p>
                                        <p style="margin: 0;">
                                            Shalom U'Vrajot (Paz y Bendiciones) &bull; <a href="https://www.hablemosdeyhwh.com" style="color: #b8860b; text-decoration: none;">Visitar Sitio Web</a>
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

            // Enviar en segundo plano
            const transporter = getTransporter();
            const mailOptions = {
                from: `"Hablemos de YHWH" <${process.env.GMAIL_USER || 'hablemosdeyhwh2024@gmail.com'}>`,
                bcc: emails, // Para proteger la privacidad de todos los suscriptores
                subject: emailSubject,
                html: htmlContent
            };

            const info = await transporter.sendMail(mailOptions);
            console.log(`✅ Notificación enviada a ${emails.length} suscriptores:`, info.messageId || 'OK');
            return { success: true, count: emails.length };
        } catch (error) {
            console.warn('⚠️ No se pudo enviar notificación a suscriptores:', error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * Enviar boletín o anuncio personalizado a todos los suscriptores
     */
    static async sendCustomBroadcast({ subject, message, actionUrl = '', actionText = 'Visitar Web' }) {
        const subscribers = await Subscriber.getActive();
        if (!subscribers || subscribers.length === 0) {
            return { success: false, error: 'No hay suscriptores activos para enviar el boletín.' };
        }

        const emails = subscribers.map(s => s.email).filter(Boolean);
        const fullUrl = actionUrl ? (actionUrl.startsWith('http') ? actionUrl : `https://www.hablemosdeyhwh.com${actionUrl.startsWith('/') ? actionUrl : '/' + actionUrl}`) : 'https://www.hablemosdeyhwh.com';

        const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="margin: 0; padding: 0; background-color: #f4efe6; font-family: 'Segoe UI', Arial, sans-serif; color: #2c2520;">
            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="padding: 30px 15px;">
                <tr>
                    <td align="center">
                        <table width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e5dcce;">
                            <tr>
                                <td align="center" style="background: linear-gradient(135deg, #181411 0%, #2b231d 100%); padding: 30px 20px; border-bottom: 3px solid #d4a853;">
                                    <h1 style="color: #ffffff; font-size: 24px; margin: 0;">Hablemos de YHWH</h1>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 30px 30px 20px 30px;">
                                    <h2 style="color: #1a1614; font-size: 22px; margin: 0 0 15px 0;">${subject}</h2>
                                    <div style="font-size: 16px; line-height: 1.8; color: #4a4036; white-space: pre-line;">
                                        ${message}
                                    </div>
                                </td>
                            </tr>
                            ${actionUrl ? `
                            <tr>
                                <td align="center" style="padding: 10px 30px 30px 30px;">
                                    <a href="${fullUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #d4a853 0%, #b8860b 100%); color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 700; padding: 12px 32px; border-radius: 30px;">
                                        ${actionText} &rarr;
                                    </a>
                                </td>
                            </tr>
                            ` : ''}
                            <tr>
                                <td style="background-color: #faf7f2; padding: 20px 30px; text-align: center; font-size: 12px; color: #8c8278;">
                                    Boletín oficial de <a href="https://www.hablemosdeyhwh.com" style="color: #b8860b; text-decoration: none;">Hablemos de YHWH</a>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
        `;

        const transporter = getTransporter();
        const mailOptions = {
            from: `"Hablemos de YHWH" <${process.env.GMAIL_USER || 'hablemosdeyhwh2024@gmail.com'}>`,
            bcc: emails,
            subject: subject,
            html: htmlContent
        };

        const info = await transporter.sendMail(mailOptions);
        return { success: true, count: emails.length, messageId: info.messageId };
    }
}

module.exports = NotificationService;
