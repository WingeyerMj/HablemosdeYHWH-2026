const db = require('../config/db');

class ParashaInfantil {
    static async ensureTable() {
        const isPostgres = !!process.env.DATABASE_URL;
        if (isPostgres) {
            await db.query(`
                CREATE TABLE IF NOT EXISTS parashot_infantiles (
                    id SERIAL PRIMARY KEY,
                    parasha_id INT DEFAULT NULL,
                    title VARCHAR(255) NOT NULL,
                    parasha_name VARCHAR(150),
                    parasha_number INT DEFAULT NULL,
                    book VARCHAR(100) DEFAULT 'Torah',
                    biblical_reference VARCHAR(255),
                    key_verse VARCHAR(300),
                    summary TEXT,
                    cover_image VARCHAR(500),
                    pdf_file VARCHAR(500) NOT NULL,
                    cycle_name VARCHAR(100) DEFAULT 'Ciclo 2025 - 2026',
                    is_published BOOLEAN DEFAULT TRUE,
                    downloads_count INT DEFAULT 0,
                    views_count INT DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
                CREATE INDEX IF NOT EXISTS idx_pi_published ON parashot_infantiles(is_published);
                CREATE INDEX IF NOT EXISTS idx_pi_created ON parashot_infantiles(created_at);
                CREATE INDEX IF NOT EXISTS idx_pi_parasha_id ON parashot_infantiles(parasha_id);
            `);
        } else {
            await db.query(`
                CREATE TABLE IF NOT EXISTS parashot_infantiles (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    parasha_id INT DEFAULT NULL,
                    title VARCHAR(255) NOT NULL,
                    parasha_name VARCHAR(150) NULL,
                    parasha_number INT DEFAULT NULL,
                    book VARCHAR(100) DEFAULT 'Torah',
                    biblical_reference VARCHAR(255) NULL,
                    key_verse VARCHAR(300) NULL,
                    summary TEXT NULL,
                    cover_image VARCHAR(500) NULL,
                    pdf_file VARCHAR(500) NOT NULL,
                    cycle_name VARCHAR(100) DEFAULT 'Ciclo 2025 - 2026',
                    is_published BOOLEAN DEFAULT TRUE,
                    downloads_count INT DEFAULT 0,
                    views_count INT DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    INDEX idx_pi_published (is_published),
                    INDEX idx_pi_created (created_at),
                    INDEX idx_pi_parasha_id (parasha_id)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            `);
        }

        // Migración de columnas para tablas ya creadas
        try {
            const [cols] = await db.query("SHOW COLUMNS FROM parashot_infantiles LIKE 'parasha_id'");
            if (!cols || cols.length === 0) {
                await db.query("ALTER TABLE parashot_infantiles ADD COLUMN parasha_id INT NULL AFTER id");
                try {
                    await db.query("CREATE INDEX idx_pi_parasha_id ON parashot_infantiles(parasha_id)");
                } catch (eIndex) {}
            }
        } catch (eCol) {}

        // Auto-vincular parashot_infantiles con parashot por número si aún no tienen parasha_id
        try {
            await db.query(`
                UPDATE parashot_infantiles pi
                INNER JOIN parashot p ON p.parasha_number = pi.parasha_number
                SET pi.parasha_id = p.id
                WHERE (pi.parasha_id IS NULL OR pi.parasha_id = 0) AND pi.parasha_number IS NOT NULL
            `);
        } catch (eLink) {}
    }

    static async getAll() {
        await this.ensureTable();
        const [rows] = await db.query(`
            SELECT pi.*, 
                   p.title AS parasha_title_canonical, 
                   p.subtitle AS parasha_subtitle_canonical
            FROM parashot_infantiles pi
            LEFT JOIN parashot p ON (pi.parasha_id = p.id OR (pi.parasha_number IS NOT NULL AND pi.parasha_number = p.parasha_number))
            ORDER BY COALESCE(pi.parasha_number, p.parasha_number, 999) ASC, pi.id DESC
        `);
        return rows || [];
    }

    static async getPublished() {
        await this.ensureTable();
        const [rows] = await db.query(`
            SELECT pi.*, 
                   p.title AS parasha_title_canonical, 
                   p.subtitle AS parasha_subtitle_canonical
            FROM parashot_infantiles pi
            LEFT JOIN parashot p ON (pi.parasha_id = p.id OR (pi.parasha_number IS NOT NULL AND pi.parasha_number = p.parasha_number))
            WHERE pi.is_published = 1 OR pi.is_published = TRUE
            ORDER BY COALESCE(pi.parasha_number, p.parasha_number, 999) ASC, pi.id DESC
        `);
        return rows || [];
    }

    static async getLatest(limit = 6) {
        await this.ensureTable();
        const [rows] = await db.query(`
            SELECT pi.*, 
                   p.title AS parasha_title_canonical, 
                   p.subtitle AS parasha_subtitle_canonical
            FROM parashot_infantiles pi
            LEFT JOIN parashot p ON (pi.parasha_id = p.id OR (pi.parasha_number IS NOT NULL AND pi.parasha_number = p.parasha_number))
            WHERE pi.is_published = 1 OR pi.is_published = TRUE
            ORDER BY pi.id DESC
            LIMIT ?
        `, [limit]);
        return rows || [];
    }

