const db = require('../config/db');

class SemillasTorah {
    static async ensureVideoColumn() {
        try {
            const [cols] = await db.query("SHOW COLUMNS FROM semillas_torah LIKE 'video_file'");
            if (!cols || cols.length === 0) {
                await db.query("ALTER TABLE semillas_torah ADD COLUMN video_file VARCHAR(500) DEFAULT NULL AFTER youtube_link");
                console.log('✅ Columna video_file agregada a semillas_torah');
            }
        } catch (e) {
            console.warn('Aviso ensureVideoColumn:', e.message);
        }
    }

    static async getAll() {
        try {
            await SemillasTorah.ensureVideoColumn();
            const [rows] = await db.query('SELECT * FROM semillas_torah ORDER BY id DESC');
            return rows || [];
        } catch (e) {
            console.warn('Aviso en SemillasTorah.getAll:', e.message);
            return [];
        }
    }

    static async getPublished() {
        try {
            const [rows] = await db.query('SELECT * FROM semillas_torah WHERE is_published = TRUE ORDER BY id DESC');
            return rows || [];
        } catch (e) {
            console.warn('Aviso en SemillasTorah.getPublished:', e.message);
            return [];
        }
    }

    static async getLatest(limit = 6) {
        try {
            const [rows] = await db.query('SELECT * FROM semillas_torah WHERE is_published = TRUE ORDER BY id DESC LIMIT ?', [limit]);
            return rows || [];
        } catch (e) {
            console.warn('Aviso en SemillasTorah.getLatest:', e.message);
            return [];
        }
    }

    static async getByCategory(category) {
        try {
            const [rows] = await db.query('SELECT * FROM semillas_torah WHERE is_published = TRUE AND category = ? ORDER BY id DESC', [category]);
            return rows || [];
        } catch (e) {
            return [];
        }
    }

    static async getCategories() {
        try {
            const [rows] = await db.query('SELECT DISTINCT category FROM semillas_torah WHERE category IS NOT NULL AND category != "" AND is_published = TRUE');
            return rows.map(r => r.category);
        } catch (e) {
            return [];
        }
    }

    static async getById(id) {
        try {
            const [rows] = await db.query('SELECT * FROM semillas_torah WHERE id = ?', [id]);
            return rows[0] || null;
        } catch (e) {
            console.warn('Aviso en SemillasTorah.getById:', e.message);
            return null;
        }
    }

    static async create(data) {
        const { title, subtitle, category, description, content, image_url, pdf_file, video_file, youtube_link, author, is_published } = data;
        return await db.query(
            `INSERT INTO semillas_torah (title, subtitle, category, description, content, image_url, pdf_file, video_file, youtube_link, author, is_published) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                title,
                subtitle || '',
                category || 'Parashá Infantil',
                description || '',
                content || '',
                image_url || '',
                pdf_file || '',
                video_file || '',
                youtube_link || '',
                author || 'Elva Avila',
                is_published !== undefined ? !!is_published : true
            ]
        );
    }

    static async update(id, data) {
        const { title, subtitle, category, description, content, image_url, pdf_file, video_file, youtube_link, author, is_published } = data;
        return await db.query(
            `UPDATE semillas_torah 
             SET title = ?, subtitle = ?, category = ?, description = ?, content = ?, image_url = ?, pdf_file = ?, video_file = ?, youtube_link = ?, author = ?, is_published = ? 
             WHERE id = ?`,
            [
                title,
                subtitle || '',
                category || 'Parashá Infantil',
                description || '',
                content || '',
                image_url || '',
                pdf_file || '',
                video_file || '',
                youtube_link || '',
                author || 'Elva Avila',
                is_published !== undefined ? !!is_published : true,
                id
            ]
        );
    }

    static async delete(id) {
        return await db.query('DELETE FROM semillas_torah WHERE id = ?', [id]);
    }

    static async count() {
        try {
            const [rows] = await db.query('SELECT COUNT(*) as total FROM semillas_torah');
            return rows[0] ? rows[0].total : 0;
        } catch (e) {
            return 0;
        }
    }
}

module.exports = SemillasTorah;
