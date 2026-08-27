const db = require('../config/db');

class Ensenanza {
    static async getAll() {
        const [rows] = await db.query('SELECT * FROM ensenanzas ORDER BY id DESC');
        return rows;
    }

    static async getLatest(limit = 4) {
        const [rows] = await db.query('SELECT * FROM ensenanzas WHERE is_published = TRUE ORDER BY id DESC LIMIT ?', [limit]);
        return rows;
    }

    static async getPublished() {
        const [rows] = await db.query('SELECT * FROM ensenanzas WHERE is_published = TRUE ORDER BY id DESC');
        return rows;
    }

    static async create(data) {
        const { title, subtitle, description, content, image_url, youtube_link, is_published } = data;
        return await db.query(
            'INSERT INTO ensenanzas (title, subtitle, description, content, image_url, youtube_link, is_published) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [title, subtitle || '', description || '', content || '', image_url || '', youtube_link || '', is_published !== undefined ? is_published : true]
        );
    }

    static async update(id, data) {
        const { title, subtitle, description, content, image_url, youtube_link, is_published } = data;
        return await db.query(
            'UPDATE ensenanzas SET title = ?, subtitle = ?, description = ?, content = ?, image_url = ?, youtube_link = ?, is_published = ? WHERE id = ?',
            [title, subtitle || '', description || '', content || '', image_url || '', youtube_link || '', is_published !== undefined ? is_published : true, id]
        );
    }

    static async getById(id) {
        const [rows] = await db.query('SELECT * FROM ensenanzas WHERE id = ?', [id]);
        return rows[0];
    }

    static async delete(id) {
        return await db.query('DELETE FROM ensenanzas WHERE id = ?', [id]);
    }

    static async count() {
        const [rows] = await db.query('SELECT COUNT(*) as total FROM ensenanzas');
        return rows[0] ? rows[0].total : 0;
    }
}

module.exports = Ensenanza;
