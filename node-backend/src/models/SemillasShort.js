const db = require('../config/db');

class SemillasShort {
    static async ensureTable() {
        try {
            const createTableSql = `
                CREATE TABLE IF NOT EXISTS semillas_shorts (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    title VARCHAR(255) NOT NULL,
                    short_type VARCHAR(50) DEFAULT 'aliya',
                    category VARCHAR(100) DEFAULT 'Aliyot con Niños',
                    child_name VARCHAR(255) DEFAULT NULL,
                    parasha_name VARCHAR(255) DEFAULT NULL,
                    aliyah_number INT DEFAULT 1,
                    verses_reference VARCHAR(255) DEFAULT NULL,
                    video_url VARCHAR(500) DEFAULT NULL,
                    youtube_short_url VARCHAR(500) DEFAULT NULL,
                    youtube_url VARCHAR(500) DEFAULT NULL,
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

            // Asegurar que todas las columnas existan si la tabla fue creada previamente con otro esquema
            const columnsToAdd = [
                { name: 'short_type', type: "VARCHAR(50) DEFAULT 'aliya'" },
                { name: 'category', type: "VARCHAR(100) DEFAULT 'Aliyot con Niños'" },
                { name: 'child_name', type: 'VARCHAR(255) DEFAULT NULL' },
                { name: 'parasha_name', type: 'VARCHAR(255) DEFAULT NULL' },
                { name: 'aliyah_number', type: 'INT DEFAULT NULL' },
                { name: 'verses_reference', type: 'VARCHAR(255) DEFAULT NULL' },
                { name: 'video_url', type: 'VARCHAR(500) DEFAULT NULL' },
                { name: 'youtube_short_url', type: 'VARCHAR(500) DEFAULT NULL' },
                { name: 'youtube_url', type: 'VARCHAR(500) DEFAULT NULL' },
                { name: 'thumbnail_url', type: 'VARCHAR(500) DEFAULT NULL' },
                { name: 'description', type: 'TEXT DEFAULT NULL' },
                { name: 'is_highlight', type: 'BOOLEAN DEFAULT FALSE' },
                { name: 'is_published', type: 'BOOLEAN DEFAULT TRUE' },
                { name: 'views_count', type: 'INT DEFAULT 0' }
            ];

            for (const col of columnsToAdd) {
                try {
                    const [exists] = await db.query(`SHOW COLUMNS FROM semillas_shorts LIKE '${col.name}'`);
                    if (!exists || exists.length === 0) {
                        await db.query(`ALTER TABLE semillas_shorts ADD COLUMN ${col.name} ${col.type}`);
                    }
                } catch(errCol) {
                    try {
                        await db.query(`ALTER TABLE semillas_shorts ADD COLUMN IF NOT EXISTS ${col.name} ${col.type}`);
                    } catch(errPG) {}
                }
            }

            // Asegurar que columnas opcionales no tengan NOT NULL antiguo
            try {
                await db.query(`ALTER TABLE semillas_shorts MODIFY COLUMN youtube_url VARCHAR(500) DEFAULT NULL`);
            } catch(e) {}
            try {
                await db.query(`ALTER TABLE semillas_shorts MODIFY COLUMN youtube_short_url VARCHAR(500) DEFAULT NULL`);
            } catch(e) {}
            try {
                await db.query(`ALTER TABLE semillas_shorts MODIFY COLUMN parasha_name VARCHAR(255) DEFAULT NULL`);
            } catch(e) {}
            try {
                await db.query(`ALTER TABLE semillas_shorts MODIFY COLUMN aliyah_number INT DEFAULT NULL`);
            } catch(e) {}
            try {
                await db.query(`ALTER TABLE semillas_shorts MODIFY COLUMN child_name VARCHAR(255) DEFAULT NULL`);
            } catch(e) {}
            try {
                await db.query(`ALTER TABLE semillas_shorts MODIFY COLUMN verses_reference VARCHAR(255) DEFAULT NULL`);
            } catch(e) {}

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

    static extractYoutubeId(url) {
        if (!url || typeof url !== 'string') return '';
        const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|live\/|shorts\/))([\w-]{11})/);
        if (match && match[1]) return match[1];
        return '';
    }

    static async create(data) {
        await SemillasShort.ensureTable();
        let {
            title,
            short_type,
            category,
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

        const ytUrl = youtube_short_url || '';
        let thumb = thumbnail_url || '';
        if (!thumb && ytUrl) {
            const ytId = SemillasShort.extractYoutubeId(ytUrl);
            if (ytId) thumb = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
        }

        const type = short_type || 'aliya';
        const cat = category || (type === 'general' ? 'General / Temas Diversos' : 'Aliyot con Niños');

        return await db.query(
            `INSERT INTO semillas_shorts 
             (title, short_type, category, child_name, parasha_name, aliyah_number, verses_reference, video_url, youtube_short_url, youtube_url, thumbnail_url, description, is_highlight, is_published) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                title,
                type,
                cat,
                child_name || '',
                parasha_name || '',
                type === 'general' ? (parseInt(aliyah_number) || null) : (parseInt(aliyah_number) || 1),
                verses_reference || '',
                video_url || '',
                ytUrl,
                ytUrl,
                thumb || '/assets/img/pagina/semillas_torah_banner.png',
                description || '',
                is_highlight ? 1 : 0,
                is_published !== undefined ? (is_published ? 1 : 0) : 1
            ]
        );
    }

    static async update(id, data) {
        await SemillasShort.ensureTable();
        let {
            title,
            short_type,
            category,
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

        const ytUrl = youtube_short_url || '';
        let thumb = thumbnail_url || '';
        if (!thumb && ytUrl) {
            const ytId = SemillasShort.extractYoutubeId(ytUrl);
            if (ytId) thumb = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
        }

        const type = short_type || 'aliya';
        const cat = category || (type === 'general' ? 'General / Temas Diversos' : 'Aliyot con Niños');

        return await db.query(
            `UPDATE semillas_shorts 
             SET title = ?, short_type = ?, category = ?, child_name = ?, parasha_name = ?, aliyah_number = ?, verses_reference = ?, video_url = ?, youtube_short_url = ?, youtube_url = ?, thumbnail_url = ?, description = ?, is_highlight = ?, is_published = ? 
             WHERE id = ?`,
            [
                title,
                type,
                cat,
                child_name || '',
                parasha_name || '',
                type === 'general' ? (parseInt(aliyah_number) || null) : (parseInt(aliyah_number) || 1),
                verses_reference || '',
                video_url || '',
                ytUrl,
                ytUrl,
                thumb || '/assets/img/pagina/semillas_torah_banner.png',
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
