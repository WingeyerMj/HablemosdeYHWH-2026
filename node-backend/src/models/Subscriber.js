const db = require('../config/db');

class Subscriber {
    static async ensureTable() {
        try {
            const sql = `
                CREATE TABLE IF NOT EXISTS newsletter_subscribers (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    email VARCHAR(255) NOT NULL UNIQUE,
                    ip_address VARCHAR(45) DEFAULT NULL,
                    is_active BOOLEAN DEFAULT TRUE,
                    subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            `;
            await db.query(sql);
        } catch (e) {
            try {
                // Fallback for PostgreSQL if configured
                await db.query(`
                    CREATE TABLE IF NOT EXISTS newsletter_subscribers (
                        id SERIAL PRIMARY KEY,
                        email VARCHAR(255) NOT NULL UNIQUE,
                        ip_address VARCHAR(45),
                        is_active BOOLEAN DEFAULT TRUE,
                        subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    );
                `);
            } catch (errPG) {
                console.warn('Aviso en Subscriber.ensureTable:', e.message);
            }
        }
    }

    static async getAll() {
        try {
            await Subscriber.ensureTable();
            const [rows] = await db.query('SELECT * FROM newsletter_subscribers ORDER BY subscribed_at DESC, id DESC');
            return rows || [];
        } catch (e) {
            console.warn('Aviso en Subscriber.getAll:', e.message);
            return [];
        }
    }

    static async getActive() {
        try {
            await Subscriber.ensureTable();
            const [rows] = await db.query('SELECT * FROM newsletter_subscribers WHERE is_active = TRUE ORDER BY subscribed_at DESC');
            return rows || [];
        } catch (e) {
            console.warn('Aviso en Subscriber.getActive:', e.message);
            return [];
        }
    }

    static async count() {
        try {
            await Subscriber.ensureTable();
            const [rows] = await db.query('SELECT COUNT(*) as total FROM newsletter_subscribers WHERE is_active = TRUE');
            return rows && rows[0] ? rows[0].total : 0;
        } catch (e) {
            return 0;
        }
    }

    static async create(data) {
        await Subscriber.ensureTable();
        const { email, ip_address } = data;
        const cleanEmail = (email || '').trim().toLowerCase();
        if (!cleanEmail) throw new Error('El correo electrónico es requerido.');

        try {
            return await db.query(
                `INSERT INTO newsletter_subscribers (email, ip_address, is_active, subscribed_at)
                 VALUES (?, ?, TRUE, NOW())
                 ON DUPLICATE KEY UPDATE is_active = TRUE, subscribed_at = NOW()`,
                [cleanEmail, ip_address || 'admin']
            );
        } catch (e) {
            try {
                return await db.query(
                    `INSERT INTO newsletter_subscribers (email, ip_address, is_active, subscribed_at)
                     VALUES (?, ?, TRUE, NOW())
                     ON CONFLICT (email) DO UPDATE SET is_active = TRUE, subscribed_at = NOW()`,
                    [cleanEmail, ip_address || 'admin']
                );
            } catch (err2) {
                throw err2;
            }
        }
    }

    static async delete(id) {
        await Subscriber.ensureTable();
        return await db.query('DELETE FROM newsletter_subscribers WHERE id = ?', [id]);
    }

    static async toggleStatus(id) {
        await Subscriber.ensureTable();
        return await db.query('UPDATE newsletter_subscribers SET is_active = NOT is_active WHERE id = ?', [id]);
    }
}

module.exports = Subscriber;
