const db = require('../config/db');

class SemillasShort {
    static async ensureTable() {
        try {
            const createTableSql = `
                CREATE TABLE IF NOT EXISTS semillas_shorts (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    title VARCHAR(255) NOT NULL,
                    child_name VARCHAR(255) DEFAULT NULL,
                    parasha_name VARCHAR(255) DEFAULT NULL,
                    aliyah_number INT DEFAULT 1,
                    verses_reference VARCHAR(255) DEFAULT NULL,
                    video_url VARCHAR(500) DEFAULT NULL,
                    youtube_short_url VARCHAR(500) DEFAULT NULL,
                    thumbnail_url VARCHAR(500) DEFAULT NULL,
                    description TEXT DEFAULT NULL,
                    is_highlight BOOLEAN DEFAULT FALSE,
                    is_published BOOLEAN DEFAULT TRUE,
                    views_count INT DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )
            `;
            await db.query(createTableSql);

            // Verificar si hay registros iniciales, si no, insertar de ejemplo
            const [rows] = await db.query('SELECT COUNT(*) as count FROM semillas_shorts');
            const total = rows && rows[0] ? rows[0].count : 0;
            if (total === 0) {
                const initialSql = `
                    INSERT INTO semillas_shorts (title, child_name, parasha_name, aliyah_number, verses_reference, video_url, youtube_short_url, thumbnail_url, description, is_highlight, is_published)
                    VALUES 
                    (
                        '1ª Aliyá de Bereshit con los Niños',
                        'Lucas y Sofía',
                        'Bereshit',
                        1,
                        'Génesis 1:1 - 1:5',
                        '',
                        'https://www.youtube.com/shorts/dQw4w9WgXcQ',
                        '/assets/img/pagina/semillas_torah_banner.png',
                        'Nuestros pequeños compartiendo con gozo la bendición y lectura de la primera Aliyá en Shabat.',
                        TRUE,
                        TRUE
                    ),
                    (
                        '2ª Aliyá: El Firmamento y las Aguas',
                        'Mateo (7 años)',
                        'Bereshit',
                        2,
                        'Génesis 1:6 - 1:8',
                        '',
                        '',
                        '/assets/img/pagina/semillas_torah.jpg',
                        'Hermosa recitación de los versículos del segundo día de la creación.',
                        FALSE,
                        TRUE
                    )
                `;
                await db.query(initialSql);
            }
        } catch (e) {
            console.warn('Aviso en SemillasShort.ensureTable:', e.message);
        }
    }

    static async getAll() {
        try {
            await SemillasShort.ensureTable();
            const [rows] = await db.query('SELECT * FROM semillas_shorts ORDER BY is_highlight DESC, id DESC');
            return rows || [];
        } catch (e) {
            console.warn('Aviso en SemillasShort.getAll:', e.message);
            return [];
        }
    }

    static async getPublished() {
        try {
            await SemillasShort.ensureTable();
            const [rows] = await db.query('SELECT * FROM semillas_shorts WHERE is_published = TRUE ORDER BY is_highlight DESC, id DESC');
            return rows || [];
        } catch (e) {
            console.warn('Aviso en SemillasShort.getPublished:', e.message);
            return [];
        }
    }

    static async getLatest(limit = 6) {
        try {
            await SemillasShort.ensureTable();
            const [rows] = await db.query('SELECT * FROM semillas_shorts WHERE is_published = TRUE ORDER BY id DESC LIMIT ?', [limit]);
            return rows || [];
        } catch (e) {
            console.warn('Aviso en SemillasShort.getLatest:', e.message);
            return [];
        }
    }

    static async getById(id) {
        try {
            await SemillasShort.ensureTable();
            const [rows] = await db.query('SELECT * FROM semillas_shorts WHERE id = ?', [id]);
            return rows[0] || null;
        } catch (e) {
            console.warn('Aviso en SemillasShort.getById:', e.message);
            return null;
        }
    }

    static async create(data) {
        await SemillasShort.ensureTable();
        const {
            title,
            child_name,
            parasha_name,
            aliyah_number,
            verses_reference,
            video_url,
            youtube_short_url,
            thumbnail_url,
            description,
            is_highlight,
            is_published
        } = data;

        return await db.query(
            `INSERT INTO semillas_shorts 
             (title, child_name, parasha_name, aliyah_number, verses_reference, video_url, youtube_short_url, thumbnail_url, description, is_highlight, is_published) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                title,
                child_name || '',
                parasha_name || '',
                parseInt(aliyah_number) || 1,
                verses_reference || '',
                video_url || '',
                youtube_short_url || '',
                thumbnail_url || '',
                description || '',
                is_highlight ? 1 : 0,
                is_published !== undefined ? (is_published ? 1 : 0) : 1
            ]
        );
    }

    static async update(id, data) {
        await SemillasShort.ensureTable();
        const {
            title,
            child_name,
            parasha_name,
            aliyah_number,
            verses_reference,
            video_url,
            youtube_short_url,
            thumbnail_url,
            description,
            is_highlight,
            is_published
        } = data;

        return await db.query(
            `UPDATE semillas_shorts 
             SET title = ?, child_name = ?, parasha_name = ?, aliyah_number = ?, verses_reference = ?, video_url = ?, youtube_short_url = ?, thumbnail_url = ?, description = ?, is_highlight = ?, is_published = ? 
             WHERE id = ?`,
            [
                title,
                child_name || '',
                parasha_name || '',
                parseInt(aliyah_number) || 1,
                verses_reference || '',
                video_url || '',
                youtube_short_url || '',
                thumbnail_url || '',
                description || '',
                is_highlight ? 1 : 0,
                is_published !== undefined ? (is_published ? 1 : 0) : 1,
                id
            ]
        );
    }

    static async delete(id) {
        await SemillasShort.ensureTable();
        return await db.query('DELETE FROM semillas_shorts WHERE id = ?', [id]);
    }

    static async incrementViews(id) {
        try {
            await SemillasShort.ensureTable();
            await db.query('UPDATE semillas_shorts SET views_count = views_count + 1 WHERE id = ?', [id]);
        } catch (e) {
            console.warn('Aviso incrementViews:', e.message);
        }
    }
}

module.exports = SemillasShort;
