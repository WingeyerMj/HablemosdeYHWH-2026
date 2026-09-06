const db = require('../config/db');

class SemillasArticulo {
    static async ensureTable() {
        try {
            const createTableSql = `
                CREATE TABLE IF NOT EXISTS semillas_articulos (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    title VARCHAR(255) NOT NULL,
                    parasha_name VARCHAR(255) DEFAULT NULL,
                    category VARCHAR(100) DEFAULT 'Resumen Semanal de Parashá',
                    biblical_reference VARCHAR(255) DEFAULT NULL,
                    key_verse VARCHAR(255) DEFAULT NULL,
                    summary TEXT DEFAULT NULL,
                    content LONGTEXT DEFAULT NULL,
                    main_image VARCHAR(500) DEFAULT NULL,
                    gallery_images LONGTEXT DEFAULT NULL,
                    pdf_file VARCHAR(500) DEFAULT NULL,
                    author VARCHAR(255) DEFAULT 'Elva Avila',
                    tags VARCHAR(500) DEFAULT NULL,
                    is_published BOOLEAN DEFAULT TRUE,
                    views_count INT DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )
            `;
            await db.query(createTableSql);

            // Verificar si faltan columnas en instalaciones previas
            const columnsToAdd = [
                { name: 'parasha_name', type: 'VARCHAR(255) DEFAULT NULL' },
                { name: 'category', type: "VARCHAR(100) DEFAULT 'Resumen Semanal de Parashá'" },
                { name: 'biblical_reference', type: 'VARCHAR(255) DEFAULT NULL' },
                { name: 'key_verse', type: 'VARCHAR(255) DEFAULT NULL' },
                { name: 'summary', type: 'TEXT DEFAULT NULL' },
                { name: 'content', type: 'LONGTEXT DEFAULT NULL' },
                { name: 'main_image', type: 'VARCHAR(500) DEFAULT NULL' },
                { name: 'gallery_images', type: 'LONGTEXT DEFAULT NULL' },
                { name: 'pdf_file', type: 'VARCHAR(500) DEFAULT NULL' },
                { name: 'author', type: "VARCHAR(255) DEFAULT 'Elva Avila'" },
                { name: 'tags', type: 'VARCHAR(500) DEFAULT NULL' },
                { name: 'is_published', type: 'BOOLEAN DEFAULT TRUE' },
                { name: 'views_count', type: 'INT DEFAULT 0' }
            ];

            for (const col of columnsToAdd) {
                try {
                    const [exists] = await db.query(`SHOW COLUMNS FROM semillas_articulos LIKE '${col.name}'`);
                    if (!exists || exists.length === 0) {
                        await db.query(`ALTER TABLE semillas_articulos ADD COLUMN ${col.name} ${col.type}`);
                    }
                } catch (errCol) {
                    try {
                        await db.query(`ALTER TABLE semillas_articulos ADD COLUMN IF NOT EXISTS ${col.name} ${col.type}`);
                    } catch (e) {}
                }
            }
        } catch (e) {
            console.warn('Aviso en SemillasArticulo.ensureTable:', e.message);
        }
    }

    static async getAll() {
        try {
            await SemillasArticulo.ensureTable();
            const [rows] = await db.query('SELECT * FROM semillas_articulos ORDER BY id DESC');
            return rows || [];
        } catch (e) {
            console.warn('Aviso en SemillasArticulo.getAll:', e.message);
            return [];
        }
    }

    static async getPublished() {
        try {
            await SemillasArticulo.ensureTable();
            const [rows] = await db.query('SELECT * FROM semillas_articulos WHERE is_published = 1 OR is_published = TRUE OR is_published IS NULL ORDER BY id DESC');
            return rows || [];
        } catch (e) {
            console.warn('Aviso en SemillasArticulo.getPublished:', e.message);
            return [];
        }
    }

