const db = require('../config/db');

class Ensenanza {
    static async getAll() {
        const [rows] = await db.query('SELECT * FROM ensenanzas ORDER BY COALESCE(teaching_date, DATE(created_at)) ASC, id ASC');
        return rows;
    }

    static async getLatest(limit = 4) {
        const [rows] = await db.query('SELECT * FROM ensenanzas WHERE is_published = TRUE ORDER BY COALESCE(teaching_date, DATE(created_at)) ASC, id ASC LIMIT ?', [limit]);
        return rows;
    }

    static async getPublished() {
        const [rows] = await db.query('SELECT * FROM ensenanzas WHERE is_published = TRUE ORDER BY COALESCE(teaching_date, DATE(created_at)) ASC, id ASC');
        return rows;
    }

    static async create(data) {
        const { title, subtitle, teaching_date, description, content, image_url, youtube_link, author, author_role, author_img, is_published } = data;
        const finalDate = teaching_date && teaching_date.trim() !== '' ? teaching_date : new Date().toISOString().split('T')[0];
        return await db.query(
            `INSERT INTO ensenanzas (title, subtitle, teaching_date, description, content, image_url, youtube_link, author, author_role, author_img, is_published) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                title,
                subtitle || '',
                finalDate,
                description || '',
                content || '',
                image_url || '',
                youtube_link || '',
                author || 'Moréh Kaleb',
                author_role || 'Moréh',
                author_img || '/assets/img/team/kaleb.jpg',
                is_published !== undefined ? is_published : true
            ]
        );
    }

    static async update(id, data) {
        const { title, subtitle, teaching_date, description, content, image_url, youtube_link, author, author_role, author_img, is_published } = data;
        const finalDate = teaching_date && teaching_date.trim() !== '' ? teaching_date : new Date().toISOString().split('T')[0];
        return await db.query(
            `UPDATE ensenanzas SET 
                title = ?, 
                subtitle = ?, 
                teaching_date = ?, 
                description = ?, 
                content = ?, 
                image_url = ?, 
                youtube_link = ?, 
                author = ?, 
                author_role = ?, 
                author_img = ?, 
                is_published = ? 
             WHERE id = ?`,
            [
                title,
                subtitle || '',
                finalDate,
                description || '',
                content || '',
                image_url || '',
                youtube_link || '',
                author || 'Moréh Kaleb',
                author_role || 'Moréh',
                author_img || '/assets/img/team/kaleb.jpg',
                is_published !== undefined ? is_published : true,
                id
            ]
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
