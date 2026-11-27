const db = require('../config/db');

class ReunionShabatNinos {
    static async ensureTable() {
        const isPostgres = !!process.env.DATABASE_URL;
        if (isPostgres) {
            await db.query(`
                CREATE TABLE IF NOT EXISTS reuniones_shabat_ninos (
                    id SERIAL PRIMARY KEY,
                    parasha_id INT DEFAULT NULL,
                    parasha_infantil_id INT DEFAULT NULL,
                    title VARCHAR(255) NOT NULL,
                    meeting_date DATE DEFAULT NULL,
                    cycle_name VARCHAR(100) DEFAULT 'Ciclo 2026 - 2027',
                    youtube_link VARCHAR(500) DEFAULT NULL,
                    video_file VARCHAR(500) DEFAULT NULL,
                    pdf_file VARCHAR(500) DEFAULT NULL,
                    cover_image VARCHAR(500) DEFAULT NULL,
                    teachers VARCHAR(255) DEFAULT NULL,
                    description TEXT DEFAULT NULL,
                    keywords TEXT DEFAULT NULL,
                    is_published BOOLEAN DEFAULT TRUE,
                    views_count INT DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
                CREATE INDEX IF NOT EXISTS idx_rsn_published ON reuniones_shabat_ninos(is_published);
                CREATE INDEX IF NOT EXISTS idx_rsn_meeting_date ON reuniones_shabat_ninos(meeting_date);
                CREATE INDEX IF NOT EXISTS idx_rsn_parasha_id ON reuniones_shabat_ninos(parasha_id);
            `);
        } else {
            await db.query(`
                CREATE TABLE IF NOT EXISTS reuniones_shabat_ninos (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    parasha_id INT DEFAULT NULL,
                    parasha_infantil_id INT DEFAULT NULL,
                    title VARCHAR(255) NOT NULL,
                    meeting_date DATE DEFAULT NULL,
                    cycle_name VARCHAR(100) DEFAULT 'Ciclo 2026 - 2027',
                    youtube_link VARCHAR(500) NULL,
                    video_file VARCHAR(500) NULL,
                    pdf_file VARCHAR(500) NULL,
                    cover_image VARCHAR(500) NULL,
                    teachers VARCHAR(255) NULL,
                    description TEXT NULL,
                    keywords TEXT NULL,
                    is_published BOOLEAN DEFAULT TRUE,
                    views_count INT DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    INDEX idx_rsn_published (is_published),
                    INDEX idx_rsn_meeting_date (meeting_date),
                    INDEX idx_rsn_parasha_id (parasha_id)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            `);
        }
    }

    static async getAll() {
        await this.ensureTable();
        const [rows] = await db.query(`
            SELECT r.*,
                   p.title AS parasha_title,
                   p.subtitle AS parasha_subtitle,
                   p.parasha_number,
                   p.image_url AS parasha_image_url,
                   pi.title AS parasha_infantil_title,
                   pi.pdf_file AS parasha_infantil_pdf,
                   pi.cover_image AS parasha_infantil_cover,
                   pi.parasha_name AS parasha_infantil_name
            FROM reuniones_shabat_ninos r
            LEFT JOIN parashot p ON r.parasha_id = p.id
            LEFT JOIN parashot_infantiles pi ON (
                (r.parasha_infantil_id IS NOT NULL AND r.parasha_infantil_id = pi.id)
                OR (r.parasha_infantil_id IS NULL AND r.parasha_id IS NOT NULL AND (pi.parasha_id = r.parasha_id OR pi.parasha_number = p.parasha_number))
            )
            ORDER BY CASE WHEN r.sort_order > 0 THEN r.sort_order ELSE 999999 END ASC, COALESCE(r.meeting_date, r.created_at) DESC, r.id DESC
        `);
        return rows || [];
    }

    static async getPublished() {
        await this.ensureTable();
        const [rows] = await db.query(`
            SELECT r.*,
                   p.title AS parasha_title,
                   p.subtitle AS parasha_subtitle,
                   p.parasha_number,
                   p.image_url AS parasha_image_url,
                   pi.title AS parasha_infantil_title,
                   pi.pdf_file AS parasha_infantil_pdf,
                   pi.cover_image AS parasha_infantil_cover,
                   pi.parasha_name AS parasha_infantil_name
            FROM reuniones_shabat_ninos r
            LEFT JOIN parashot p ON r.parasha_id = p.id
            LEFT JOIN parashot_infantiles pi ON (
                (r.parasha_infantil_id IS NOT NULL AND r.parasha_infantil_id = pi.id)
                OR (r.parasha_infantil_id IS NULL AND r.parasha_id IS NOT NULL AND (pi.parasha_id = r.parasha_id OR pi.parasha_number = p.parasha_number))
            )
            WHERE r.is_published = 1 OR r.is_published = TRUE
            ORDER BY CASE WHEN r.sort_order > 0 THEN r.sort_order ELSE 999999 END ASC, COALESCE(r.meeting_date, r.created_at) DESC, r.id DESC
        `);
        return rows || [];
    }

