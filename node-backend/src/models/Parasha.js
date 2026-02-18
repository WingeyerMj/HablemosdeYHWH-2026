const db = require('../config/db');

class Parasha {
    static async getLatest(limit = 6) {
        const [rows] = await db.query('SELECT * FROM parashot ORDER BY created_at DESC LIMIT ?', [limit]);
        return rows;
    }

    static async getAll() {
        const [rows] = await db.query('SELECT * FROM parashot ORDER BY created_at DESC');
        return rows;
    }

    static async create(data) {
        const { title, description, icon, link } = data;
        return await db.query(
            'INSERT INTO parashot (title, description, icon, link) VALUES (?, ?, ?, ?)',
            [title, description, icon || 'bi-journal-text', link]
        );
    }

    static async delete(id) {
        return await db.query('DELETE FROM parashot WHERE id = ?', [id]);
    }
}

module.exports = Parasha;
