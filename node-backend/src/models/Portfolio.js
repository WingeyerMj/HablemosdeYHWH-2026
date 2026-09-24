const db = require('../config/db');

class Portfolio {
    static async ensureColumns() {
        try {
            const [colsPdf] = await db.query("SHOW COLUMNS FROM portfolio LIKE 'seder_pdf'");
            if (!colsPdf || colsPdf.length === 0) {
                await db.query("ALTER TABLE portfolio ADD COLUMN seder_pdf VARCHAR(500) DEFAULT NULL");
                console.log('✅ Columna seder_pdf agregada a portfolio');
            }
        } catch (e) {
            try {
                await db.query("ALTER TABLE portfolio ADD COLUMN IF NOT EXISTS seder_pdf VARCHAR(500) DEFAULT NULL");
            } catch (errPG) {}
        }

        try {
            const [colsTitle] = await db.query("SHOW COLUMNS FROM portfolio LIKE 'seder_title'");
            if (!colsTitle || colsTitle.length === 0) {
                await db.query("ALTER TABLE portfolio ADD COLUMN seder_title VARCHAR(255) DEFAULT NULL");
                console.log('✅ Columna seder_title agregada a portfolio');
            }
        } catch (e) {
            try {
                await db.query("ALTER TABLE portfolio ADD COLUMN IF NOT EXISTS seder_title VARCHAR(255) DEFAULT NULL");
            } catch (errPG) {}
        }

        try {
            const [colsContent] = await db.query("SHOW COLUMNS FROM portfolio LIKE 'seder_content'");
            if (!colsContent || colsContent.length === 0) {
                await db.query("ALTER TABLE portfolio ADD COLUMN seder_content LONGTEXT DEFAULT NULL");
                console.log('✅ Columna seder_content agregada a portfolio');
            }
        } catch (e) {
            try {
                await db.query("ALTER TABLE portfolio ADD COLUMN IF NOT EXISTS seder_content TEXT DEFAULT NULL");
            } catch (errPG) {}
        }

        try {
            const [colsViews] = await db.query("SHOW COLUMNS FROM portfolio LIKE 'views'");
            if (!colsViews || colsViews.length === 0) {
                await db.query("ALTER TABLE portfolio ADD COLUMN views INT DEFAULT 0");
                console.log('✅ Columna views agregada a portfolio');
            }
            await db.query("UPDATE portfolio SET views = 0 WHERE views IS NULL");
        } catch (e) {
            try {
                await db.query("ALTER TABLE portfolio ADD COLUMN IF NOT EXISTS views INT DEFAULT 0");
                await db.query("UPDATE portfolio SET views = 0 WHERE views IS NULL");
            } catch (errPG) {}
        }
    }

    static async getAll() {
        await Portfolio.ensureColumns();
        const [rows] = await db.query('SELECT * FROM portfolio ORDER BY event_date DESC, created_at DESC');
        return rows;
    }

    static async getLatest(limit = 4) {
        await Portfolio.ensureColumns();
        const [rows] = await db.query('SELECT * FROM portfolio ORDER BY event_date DESC, created_at DESC LIMIT ?', [limit]);
        return rows;
    }

    static async getUpcoming() {
        await Portfolio.ensureColumns();
        const [rows] = await db.query(
            'SELECT * FROM portfolio WHERE event_date >= CURDATE() AND is_published = TRUE ORDER BY event_date ASC'
        );
        return rows;
    }

    static async getPast() {
        await Portfolio.ensureColumns();
        const [rows] = await db.query(
            'SELECT * FROM portfolio WHERE event_date < CURDATE() AND is_published = TRUE ORDER BY event_date DESC'
        );
        return rows;
    }

    static async getPublished() {
        await Portfolio.ensureColumns();
        const [rows] = await db.query('SELECT * FROM portfolio WHERE is_published = TRUE ORDER BY event_date DESC, created_at DESC');
        return rows;
    }

    static async create(data) {
        await Portfolio.ensureColumns();
        const { title, subtitle, category, description, content, event_date, image_url, seder_title, seder_pdf, seder_content } = data;
        const img = image_url || '';
        return await db.query(
            'INSERT INTO portfolio (title, subtitle, category, description, content, event_date, image_url, img, seder_title, seder_pdf, seder_content) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [title, subtitle || '', category || '', description || '', content || '', event_date || null, image_url || '', img, seder_title || '', seder_pdf || '', seder_content || '']
        );
    }

    static async update(id, data) {
        await Portfolio.ensureColumns();
        const { title, subtitle, category, description, content, event_date, image_url, seder_title, seder_pdf, seder_content } = data;
        return await db.query(
            'UPDATE portfolio SET title = ?, subtitle = ?, category = ?, description = ?, content = ?, event_date = ?, image_url = ?, img = ?, seder_title = ?, seder_pdf = ?, seder_content = ? WHERE id = ?',
            [title, subtitle || '', category || '', description || '', content || '', event_date || null, image_url || '', image_url || '', seder_title || '', seder_pdf || '', seder_content || '', id]
        );
    }

    static async delete(id) {
        return await db.query('DELETE FROM portfolio WHERE id = ?', [id]);
    }

    static async getById(id) {
        await Portfolio.ensureColumns();
        const [rows] = await db.query('SELECT * FROM portfolio WHERE id = ?', [id]);
        return rows[0];
    }

    static async count() {
        const [rows] = await db.query('SELECT COUNT(*) as total FROM portfolio');
        return rows[0] ? rows[0].total : 0;
    }

    static async getCategories() {
        const [rows] = await db.query("SELECT DISTINCT category FROM portfolio WHERE category IS NOT NULL AND category != '' ORDER BY category");
        return rows.map(r => r.category);
    }

    static async incrementViews(id) {
        try {
            await Portfolio.ensureColumns();
            await db.query('UPDATE portfolio SET views = COALESCE(views, 0) + 1 WHERE id = ?', [id]);
        } catch(e) {
            console.warn('Aviso incrementViews portfolio:', e.message);
        }
    }
}

module.exports = Portfolio;