    static async getById(id) {
        await this.ensureTable();
        const [rows] = await db.query(`
            SELECT pi.*, 
                   p.title AS parasha_title_canonical, 
                   p.subtitle AS parasha_subtitle_canonical
            FROM parashot_infantiles pi
            LEFT JOIN parashot p ON (pi.parasha_id = p.id OR (pi.parasha_number IS NOT NULL AND pi.parasha_number = p.parasha_number))
            WHERE pi.id = ? 
            LIMIT 1
        `, [id]);
        return rows && rows.length ? rows[0] : null;
    }

    static async getByParashaId(parashaId) {
        await this.ensureTable();
        const [rows] = await db.query(`
            SELECT pi.*, 
                   p.title AS parasha_title_canonical, 
                   p.subtitle AS parasha_subtitle_canonical
            FROM parashot_infantiles pi
            LEFT JOIN parashot p ON (pi.parasha_id = p.id OR (pi.parasha_number IS NOT NULL AND pi.parasha_number = p.parasha_number))
            WHERE (pi.parasha_id = ? OR p.id = ?) AND (pi.is_published = 1 OR pi.is_published = TRUE)
            ORDER BY pi.id DESC
            LIMIT 1
        `, [parashaId, parashaId]);
        return rows && rows.length ? rows[0] : null;
    }

    static async getByParashaNumber(parashaNumber) {
        await this.ensureTable();
        const [rows] = await db.query(`
            SELECT pi.*, 
                   p.title AS parasha_title_canonical, 
                   p.subtitle AS parasha_subtitle_canonical
            FROM parashot_infantiles pi
            LEFT JOIN parashot p ON (pi.parasha_id = p.id OR (pi.parasha_number IS NOT NULL AND pi.parasha_number = p.parasha_number))
            WHERE (pi.parasha_number = ? OR p.parasha_number = ?) AND (pi.is_published = 1 OR pi.is_published = TRUE)
            ORDER BY pi.id DESC
            LIMIT 1
        `, [parashaNumber, parashaNumber]);
        return rows && rows.length ? rows[0] : null;
    }

    static async create(data) {
        await this.ensureTable();
        const sql = `
            INSERT INTO parashot_infantiles 
            (parasha_id, title, parasha_name, parasha_number, book, biblical_reference, key_verse, summary, cover_image, pdf_file, cycle_name, is_published)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const params = [
            data.parasha_id ? parseInt(data.parasha_id, 10) : null,
            data.title || 'Parashá Semanal Infantil',
            data.parasha_name || '',
            data.parasha_number ? parseInt(data.parasha_number, 10) : null,
            data.book || 'Torah',
            data.biblical_reference || '',
            data.key_verse || '',
            data.summary || '',
            data.cover_image || null,
            data.pdf_file || '',
            data.cycle_name || 'Ciclo 2025 - 2026',
            data.is_published !== undefined ? Boolean(data.is_published) : true
        ];
        const [result] = await db.query(sql, params);
        return result.insertId || result;
    }

    static async update(id, data) {
        await this.ensureTable();
        const sql = `
            UPDATE parashot_infantiles 
            SET parasha_id = ?, title = ?, parasha_name = ?, parasha_number = ?, book = ?, biblical_reference = ?, 
                key_verse = ?, summary = ?, cover_image = COALESCE(?, cover_image), 
                pdf_file = COALESCE(?, pdf_file), cycle_name = ?, is_published = ?
            WHERE id = ?
        `;
        const params = [
            data.parasha_id ? parseInt(data.parasha_id, 10) : null,
            data.title || 'Parashá Semanal Infantil',
            data.parasha_name || '',
            data.parasha_number ? parseInt(data.parasha_number, 10) : null,
            data.book || 'Torah',
            data.biblical_reference || '',
            data.key_verse || '',
            data.summary || '',
            data.cover_image || null,
            data.pdf_file || null,
            data.cycle_name || 'Ciclo 2025 - 2026',
            data.is_published !== undefined ? Boolean(data.is_published) : true,
            id
        ];
        await db.query(sql, params);
        return true;
    }

    static async delete(id) {
        await this.ensureTable();
        await db.query('DELETE FROM parashot_infantiles WHERE id = ?', [id]);
        return true;
    }

    static async togglePublished(id) {
        await this.ensureTable();
        await db.query('UPDATE parashot_infantiles SET is_published = NOT is_published WHERE id = ?', [id]);
        return true;
    }

    static async incrementDownloads(id) {
        await this.ensureTable();
        await db.query('UPDATE parashot_infantiles SET downloads_count = downloads_count + 1 WHERE id = ?', [id]);
        return true;
    }

    static async incrementViews(id) {
        await this.ensureTable();
        await db.query('UPDATE parashot_infantiles SET views_count = views_count + 1 WHERE id = ?', [id]);
        return true;
    }
}

module.exports = ParashaInfantil;

