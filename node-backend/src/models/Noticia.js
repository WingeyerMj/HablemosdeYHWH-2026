const db = require('../config/db');

class Noticia {
    // Asegurar que existan las tablas necesarias en la base de datos
    static async ensureTable() {
        try {
            // 1. Tabla de Noticias (artículos cortos de actualidad mundial)
            const createNoticiasSql = `
                CREATE TABLE IF NOT EXISTS noticias (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    title VARCHAR(255) NOT NULL,
                    slug VARCHAR(255),
                    subtitle VARCHAR(255),
                    category VARCHAR(100) DEFAULT 'Mundial',
                    author VARCHAR(100) DEFAULT 'Redacción YHWH',
                    summary TEXT,
                    content LONGTEXT,
                    image_url VARCHAR(500),
                    source_url VARCHAR(500) DEFAULT NULL,
                    tags VARCHAR(255),
                    is_breaking BOOLEAN DEFAULT FALSE,
                    is_published BOOLEAN DEFAULT TRUE,
                    views INT DEFAULT 0,
                    published_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )
            `;
            try {
                await db.query(createNoticiasSql);
            } catch (errTable) {
                // Fallback para PostgreSQL si la sintaxis difiere
                try {
                    await db.query(`
                        CREATE TABLE IF NOT EXISTS noticias (
                            id SERIAL PRIMARY KEY,
                            title VARCHAR(255) NOT NULL,
                            slug VARCHAR(255),
                            subtitle VARCHAR(255),
                            category VARCHAR(100) DEFAULT 'Mundial',
                            author VARCHAR(100) DEFAULT 'Redacción YHWH',
                            summary TEXT,
                            content TEXT,
                            image_url VARCHAR(500),
                            source_url VARCHAR(500) DEFAULT NULL,
                            tags VARCHAR(255),
                            is_breaking BOOLEAN DEFAULT FALSE,
                            is_published BOOLEAN DEFAULT TRUE,
                            views INT DEFAULT 0,
                            published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                        )
                    `);
                } catch (e) {}
            }

            // Verificar y agregar columnas faltantes a noticias
            const noticiaCols = [
                { name: 'slug', type: 'VARCHAR(255)' },
                { name: 'subtitle', type: 'VARCHAR(255)' },
                { name: 'category', type: "VARCHAR(100) DEFAULT 'Mundial'" },
                { name: 'author', type: "VARCHAR(100) DEFAULT 'Redacción YHWH'" },
                { name: 'summary', type: 'TEXT' },
                { name: 'content', type: 'LONGTEXT' },
                { name: 'image_url', type: 'VARCHAR(500)' },
                { name: 'source_url', type: 'VARCHAR(500) DEFAULT NULL' },
                { name: 'tags', type: 'VARCHAR(255)' },
                { name: 'is_breaking', type: 'BOOLEAN DEFAULT FALSE' },
                { name: 'is_published', type: 'BOOLEAN DEFAULT TRUE' },
                { name: 'views', type: 'INT DEFAULT 0' },
                { name: 'published_at', type: 'DATETIME DEFAULT CURRENT_TIMESTAMP' }
            ];

            for (const col of noticiaCols) {
                try {
                    const [exists] = await db.query(`SHOW COLUMNS FROM noticias LIKE '${col.name}'`);
                    if (!exists || exists.length === 0) {
                        await db.query(`ALTER TABLE noticias ADD COLUMN ${col.name} ${col.type}`);
                    }
                } catch (errCol) {
                    try {
                        await db.query(`ALTER TABLE noticias ADD COLUMN IF NOT EXISTS ${col.name} ${col.type.replace('LONGTEXT', 'TEXT').replace('DATETIME', 'TIMESTAMP')}`);
                    } catch (e) {}
                }
            }

            // 2. Tabla de Shorts / Reels de Noticias
            const createShortsSql = `
                CREATE TABLE IF NOT EXISTS noticias_shorts (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    title VARCHAR(255) NOT NULL,
                    category VARCHAR(100) DEFAULT 'Actualidad',
                    video_url VARCHAR(500) DEFAULT NULL,
                    youtube_short_url VARCHAR(500) DEFAULT NULL,
                    youtube_url VARCHAR(500) DEFAULT NULL,
                    thumbnail_url VARCHAR(500) DEFAULT NULL,
                    description TEXT DEFAULT NULL,
                    source_name VARCHAR(150) DEFAULT NULL,
                    is_highlight BOOLEAN DEFAULT FALSE,
                    is_published BOOLEAN DEFAULT TRUE,
                    views_count INT DEFAULT 0,
                    published_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )
            `;
            try {
                await db.query(createShortsSql);
            } catch (errShorts) {
                try {
                    await db.query(`
                        CREATE TABLE IF NOT EXISTS noticias_shorts (
                            id SERIAL PRIMARY KEY,
                            title VARCHAR(255) NOT NULL,
                            category VARCHAR(100) DEFAULT 'Actualidad',
                            video_url VARCHAR(500) DEFAULT NULL,
                            youtube_short_url VARCHAR(500) DEFAULT NULL,
                            youtube_url VARCHAR(500) DEFAULT NULL,
                            thumbnail_url VARCHAR(500) DEFAULT NULL,
                            description TEXT DEFAULT NULL,
                            source_name VARCHAR(150) DEFAULT NULL,
                            is_highlight BOOLEAN DEFAULT FALSE,
                            is_published BOOLEAN DEFAULT TRUE,
                            views_count INT DEFAULT 0,
                            published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                        )
                    `);
                } catch (e) {}
            }

            const shortsCols = [
                { name: 'category', type: "VARCHAR(100) DEFAULT 'Actualidad'" },
                { name: 'video_url', type: 'VARCHAR(500) DEFAULT NULL' },
                { name: 'youtube_short_url', type: 'VARCHAR(500) DEFAULT NULL' },
                { name: 'youtube_url', type: 'VARCHAR(500) DEFAULT NULL' },
                { name: 'thumbnail_url', type: 'VARCHAR(500) DEFAULT NULL' },
                { name: 'description', type: 'TEXT DEFAULT NULL' },
                { name: 'source_name', type: "VARCHAR(150) DEFAULT 'Hablemos de YHWH'" },
                { name: 'is_highlight', type: 'BOOLEAN DEFAULT FALSE' },
                { name: 'is_published', type: 'BOOLEAN DEFAULT TRUE' },
                { name: 'views_count', type: 'INT DEFAULT 0' },
                { name: 'published_at', type: 'DATETIME DEFAULT CURRENT_TIMESTAMP' }
            ];

            for (const col of shortsCols) {
                try {
                    const [exists] = await db.query(`SHOW COLUMNS FROM noticias_shorts LIKE '${col.name}'`);
                    if (!exists || exists.length === 0) {
                        await db.query(`ALTER TABLE noticias_shorts ADD COLUMN ${col.name} ${col.type}`);
                    }
                } catch (errCol) {
                    try {
                        await db.query(`ALTER TABLE noticias_shorts ADD COLUMN IF NOT EXISTS ${col.name} ${col.type.replace('DATETIME', 'TIMESTAMP')}`);
                    } catch (e) {}
                }
            }

            // 3. Tabla de Configuración de Sección Home Noticias
            const createHomeSectionSql = `
                CREATE TABLE IF NOT EXISTS home_section_noticias (
                    id INT PRIMARY KEY,
                    title VARCHAR(255) DEFAULT 'Noticias & Acontecimientos Mundiales',
                    subtitle TEXT,
                    content TEXT,
                    image_url VARCHAR(500),
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `;
            try {
                await db.query(createHomeSectionSql);
                const [sectionRows] = await db.query('SELECT COUNT(*) as total FROM home_section_noticias');
                if (sectionRows && sectionRows[0] && sectionRows[0].total == 0) {
                    await db.query(`
                        INSERT INTO home_section_noticias (id, title, subtitle, content)
                        VALUES (1, 'Noticias & Acontecimientos', 'Acontecimientos mundiales, cápsulas en video y actualidad bajo la perspectiva bíblica', 'Mantente informado con noticias breves de impacto global y reflexiones oportunas.')
                    `);
                }
            } catch (e) {}

        } catch (e) {
            console.warn('Aviso en Noticia.ensureTable:', e.message);
        }
    }

