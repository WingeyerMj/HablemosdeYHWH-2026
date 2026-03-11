const db = require('../config/db');

class Parasha {
    static async getLatest(limit = 6) {
        const [rows] = await db.query('SELECT * FROM parashot ORDER BY parasha_number ASC, id DESC LIMIT ?', [limit]);
        return rows;
    }

    static async getAll() {
        const [rows] = await db.query('SELECT * FROM parashot ORDER BY parasha_number ASC, id DESC');
        return rows;
    }

    static async create(data) {
        const { parasha_number, title, description, icon, link, subtitle, content, image_url, youtube_link } = data;
        return await db.query(
            'INSERT INTO parashot (parasha_number, title, description, icon, link, subtitle, content, image_url, youtube_link) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [parasha_number || null, title, description, icon || 'bi-journal-text', link, subtitle, content, image_url, youtube_link]
        );
    }

    static async update(id, data) {
        const { parasha_number, title, description, icon, link, subtitle, content, image_url, youtube_link } = data;
        return await db.query(
            'UPDATE parashot SET parasha_number = ?, title = ?, description = ?, icon = ?, link = ?, subtitle = ?, content = ?, image_url = ?, youtube_link = ? WHERE id = ?',
            [parasha_number || null, title, description, icon || 'bi-journal-text', link, subtitle, content, image_url, youtube_link, id]
        );
    }

    static async getById(id) {
        const [rows] = await db.query('SELECT * FROM parashot WHERE id = ?', [id]);
        return rows[0];
    }

    static async delete(id) {
        return await db.query('DELETE FROM parashot WHERE id = ?', [id]);
    }
}

module.exports = Parasha;
