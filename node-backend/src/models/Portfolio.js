const db = require('../config/db');

class Portfolio {
    static async ensureColumns() {
        const columnsToAdd = [
            { name: 'seder_pdf', type: 'VARCHAR(500) DEFAULT NULL' },
            { name: 'seder_title', type: 'VARCHAR(255) DEFAULT NULL' },
            { name: 'seder_content', type: 'LONGTEXT DEFAULT NULL' },
            { name: 'seder_image', type: 'VARCHAR(500) DEFAULT NULL' },
            { name: 'seder_file', type: 'VARCHAR(500) DEFAULT NULL' },
            { name: 'views', type: 'INT DEFAULT 0' }
        ];

        for (const col of columnsToAdd) {
            try {
                const [exists] = await db.query(`SHOW COLUMNS FROM portfolio LIKE '${col.name}'`);
                if (!exists || exists.length === 0) {
                    await db.query(`ALTER TABLE portfolio ADD COLUMN ${col.name} ${col.type}`);
                    console.log(`✅ Columna ${col.name} agregada a portfolio`);
                }
            } catch (e) {
                try {
                    await db.query(`ALTER TABLE portfolio ADD COLUMN IF NOT EXISTS ${col.name} ${col.type}`);
                } catch (errPG) {}
            }
        }

        try {
            await db.query("UPDATE portfolio SET views = 0 WHERE views IS NULL");
        } catch (e) {}
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
        const { title, subtitle, category, description, content, event_date, image_url, seder_title, seder_pdf, seder_image, seder_content, seder_file } = data;
        const img = image_url || '';
        return await db.query(
            'INSERT INTO portfolio (title, subtitle, category, description, content, event_date, image_url, img, seder_title, seder_pdf, seder_image, seder_content, seder_file) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [title, subtitle || '', category || '', description || '', content || '', event_date || null, image_url || '', img, seder_title || '', seder_pdf || '', seder_image || '', seder_content || '', seder_file || (seder_pdf || seder_image || null)]
        );
    }

    static async update(id, data) {
        await Portfolio.ensureColumns();
        const { title, subtitle, category, description, content, event_date, image_url, seder_title, seder_pdf, seder_image, seder_content, seder_file } = data;
        return await db.query(
            'UPDATE portfolio SET title = ?, subtitle = ?, category = ?, description = ?, content = ?, event_date = ?, image_url = ?, img = ?, seder_title = ?, seder_pdf = ?, seder_image = ?, seder_content = ?, seder_file = ? WHERE id = ?',
            [title, subtitle || '', category || '', description || '', content || '', event_date || null, image_url || '', image_url || '', seder_title || '', seder_pdf || '', seder_image || '', seder_content || '', seder_file !== undefined ? (seder_file || null) : (seder_pdf || seder_image || null), id]
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
