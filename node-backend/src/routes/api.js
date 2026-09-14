const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const db = require('../config/db');

// Configurar transporte de Gmail
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER || 'hablemosdeyhwh2024@gmail.com',
        pass: process.env.GMAIL_APP_PASSWORD || ''
    }
});

// Rate limiting robusto en memoria con limpieza automática
const rateLimitMap = new Map();

// Limpiar IPs viejas cada 10 minutos para evitar consumo de memoria
setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of rateLimitMap.entries()) {
        if (now - record.start > 120000) {
            rateLimitMap.delete(ip);
        }
    }
}, 600000);

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

// Función auxiliar para escapar texto en HTML y prevenir inyección de código
function escapeHTML(str) {
    if (!str || typeof str !== 'string') return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// POST /api/contact - Formulario de contacto
router.post('/contact', async (req, res) => {
    try {
        const ip = req.ip || req.connection?.remoteAddress || req.headers['x-forwarded-for'] || 'unknown';
        
        // 1. Anti-Bot Honeypot: si este campo viene lleno, es un bot automatizado
        const { name, email, subject, message, hp_field, b_company_url } = req.body;
        if (hp_field || b_company_url) {
            // Fingir éxito para engañar al bot
            return res.json({ ok: true, message: '¡Mensaje enviado correctamente!' });
        }

        // 2. Rate limiting (máx 3 peticiones por minuto)
        if (rateLimit(ip, 60000, 3)) {
            return res.status(429).json({ ok: false, error: 'Demasiados mensajes enviados. Por favor espera un minuto.' });
        }

        if (!name || !email || !subject || !message) {
            return res.status(400).json({ ok: false, error: 'Todos los campos son obligatorios.' });
        }

        const cleanEmail = email.toLowerCase().trim();
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        
        // Validar formato estricto y descartar caracteres peligrosos
        if (cleanEmail.length > 100 || !emailRegex.test(cleanEmail) || /[<>\r\n;()\"\'`\\]/.test(cleanEmail)) {
            return res.status(400).json({ ok: false, error: 'El correo electrónico no es válido.' });
        }

        // Sanitizar campos de texto
        const safeName = escapeHTML(name.substring(0, 100));
        const safeSubject = escapeHTML(subject.substring(0, 150));
        const safeMessage = escapeHTML(message.substring(0, 3000));

        const mailOptions = {
            from: `"${safeName} - Hablemos de YHWH" <${process.env.GMAIL_USER || 'hablemosdeyhwh2024@gmail.com'}>`,
            to: process.env.GMAIL_USER || 'hablemosdeyhwh2024@gmail.com',
            replyTo: cleanEmail,
            subject: `[Contacto Web] ${safeSubject}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #d4a853, #b8860b); padding: 20px; border-radius: 10px 10px 0 0;">
                        <h2 style="color: white; margin: 0;">📩 Nuevo Mensaje de Contacto</h2>
                    </div>
                    <div style="background: #f9f9f9; padding: 20px; border: 1px solid #eee; border-radius: 0 0 10px 10px;">
                        <p><strong>👤 Nombre:</strong> ${safeName}</p>
                        <p><strong>📧 Email:</strong> <a href="mailto:${cleanEmail}">${cleanEmail}</a></p>
                        <p><strong>📋 Asunto:</strong> ${safeSubject}</p>
                        <hr style="border: 1px solid #eee;">
                        <p><strong>💬 Mensaje:</strong></p>
                        <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #d4a853;">
                            ${safeMessage.replace(/\n/g, '<br>')}
                        </div>
                        <hr style="border: 1px solid #eee;">
                        <p style="font-size: 0.85rem; color: #999;">Enviado desde el formulario de contacto de hablemosdeyhwh.com (IP: ${escapeHTML(ip)})</p>
                    </div>
                </div>
            `
        };

        if (process.env.GMAIL_APP_PASSWORD) {
            await transporter.sendMail(mailOptions);
        }
        res.json({ ok: true });

    } catch (error) {
        console.error('Error enviando email de contacto:', error.message);
        res.status(500).json({ ok: false, error: 'Error al enviar el mensaje. Intenta más tarde.' });
    }
});

// POST /api/newsletter - Suscripción al boletín con protección anti-bot y validación estricta
router.post('/newsletter', async (req, res) => {
    try {
        const ip = req.ip || req.connection?.remoteAddress || req.headers['x-forwarded-for'] || 'unknown';
        
        // 1. Anti-Bot Honeypot: si este campo viene lleno, es un bot automatizado
        const { email, hp, hp_field, b_company_url } = req.body;
        if (hp || hp_field || b_company_url) {
            // Fingir éxito para no alertar al bot atacante
            return res.json({ ok: true, message: '¡Te has suscrito correctamente al boletín!' });
        }

        // 2. Rate limiting estricto (máximo 3 suscripciones por minuto por IP)
        if (rateLimit(ip, 60000, 3)) {
            return res.status(429).json({ ok: false, error: 'Demasiados intentos. Por favor espera un momento.' });
        }

        // 3. Validación estricta de Email
        if (!email || typeof email !== 'string') {
            return res.status(400).json({ ok: false, error: 'Por favor ingresa un correo electrónico válido.' });
        }

        const cleanEmail = email.toLowerCase().trim();

        if (cleanEmail.length < 5 || cleanEmail.length > 100) {
            return res.status(400).json({ ok: false, error: 'Longitud de correo inválida.' });
        }

        // Formato RFC y descarte de inyecciones de cabecera / scripts
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(cleanEmail) || /[<>\r\n;()\"\'`\\]/.test(cleanEmail)) {
            return res.status(400).json({ ok: false, error: 'Por favor ingresa un correo electrónico válido.' });
        }

        // Descartar dominios/patrones de spam obvios o cadenas vacías
        const suspiciousPatterns = ['test@test.com', 'admin@admin.com', 'mail@mail.com', 'asdf@', '12345@'];
        if (suspiciousPatterns.some(p => cleanEmail.includes(p))) {
            return res.status(400).json({ ok: false, error: 'Por favor ingresa una dirección de correo real.' });
        }

        // 4. Guardar o reactivar en Base de Datos de forma parametrizada (Protección SQL Injection)
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
            // Si la tabla no existía, crearla e intentar de nuevo
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

        // 5. Notificación por email a los administradores
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
                                <p style="margin: 0; font-size: 1.1rem; color: #111;"><strong>📧 Email:</strong> <a href="mailto:${escapeHTML(cleanEmail)}" style="color: #b8860b;">${escapeHTML(cleanEmail)}</a></p>
                                <p style="margin: 6px 0 0; font-size: 0.88rem; color: #777;"><strong>🌐 IP:</strong> ${escapeHTML(ip)}</p>
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
            message: '¡Te has suscrito correctamente al boletín!' 
        });

    } catch (error) {
        console.error('Error general en /api/newsletter:', error.message);
        res.status(500).json({ ok: false, error: 'Ocurrió un error al procesar tu solicitud. Intenta nuevamente.' });
    }
});

module.exports = router;