    // ==================== NOTICIAS ====================
    static async getAll() {
        await Noticia.ensureTable();
        const [rows] = await db.query('SELECT * FROM noticias ORDER BY published_at DESC, id DESC');
        return rows || [];
    }

    static async getLatest(limit = 4) {
        await Noticia.ensureTable();
        const [rows] = await db.query(
            'SELECT * FROM noticias WHERE is_published = TRUE ORDER BY is_breaking DESC, published_at DESC, id DESC LIMIT ?',
            [limit]
        );
        return rows || [];
    }

    static async getPublished({ category = null, search = null, limit = 12, offset = 0 } = {}) {
        await Noticia.ensureTable();
        let sql = 'SELECT * FROM noticias WHERE is_published = TRUE';
        const params = [];

        if (category && category.trim() !== '' && category !== 'all') {
            sql += ' AND category = ?';
            params.push(category.trim());
        }

        if (search && search.trim() !== '') {
            sql += ' AND (title LIKE ? OR summary LIKE ? OR content LIKE ? OR tags LIKE ?)';
            const term = `%${search.trim()}%`;
            params.push(term, term, term, term);
        }

        sql += ' ORDER BY is_breaking DESC, published_at DESC, id DESC LIMIT ? OFFSET ?';
        params.push(limit, offset);

        const [rows] = await db.query(sql, params);
        return rows || [];
    }

