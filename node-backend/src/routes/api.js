const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

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
        if (rateLimit(ip, 60000, 2)) {
            return res.status(429).json({ ok: false, error: 'Demasiados intentos. Espera un momento.' });
        }

        const { email } = req.body;

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ ok: false, error: 'Email inválido.' });
        }

        const mailOptions = {
            from: `"Hablemos de YHWH" <${process.env.GMAIL_USER || 'hablemosdeyhwh2024@gmail.com'}>`,
            to: process.env.GMAIL_USER || 'hablemosdeyhwh2024@gmail.com',
            subject: '[Newsletter] Nueva suscripción',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #d4a853, #b8860b); padding: 20px; border-radius: 10px 10px 0 0;">
                        <h2 style="color: white; margin: 0;">📬 Nueva Suscripción al Boletín</h2>
                    </div>
                    <div style="background: #f9f9f9; padding: 20px; border: 1px solid #eee; border-radius: 0 0 10px 10px;">
                        <p><strong>📧 Email:</strong> <a href="mailto:${email}">${email}</a></p>
                        <p style="font-size: 0.85rem; color: #999;">Nueva suscripción desde hablemosdeyhwh.com</p>
                    </div>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        res.json({ ok: true });

    } catch (error) {
        console.error('Error enviando email de newsletter:', error.message);
        res.status(500).json({ ok: false, error: 'Error al suscribirse. Intenta más tarde.' });
    }
});

module.exports = router;
