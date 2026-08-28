const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const db = require('../config/db');

// Configurar transporte de Gmail
// Usa una "Contraseña de Aplicación" de Google (no tu contraseña normal)
// Ver: https://myaccount.google.com/apppasswords
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER || 'hablemosdeyhwh2024@gmail.com',
        pass: process.env.GMAIL_APP_PASSWORD || '' // Contraseña de aplicación de Gmail
    }
});

// Rate limiting simple (anti-spam)
const rateLimitMap = new Map();
function rateLimit(ip, windowMs = 60000, maxRequests = 3) {
    const now = Date.now();
    const record = rateLimitMap.get(ip) || { count: 0, start: now };
    if (now - record.start > windowMs) {
        record.count = 1;
        record.start = now;
    } else {
        record.count++;
    }
    rateLimitMap.set(ip, record);
    return record.count > maxRequests;
}

// POST /api/contact - Formulario de contacto
router.post('/contact', async (req, res) => {
    try {
        const ip = req.ip || req.connection.remoteAddress;
        if (rateLimit(ip)) {
            return res.status(429).json({ ok: false, error: 'Demasiados mensajes. Espera un momento.' });
        }

        const { name, email, subject, message } = req.body;

        if (!name || !email || !subject || !message) {
            return res.status(400).json({ ok: false, error: 'Todos los campos son obligatorios.' });
        }

        // Validar email básico
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ ok: false, error: 'Email inválido.' });
        }

        const mailOptions = {
            from: `"${name} - Hablemos de YHWH" <${process.env.GMAIL_USER || 'hablemosdeyhwh2024@gmail.com'}>`,
            to: process.env.GMAIL_USER || 'hablemosdeyhwh2024@gmail.com',
            replyTo: email,
            subject: `[Contacto Web] ${subject}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #d4a853, #b8860b); padding: 20px; border-radius: 10px 10px 0 0;">
                        <h2 style="color: white; margin: 0;">📩 Nuevo Mensaje de Contacto</h2>
                    </div>
                    <div style="background: #f9f9f9; padding: 20px; border: 1px solid #eee; border-radius: 0 0 10px 10px;">
                        <p><strong>👤 Nombre:</strong> ${name}</p>
                        <p><strong>📧 Email:</strong> <a href="mailto:${email}">${email}</a></p>
                        <p><strong>📋 Asunto:</strong> ${subject}</p>
                        <hr style="border: 1px solid #eee;">
                        <p><strong>💬 Mensaje:</strong></p>
                        <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #d4a853;">
                            ${message.replace(/\n/g, '<br>')}
                        </div>
                        <hr style="border: 1px solid #eee;">
                        <p style="font-size: 0.85rem; color: #999;">Enviado desde el formulario de contacto de hablemosdeyhwh.com</p>
                    </div>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        res.json({ ok: true });

    } catch (error) {
        console.error('Error enviando email de contacto:', error.message);
        res.status(500).json({ ok: false, error: 'Error al enviar el mensaje. Intenta más tarde.' });
    }
});

// POST /api/newsletter - Suscripción al boletín
router.post('/newsletter', async (req, res) => {
    try {
        const ip = req.ip || req.connection.remoteAddress;
        if (rateLimit(ip, 60000, 5)) {
            return res.status(429).json({ ok: false, error: 'Demasiados intentos. Por favor espera un momento.' });
        }

        const { email } = req.body;

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ ok: false, error: 'Por favor ingresa un correo electrónico válido.' });
        }

        const cleanEmail = email.toLowerCase().trim();

        // 1. Guardar o reactivar en Base de Datos
        try {
            const isPostgres = !!process.env.DATABASE_URL;
            if (isPostgres) {
                await db.query(
                    `INSERT INTO newsletter_subscribers (email, ip_address, is_active, subscribed_at)
                     VALUES (?, ?, TRUE, NOW())
                     ON CONFLICT (email) DO UPDATE SET is_active = TRUE, subscribed_at = NOW()`,
                    [cleanEmail, ip]
                );
            } else {
                await db.query(
                    `INSERT INTO newsletter_subscribers (email, ip_address, is_active, subscribed_at)
                     VALUES (?, ?, TRUE, NOW())
                     ON DUPLICATE KEY UPDATE is_active = TRUE, subscribed_at = NOW()`,
                    [cleanEmail, ip]
                );
            }
        } catch (dbErr) {
            console.warn('Aviso al insertar suscriptor en DB:', dbErr.message);
            // Si la tabla no existía, intentar crearla y reinsertar
            try {
                const isPostgres = !!process.env.DATABASE_URL;
                if (isPostgres) {
                    await db.query(`
                        CREATE TABLE IF NOT EXISTS newsletter_subscribers (
                            id SERIAL PRIMARY KEY,
                            email VARCHAR(255) NOT NULL UNIQUE,
                            ip_address VARCHAR(45),
                            is_active BOOLEAN DEFAULT TRUE,
                            subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                        );
                    `);
                    await db.query(
                        `INSERT INTO newsletter_subscribers (email, ip_address, is_active, subscribed_at)
                         VALUES (?, ?, TRUE, NOW())
                         ON CONFLICT (email) DO UPDATE SET is_active = TRUE, subscribed_at = NOW()`,
                        [cleanEmail, ip]
                    );
                } else {
                    await db.query(`
                        CREATE TABLE IF NOT EXISTS newsletter_subscribers (
                            id INT AUTO_INCREMENT PRIMARY KEY,
                            email VARCHAR(255) NOT NULL UNIQUE,
                            ip_address VARCHAR(45),
                            is_active BOOLEAN DEFAULT TRUE,
                            subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                        );
                    `);
                    await db.query(
                        `INSERT INTO newsletter_subscribers (email, ip_address, is_active, subscribed_at)
                         VALUES (?, ?, TRUE, NOW())
                         ON DUPLICATE KEY UPDATE is_active = TRUE, subscribed_at = NOW()`,
                        [cleanEmail, ip]
                    );
                }
            } catch (createErr) {
                console.error('Error creando/insertando en tabla newsletter_subscribers:', createErr.message);
            }
        }

        // 2. Enviar notificación por correo si Gmail está configurado (sin bloquear la respuesta)
        if (process.env.GMAIL_APP_PASSWORD) {
            const mailOptions = {
                from: `"Hablemos de YHWH" <${process.env.GMAIL_USER || 'hablemosdeyhwh2024@gmail.com'}>`,
                to: process.env.GMAIL_USER || 'hablemosdeyhwh2024@gmail.com',
                subject: '📬 [Newsletter] Nueva suscripción al boletín',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden;">
                        <div style="background: linear-gradient(135deg, #d4a853, #b8860b); padding: 24px; text-align: center;">
                            <h2 style="color: white; margin: 0; font-size: 1.4rem;">📬 Nueva Suscripción al Boletín</h2>
                        </div>
                        <div style="background: #ffffff; padding: 24px;">
                            <p style="font-size: 1.05rem; color: #333; margin-bottom: 12px;">Se ha registrado un nuevo suscriptor en el sitio web:</p>
                            <div style="background: #fdfbf7; border-left: 4px solid #d4a853; padding: 14px; margin-bottom: 20px; border-radius: 4px;">
                                <p style="margin: 0; font-size: 1.1rem; color: #111;"><strong>📧 Email:</strong> <a href="mailto:${cleanEmail}" style="color: #b8860b;">${cleanEmail}</a></p>
                                <p style="margin: 6px 0 0; font-size: 0.88rem; color: #777;"><strong>🌐 IP:</strong> ${ip}</p>
                            </div>
                            <p style="font-size: 0.85rem; color: #999; margin: 0;">Enviado automáticamente desde <a href="https://hablemosdeyhwh.com">hablemosdeyhwh.com</a></p>
                        </div>
                    </div>
                `
            };

            transporter.sendMail(mailOptions).catch(err => {
                console.warn('Aviso: No se pudo enviar email de notificación de suscripción:', err.message);
            });
        }

        return res.json({ 
            ok: true, 
            message: '¡Te has suscrito correctamente! Gracias por unirte a nuestra comunidad.' 
        });

    } catch (error) {
        console.error('Error general en /api/newsletter:', error.message);
        res.status(500).json({ ok: false, error: 'Ocurrió un error al procesar tu solicitud. Intenta nuevamente.' });
    }
});

module.exports = router;
