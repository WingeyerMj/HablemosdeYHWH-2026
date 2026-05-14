const db = require('../config/db');

class Parasha {
    static async getLatest(limit = 6) {
        const [rows] = await db.query('SELECT * FROM parashot ORDER BY parasha_number DESC, id DESC LIMIT ?', [limit]);
        return rows;
    }

    static async getAll() {
        const [rows] = await db.query('SELECT * FROM parashot ORDER BY parasha_number DESC, id DESC');
        return rows;
    }

    static async getPublished() {
        const [rows] = await db.query('SELECT * FROM parashot WHERE is_published = TRUE ORDER BY parasha_number DESC, id DESC');
        return rows;
    }

    static async create(data) {
        const { parasha_number, title, description, icon, link, subtitle, content, image_url, pdf_file, youtube_link } = data;
        return await db.query(
            'INSERT INTO parashot (parasha_number, title, subtitle, description, content, image_url, pdf_file, icon, link, youtube_link) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [parasha_number || null, title, subtitle || '', description || '', content || '', image_url || '', pdf_file || '', icon || 'bi-journal-text', link || '', youtube_link || '']
        );
    }

    static async update(id, data) {
        const { parasha_number, title, description, icon, link, subtitle, content, image_url, pdf_file, youtube_link } = data;
        return await db.query(
            'UPDATE parashot SET parasha_number = ?, title = ?, subtitle = ?, description = ?, content = ?, image_url = ?, pdf_file = ?, icon = ?, link = ?, youtube_link = ? WHERE id = ?',
            [parasha_number || null, title, subtitle || '', description || '', content || '', image_url || '', pdf_file || '', icon || 'bi-journal-text', link || '', youtube_link || '', id]
        );
    }

    static async getById(id) {
        const [rows] = await db.query('SELECT * FROM parashot WHERE id = ?', [id]);
        return rows[0];
    }

    static async delete(id) {
        return await db.query('DELETE FROM parashot WHERE id = ?', [id]);
    }

    static async count() {
        const [rows] = await db.query('SELECT COUNT(*) as total FROM parashot');
        return rows[0].total;
    }
}

module.exports = Parasha;