    static async getById(id) {
        await this.ensureTable();
        const [rows] = await db.query(`
            SELECT r.*,
                   p.title AS parasha_title,
                   p.subtitle AS parasha_subtitle,
                   p.parasha_number,
                   p.image_url AS parasha_image_url,
                   pi.title AS parasha_infantil_title,
                   pi.pdf_file AS parasha_infantil_pdf,
                   pi.cover_image AS parasha_infantil_cover,
                   pi.parasha_name AS parasha_infantil_name
            FROM reuniones_shabat_ninos r
            LEFT JOIN parashot p ON r.parasha_id = p.id
            LEFT JOIN parashot_infantiles pi ON (
                (r.parasha_infantil_id IS NOT NULL AND r.parasha_infantil_id = pi.id)
                OR (r.parasha_infantil_id IS NULL AND r.parasha_id IS NOT NULL AND (pi.parasha_id = r.parasha_id OR pi.parasha_number = p.parasha_number))
            )
            WHERE r.id = ?
            LIMIT 1
        `, [id]);
        return rows && rows.length > 0 ? rows[0] : null;
    }

    static async create(data) {
        await this.ensureTable();
        const {
            parasha_id,
            parasha_infantil_id,
            title,
            meeting_date,
            cycle_name,
            youtube_link,
            video_file,
            pdf_file,
            cover_image,
            teachers,
            description,
            keywords,
            is_published
        } = data;

        const [result] = await db.query(`
            INSERT INTO reuniones_shabat_ninos (
                parasha_id,
                parasha_infantil_id,
                title,
                meeting_date,
                cycle_name,
                youtube_link,
                video_file,
                pdf_file,
                cover_image,
                teachers,
                description,
                keywords,
                is_published
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            parasha_id || null,
            parasha_infantil_id || null,
            title,
            meeting_date || null,
            cycle_name || 'Ciclo 2026 - 2027',
            youtube_link || null,
            video_file || null,
            pdf_file || null,
            cover_image || null,
            teachers || null,
            description || null,
            keywords ? keywords.trim() : null,
            is_published !== undefined ? (is_published ? 1 : 0) : 1
        ]);
        return result.insertId;
    }

    static async update(id, data) {
        await this.ensureTable();
        const {
            parasha_id,
            parasha_infantil_id,
            title,
            meeting_date,
            cycle_name,
            youtube_link,
            video_file,
            pdf_file,
            cover_image,
            teachers,
            description,
            keywords,
            is_published
        } = data;

        await db.query(`
            UPDATE reuniones_shabat_ninos SET
                parasha_id = ?,
                parasha_infantil_id = ?,
                title = ?,
                meeting_date = ?,
                cycle_name = ?,
                youtube_link = ?,
                video_file = ?,
                pdf_file = ?,
                cover_image = ?,
                teachers = ?,
                description = ?,
                keywords = ?,
                is_published = ?
            WHERE id = ?
        `, [
            parasha_id || null,
            parasha_infantil_id || null,
            title,
            meeting_date || null,
            cycle_name || 'Ciclo 2026 - 2027',
            youtube_link || null,
            video_file || null,
            pdf_file || null,
            cover_image || null,
            teachers || null,
            description || null,
            keywords ? keywords.trim() : null,
            is_published !== undefined ? (is_published ? 1 : 0) : 1,
            id
        ]);
        return true;
    }

    static async togglePublish(id) {
        await this.ensureTable();
        await db.query(`
            UPDATE reuniones_shabat_ninos
            SET is_published = NOT is_published
            WHERE id = ?
        `, [id]);
        return true;
    }

    static async incrementViews(id) {
        await this.ensureTable();
        await db.query(`
            UPDATE reuniones_shabat_ninos
            SET views_count = views_count + 1
            WHERE id = ?
        `, [id]);
        return true;
    }

    static async delete(id) {
        await this.ensureTable();
        await db.query(`DELETE FROM reuniones_shabat_ninos WHERE id = ?`, [id]);
        return true;
    }
}

module.exports = ReunionShabatNinos;