    static async countPublished({ category = null, search = null } = {}) {
        await Noticia.ensureTable();
        let sql = 'SELECT COUNT(*) as total FROM noticias WHERE is_published = TRUE';
        const params = [];

        if (category && category.trim() !== '' && category !== 'all') {
            sql += ' AND category = ?';
            params.push(category.trim());
        }

        if (search && search.trim() !== '') {
            sql += ' AND (title LIKE ? OR summary LIKE ? OR content LIKE ? OR tags LIKE ?)';
            const term = `%${search.trim()}%`;
            params.push(term, term, term, term);
        }

        const [rows] = await db.query(sql, params);
        return rows && rows[0] ? parseInt(rows[0].total) : 0;
    }

    static async getById(id) {
        await Noticia.ensureTable();
        const [rows] = await db.query('SELECT * FROM noticias WHERE id = ?', [id]);
        return rows && rows[0] ? rows[0] : null;
    }

    static async getBySlug(slug) {
        await Noticia.ensureTable();
        const [rows] = await db.query('SELECT * FROM noticias WHERE slug = ?', [slug]);
        return rows && rows[0] ? rows[0] : null;
    }

    static async getRelated(id, category, limit = 3) {
        await Noticia.ensureTable();
        const [rows] = await db.query(
            'SELECT * FROM noticias WHERE is_published = TRUE AND id != ? AND (category = ? OR 1=1) ORDER BY (category = ?) DESC, published_at DESC LIMIT ?',
            [id, category, category, limit]
        );
        return rows || [];
    }

    static async getCategories() {
        await Noticia.ensureTable();
        const [rows] = await db.query(
            'SELECT category, COUNT(*) as count FROM noticias WHERE is_published = TRUE GROUP BY category ORDER BY count DESC'
        );
        return rows || [];
    }