    static async getLatest(limit = 6) {
        try {
            await SemillasArticulo.ensureTable();
            const [rows] = await db.query('SELECT * FROM semillas_articulos WHERE is_published = TRUE ORDER BY id DESC LIMIT ?', [limit]);
            return rows || [];
        } catch (e) {
            console.warn('Aviso en SemillasArticulo.getLatest:', e.message);
            return [];
        }
    }

    static async getById(id) {
        try {
            await SemillasArticulo.ensureTable();
            const [rows] = await db.query('SELECT * FROM semillas_articulos WHERE id = ?', [id]);
            return rows[0] || null;
        } catch (e) {
            console.warn('Aviso en SemillasArticulo.getById:', e.message);
            return null;
        }
    }

    static async create(data) {
        await SemillasArticulo.ensureTable();
        let {
            title,
            parasha_name,
            category,
            biblical_reference,
            key_verse,
            summary,
            content,
            main_image,
            gallery_images,
            pdf_file,
            author,
            tags,
            is_published
        } = data;

        let galleryJson = '';
        if (Array.isArray(gallery_images)) {
            galleryJson = JSON.stringify(gallery_images.filter(img => img && img.trim() !== ''));
        } else if (typeof gallery_images === 'string') {
            galleryJson = gallery_images;
        }

        return await db.query(
            `INSERT INTO semillas_articulos 
             (title, parasha_name, category, biblical_reference, key_verse, summary, content, main_image, gallery_images, pdf_file, author, tags, is_published) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                title,
                parasha_name || '',
                category || 'Resumen Semanal de Parashá',
                biblical_reference || '',
                key_verse || '',
                summary || '',
                content || '',
                main_image || '',
                galleryJson || '[]',
                pdf_file || '',
                author || 'Elva Avila',
                tags || '',
                is_published !== undefined ? (is_published ? 1 : 0) : 1
            ]
        );
    }

    static async update(id, data) {
        await SemillasArticulo.ensureTable();
        let {
            title,
            parasha_name,
            category,
            biblical_reference,
            key_verse,
            summary,
            content,
            main_image,
            gallery_images,
            pdf_file,
            author,
            tags,
            is_published
        } = data;

        let galleryJson = '';
        if (Array.isArray(gallery_images)) {
            galleryJson = JSON.stringify(gallery_images.filter(img => img && img.trim() !== ''));
        } else if (typeof gallery_images === 'string') {
            galleryJson = gallery_images;
        }

        return await db.query(
            `UPDATE semillas_articulos 
             SET title = ?, parasha_name = ?, category = ?, biblical_reference = ?, key_verse = ?, summary = ?, content = ?, main_image = ?, gallery_images = ?, pdf_file = ?, author = ?, tags = ?, is_published = ? 
             WHERE id = ?`,
            [
                title,
                parasha_name || '',
                category || 'Resumen Semanal de Parashá',
                biblical_reference || '',
                key_verse || '',
                summary || '',
                content || '',
                main_image || '',
                galleryJson || '[]',
                pdf_file || '',
                author || 'Elva Avila',
                tags || '',
                is_published !== undefined ? (is_published ? 1 : 0) : 1,
                id
            ]
        );
    }

    static async delete(id) {
        await SemillasArticulo.ensureTable();
        return await db.query('DELETE FROM semillas_articulos WHERE id = ?', [id]);
    }

    static async incrementViews(id) {
        try {
            await SemillasArticulo.ensureTable();
            await db.query('UPDATE semillas_articulos SET views_count = views_count + 1 WHERE id = ?', [id]);
        } catch (e) {
            console.warn('Aviso en SemillasArticulo.incrementViews:', e.message);
        }
    }

    static async getCategories() {
        try {
            await SemillasArticulo.ensureTable();
            const [rows] = await db.query('SELECT DISTINCT category FROM semillas_articulos WHERE category IS NOT NULL AND category != "" AND is_published = TRUE');
            return rows.map(r => r.category);
        } catch (e) {
            return [];
        }
    }
}

module.exports = SemillasArticulo;
