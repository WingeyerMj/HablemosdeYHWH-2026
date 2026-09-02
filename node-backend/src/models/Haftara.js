const db = require('../config/db');

class Haftara {
    static async getAll() {
        const [rows] = await db.query('SELECT * FROM haftarot ORDER BY id DESC');
        return rows;
    }

    static async getLatest(limit = 4) {
        const [rows] = await db.query('SELECT * FROM haftarot WHERE is_published = TRUE ORDER BY id DESC LIMIT ?', [limit]);
        return rows;
    }

    static async getPublished() {
        const [rows] = await db.query('SELECT * FROM haftarot WHERE is_published = TRUE ORDER BY id DESC');
        return rows;
    }

    static async create(data) {
        const { title, subtitle, parasha_reference, description, content, image_url, youtube_link, audio_url, author, author_role, author_img, is_published } = data;
        return await db.query(
            `INSERT INTO haftarot (title, subtitle, parasha_reference, description, content, image_url, youtube_link, audio_url, author, author_role, author_img, is_published) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                title,
                subtitle || '',
                parasha_reference || '',
                description || '',
                content || '',
                image_url || '',
                youtube_link || '',
                audio_url || '',
                author || 'Moréh Kalev Aquerman',
                author_role || 'Moreh מורה',
                author_img || '/assets/img/team/kaleb.jpg',
                is_published !== undefined ? is_published : true
            ]
        );
    }

    static async update(id, data) {
        const { title, subtitle, parasha_reference, description, content, image_url, youtube_link, audio_url, author, author_role, author_img, is_published } = data;
        return await db.query(
            `UPDATE haftarot SET 
                title = ?, 
                subtitle = ?, 
                parasha_reference = ?, 
                description = ?, 
                content = ?, 
                image_url = ?, 
                youtube_link = ?, 
                audio_url = ?, 
                author = ?, 
                author_role = ?, 
                author_img = ?, 
                is_published = ? 
             WHERE id = ?`,
            [
                title,
                subtitle || '',
                parasha_reference || '',
                description || '',
                content || '',
                image_url || '',
                youtube_link || '',
                audio_url || '',
                author || 'Moréh Kalev Aquerman',
                author_role || 'Moreh מורה',
                author_img || '/assets/img/team/kaleb.jpg',
                is_published !== undefined ? is_published : true,
                id
            ]
        );
    }

    static async getById(id) {
        const [rows] = await db.query('SELECT * FROM haftarot WHERE id = ?', [id]);
        return rows[0];
    }

    static async delete(id) {
        return await db.query('DELETE FROM haftarot WHERE id = ?', [id]);
    }

    static async count() {
        const [rows] = await db.query('SELECT COUNT(*) as total FROM haftarot');
        return rows[0] ? rows[0].total : 0;
    }
}

module.exports = Haftara;