    static async create(data) {
        await Noticia.ensureTable();
        const { title, subtitle, category, author, summary, content, image_url, source_url, tags, is_breaking, is_published, published_at } = data;
        const slug = Noticia.generateSlug(title);

        const sql = `
            INSERT INTO noticias 
            (title, slug, subtitle, category, author, summary, content, image_url, source_url, tags, is_breaking, is_published, published_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const pubDate = published_at ? new Date(published_at) : new Date();

        const [result] = await db.query(sql, [
            title || 'Sin título',
            slug,
            subtitle || '',
            category || 'Mundial',
            author || 'Redacción YHWH',
            summary || '',
            content || '',
            image_url || '',
            source_url || '',
            tags || '',
            Boolean(is_breaking),
            Boolean(is_published !== undefined ? is_published : true),
            pubDate
        ]);

        return result;
    }

    static async update(id, data) {
        await Noticia.ensureTable();
        const { title, subtitle, category, author, summary, content, image_url, source_url, tags, is_breaking, is_published, published_at } = data;
        const slug = Noticia.generateSlug(title);
        const pubDate = published_at ? new Date(published_at) : new Date();

        const sql = `
            UPDATE noticias 
            SET title = ?, slug = ?, subtitle = ?, category = ?, author = ?, summary = ?, content = ?, image_url = ?, source_url = ?, tags = ?, is_breaking = ?, is_published = ?, published_at = ? 
            WHERE id = ?
        `;

        return await db.query(sql, [
            title || 'Sin título',
            slug,
            subtitle || '',
            category || 'Mundial',
            author || 'Redacción YHWH',
            summary || '',
            content || '',
            image_url || '',
            source_url || '',
            tags || '',
            Boolean(is_breaking),
            Boolean(is_published !== undefined ? is_published : true),
            pubDate,
            id
        ]);
    }

    static async incrementViews(id) {
        await Noticia.ensureTable();
        return await db.query('UPDATE noticias SET views = COALESCE(views, 0) + 1 WHERE id = ?', [id]);
    }

    static async delete(id) {
        await Noticia.ensureTable();
        return await db.query('DELETE FROM noticias WHERE id = ?', [id]);
    }

    // ==================== SHORTS DE NOTICIAS ====================
    static async getAllShorts() {
        await Noticia.ensureTable();
        const [rows] = await db.query('SELECT * FROM noticias_shorts ORDER BY id DESC');
        return rows || [];
    }

    static async getPublishedShorts(limit = 8) {
        await Noticia.ensureTable();
        const [rows] = await db.query(
            'SELECT * FROM noticias_shorts WHERE is_published = TRUE ORDER BY is_highlight DESC, published_at DESC, id DESC LIMIT ?',
            [limit]
        );
        return rows || [];
    }

    static async getShortById(id) {
        await Noticia.ensureTable();
        const [rows] = await db.query('SELECT * FROM noticias_shorts WHERE id = ?', [id]);
        return rows && rows[0] ? rows[0] : null;
    }

    static async createShort(data) {
        await Noticia.ensureTable();
        const { title, category, video_url, youtube_short_url, youtube_url, thumbnail_url, description, source_name, is_highlight, is_published, published_at } = data;
        const pubDate = published_at ? new Date(published_at) : new Date();

        const sql = `
            INSERT INTO noticias_shorts
            (title, category, video_url, youtube_short_url, youtube_url, thumbnail_url, description, source_name, is_highlight, is_published, published_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const [result] = await db.query(sql, [
            title || 'Sin título',
            category || 'Actualidad',
            video_url || null,
            youtube_short_url || null,
            youtube_url || null,
            thumbnail_url || null,
            description || null,
            source_name || 'Hablemos de YHWH',
            Boolean(is_highlight),
            Boolean(is_published !== undefined ? is_published : true),
            pubDate
        ]);

        return result;
    }

    static async updateShort(id, data) {
        await Noticia.ensureTable();
        const { title, category, video_url, youtube_short_url, youtube_url, thumbnail_url, description, source_name, is_highlight, is_published, published_at } = data;
        const pubDate = published_at ? new Date(published_at) : new Date();

        const sql = `
            UPDATE noticias_shorts
            SET title = ?, category = ?, video_url = ?, youtube_short_url = ?, youtube_url = ?, thumbnail_url = ?, description = ?, source_name = ?, is_highlight = ?, is_published = ?, published_at = ?
            WHERE id = ?
        `;

        return await db.query(sql, [
            title || 'Sin título',
            category || 'Actualidad',
            video_url || null,
            youtube_short_url || null,
            youtube_url || null,
            thumbnail_url || null,
            description || null,
            source_name || 'Hablemos de YHWH',
            Boolean(is_highlight),
            Boolean(is_published !== undefined ? is_published : true),
            pubDate,
            id
        ]);
    }

    static async incrementShortViews(id) {
        await Noticia.ensureTable();
        return await db.query('UPDATE noticias_shorts SET views_count = COALESCE(views_count, 0) + 1 WHERE id = ?', [id]);
    }

    static async deleteShort(id) {
        await Noticia.ensureTable();
        return await db.query('DELETE FROM noticias_shorts WHERE id = ?', [id]);
    }

    // Helper para slug
    static generateSlug(text) {
        if (!text) return 'noticia-' + Date.now();
        return text
            .toString()
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
            + '-' + Math.floor(100 + Math.random() * 900);
    }
}

module.exports = Noticia;
