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
                { name: 'reading_date', type: 'DATE DEFAULT NULL' },
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

            // Auto-corrección de aliyot cuyo aliyah_number quedó en 1 o NULL por defecto pero su título indica 2, 3, 4, 5, 6, 7
            try {
                for (let i = 2; i <= 7; i++) {
                    await db.query(
                        `UPDATE semillas_shorts 
                         SET aliyah_number = ? 
                         WHERE (title LIKE ? OR title LIKE ? OR title LIKE ? OR title LIKE ? OR title LIKE ? OR title LIKE ?) 
                           AND (aliyah_number = 1 OR aliyah_number IS NULL) 
                           AND (short_type = 'aliya' OR short_type IS NULL)`,
                        [i, `%${i}ª%Aliy%`, `%${i}°%Aliy%`, `%${i}º%Aliy%`, `%${i}a%Aliy%`, `%${i}da%Aliy%`, `%Aliy%${i}%`]
                    );
                }
            } catch(e) {}

        } catch (e) {
            console.warn('Aviso en SemillasShort.ensureTable:', e.message);
        }
    }

    static detectAliyahFromText(text) {
        if (!text || typeof text !== 'string') return null;
        const clean = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
        
        const pattern1 = /(?:aliya|aliyah)\s*(\d+)/i;
        const match1 = clean.match(pattern1);
        if (match1) {
            const val = parseInt(match1[1]);
            if (val >= 1 && val <= 7) return val;
        }

        const pattern2 = /(\d+)\s*(?:[ª°ºa]|ra|da|ta|va|ma)?\s*(?:aliya|aliyah)/i;
        const match2 = clean.match(pattern2);
        if (match2) {
            const val = parseInt(match2[1]);
            if (val >= 1 && val <= 7) return val;
        }

        const words = {
            'primera': 1, 'primero': 1, 'segunda': 2, 'segundo': 2,
            'tercera': 3, 'tercero': 3, 'cuarta': 4, 'cuarto': 4,
            'quinta': 5, 'quinto': 5, 'sexta': 6, 'sexto': 6,
            'septima': 7, 'septimo': 7
        };
        for (const [w, n] of Object.entries(words)) {
            if (clean.includes(w) && (clean.includes('aliya') || clean.includes('aliyah'))) {
                return n;
            }
        }

        return null;
    }

    static extractAliyahNumber(title, explicitNumber) {
        if (explicitNumber !== undefined && explicitNumber !== null && explicitNumber !== '') {
            const num = parseInt(explicitNumber);
            if (!isNaN(num)) {
                // Si el número explícito vino como 1 pero el título indica claramente otra aliyá (ej: Aliyá 4°),
                // corregimos para evitar que quede mal por el valor por defecto del select
                if (title && num === 1) {
                    const detected = SemillasShort.detectAliyahFromText(title);
                    if (detected && detected !== 1) return detected;
                }
                return num;
            }
        }
        if (title) {
            const detected = SemillasShort.detectAliyahFromText(title);
            if (detected) return detected;
        }
        return 1;
    }

    static sortList(items) {
        if (!items || !Array.isArray(items)) return [];
        return [...items].sort((a, b) => {
            // 1. Destacados primero
            if (a.is_highlight && !b.is_highlight) return -1;
            if (!a.is_highlight && b.is_highlight) return 1;

            const parashaA = (a.parasha_name || '').trim().toLowerCase();
            const parashaB = (b.parasha_name || '').trim().toLowerCase();

            // 2. Si pertenecen a la misma Parashá, ordenar de forma DESCENDENTE por número de Aliyá (2 antes que 1, 7 antes que 6)
            if (parashaA && parashaB && parashaA === parashaB) {
                const numA = parseInt(a.aliyah_number) || SemillasShort.extractAliyahNumber(a.title, a.aliyah_number) || 0;
                const numB = parseInt(b.aliyah_number) || SemillasShort.extractAliyahNumber(b.title, b.aliyah_number) || 0;
                if (numA !== numB) return numB - numA; // DESC: 2 antes que 1
            }

            // 3. Comparar fecha (a nivel de día YYYY-MM-DD)
            const getDateStr = (item) => {
                if (item.reading_date) {
                    try { return new Date(item.reading_date).toISOString().slice(0, 10); } catch(e) {}
                }
                if (item.created_at) {
                    try { return new Date(item.created_at).toISOString().slice(0, 10); } catch(e) {}
                }
                return '1970-01-01';
            };

            const dateA = getDateStr(a);
            const dateB = getDateStr(b);

            if (dateA !== dateB) {
                return dateB.localeCompare(dateA); // Más reciente primero
            }

            // 4. Misma fecha: Aliyá mayor primero (2 antes que 1, 7 antes que 6)
            const numA = parseInt(a.aliyah_number) || SemillasShort.extractAliyahNumber(a.title, a.aliyah_number) || 0;
            const numB = parseInt(b.aliyah_number) || SemillasShort.extractAliyahNumber(b.title, b.aliyah_number) || 0;
            if (numA !== numB) return numB - numA;

            return (b.id || 0) - (a.id || 0);
        });
    }

    static async getAll() {
        try {
            await SemillasShort.ensureTable();
            const [rows] = await db.query('SELECT * FROM semillas_shorts ORDER BY is_highlight DESC, COALESCE(DATE(reading_date), DATE(created_at)) DESC, CASE WHEN aliyah_number IS NULL THEN 0 ELSE aliyah_number END DESC, id DESC');
            return SemillasShort.sortList(rows || []);
        } catch (e) {
            console.warn('Aviso en SemillasShort.getAll:', e.message);
            return [];
        }
    }

    static async getPublished() {
        try {
            await SemillasShort.ensureTable();
            const [rows] = await db.query('SELECT * FROM semillas_shorts WHERE is_published = 1 OR is_published = TRUE OR is_published IS NULL ORDER BY COALESCE(DATE(reading_date), DATE(created_at)) DESC, CASE WHEN aliyah_number IS NULL THEN 0 ELSE aliyah_number END DESC, id DESC');
            return SemillasShort.sortList(rows || []);
        } catch (e) {
            console.warn('Aviso en SemillasShort.getPublished:', e.message);
            return [];
        }
    }

    static async getLatest(limit = 6) {
        try {
            await SemillasShort.ensureTable();
            const [rows] = await db.query('SELECT * FROM semillas_shorts WHERE is_published = TRUE ORDER BY COALESCE(DATE(reading_date), DATE(created_at)) DESC, CASE WHEN aliyah_number IS NULL THEN 0 ELSE aliyah_number END DESC, id DESC');
            const sorted = SemillasShort.sortList(rows || []);
            return sorted.slice(0, limit);
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
            reading_date,
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
        const finalAliyahNumber = type === 'general' ? (parseInt(aliyah_number) || null) : SemillasShort.extractAliyahNumber(title, aliyah_number);

        return await db.query(
            `INSERT INTO semillas_shorts 
             (title, short_type, category, child_name, parasha_name, aliyah_number, reading_date, verses_reference, video_url, youtube_short_url, youtube_url, thumbnail_url, description, is_highlight, is_published) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                title,
                type,
                cat,
                child_name || '',
                parasha_name || '',
                finalAliyahNumber,
                reading_date || null,
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
            reading_date,
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
        const finalAliyahNumber = type === 'general' ? (parseInt(aliyah_number) || null) : SemillasShort.extractAliyahNumber(title, aliyah_number);

        return await db.query(
            `UPDATE semillas_shorts 
             SET title = ?, short_type = ?, category = ?, child_name = ?, parasha_name = ?, aliyah_number = ?, reading_date = ?, verses_reference = ?, video_url = ?, youtube_short_url = ?, youtube_url = ?, thumbnail_url = ?, description = ?, is_highlight = ?, is_published = ? 
             WHERE id = ?`,
            [
                title,
                type,
                cat,
                child_name || '',
                parasha_name || '',
                finalAliyahNumber,
                reading_date || null,
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
