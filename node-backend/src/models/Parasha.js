const db = require('../config/db');

class Parasha {
    static async getLatest(limit = 6) {
        await this.ensureColumns();
        const [rows] = await db.query(`
            SELECT * FROM parashot 
            ORDER BY 
                (cycle_name LIKE '%2026 - 2027%' OR parasha_number = 1) DESC,
                updated_at DESC, 
                id DESC 
            LIMIT ?
        `, [limit]);
        return rows;
    }

    static async getAll() {
        const [rows] = await db.query('SELECT * FROM parashot ORDER BY parasha_number DESC, id DESC');
        return rows;
    }

    static async getAllAsc() {
        const [rows] = await db.query('SELECT * FROM parashot ORDER BY parasha_number ASC, id ASC');
        return rows;
    }

    static async getPublished() {
        const [rows] = await db.query('SELECT * FROM parashot WHERE is_published = TRUE ORDER BY parasha_number DESC, id DESC');
        return rows;
    }

    static async ensureColumns() {
        try {
            const [cols] = await db.query("SHOW COLUMNS FROM parashot LIKE 'cycle_id'");
            if (!cols || cols.length === 0) {
                await db.query("ALTER TABLE parashot ADD COLUMN cycle_id INT NULL");
            }
            const [colsName] = await db.query("SHOW COLUMNS FROM parashot LIKE 'cycle_name'");
            if (!colsName || colsName.length === 0) {
                await db.query("ALTER TABLE parashot ADD COLUMN cycle_name VARCHAR(150) NULL");
            }

            // Solo la Parashá Bereshit (#1) es del nuevo ciclo 2026 - 2027
            // Todas las demás porciones son del ciclo 2025 - 2026 (hasta que el Moréh las suba en el nuevo ciclo)
            await db.query("UPDATE parashot SET cycle_name = 'Ciclo 2026 - 2027' WHERE parasha_number = 1");
            await db.query("UPDATE parashot SET cycle_name = 'Ciclo 2025 - 2026' WHERE parasha_number IS NOT NULL AND parasha_number != 1 AND (cycle_name LIKE '%2026%' OR cycle_name IS NULL OR cycle_name = '')");
        } catch(err) {
            console.warn('Aviso en ensureColumns Parasha:', err.message);
        }
    }

    static async create(data) {
        await this.ensureColumns();
        const { parasha_number, title, description, icon, link, subtitle, content, image_url, pdf_file, youtube_link, cycle_id, cycle_name } = data;
        return await db.query(
            `INSERT INTO parashot (parasha_number, title, subtitle, description, content, image_url, pdf_file, icon, link, youtube_link, cycle_id, cycle_name) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
                title = VALUES(title),
                subtitle = VALUES(subtitle),
                description = VALUES(description),
                content = VALUES(content),
                image_url = IF(VALUES(image_url) != '', VALUES(image_url), image_url),
                pdf_file = IF(VALUES(pdf_file) != '', VALUES(pdf_file), pdf_file),
                icon = VALUES(icon),
                link = VALUES(link),
                youtube_link = VALUES(youtube_link),
                cycle_id = VALUES(cycle_id),
                cycle_name = VALUES(cycle_name),
                views = 0,
                updated_at = CURRENT_TIMESTAMP`,
            [parasha_number || null, title, subtitle || '', description || '', content || '', image_url || '', pdf_file || '', icon || 'bi-journal-text', link || '', youtube_link || '', cycle_id || null, cycle_name || null]
        );
    }

    static async update(id, data) {
        await this.ensureColumns();
        const { parasha_number, title, description, icon, link, subtitle, content, image_url, pdf_file, youtube_link, cycle_id, cycle_name } = data;
        return await db.query(
            'UPDATE parashot SET parasha_number = ?, title = ?, subtitle = ?, description = ?, content = ?, image_url = ?, pdf_file = ?, icon = ?, link = ?, youtube_link = ?, cycle_id = ?, cycle_name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [parasha_number || null, title, subtitle || '', description || '', content || '', image_url || '', pdf_file || '', icon || 'bi-journal-text', link || '', youtube_link || '', cycle_id || null, cycle_name || null, id]
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

    static async incrementViews(id) {
        try {
            await db.query('UPDATE parashot SET views = COALESCE(views, 0) + 1 WHERE id = ?', [id]);
        } catch (e) {
            console.warn('Aviso incrementViews parashot:', e.message);
        }
    }

    static async getByTitleOrMatch(title, subtitle, reference) {
        if (!title && !subtitle && !reference) return null;
        const candidates = [title, subtitle, reference].filter(Boolean);
        for (const cand of candidates) {
            const clean = cand.replace(/haftará|haftara|parashá|parasha/gi, '').trim();
            if (clean.length >= 3) {
                const [rows] = await db.query('SELECT * FROM parashot WHERE title LIKE ? OR subtitle LIKE ? LIMIT 1', [`%${clean}%`, `%${clean}%`]);
                if (rows && rows.length > 0) return rows[0];
            }
        }
        return null;
    }
}

module.exports = Parasha;
