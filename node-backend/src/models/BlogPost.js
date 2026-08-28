const db = require('../config/db');

class BlogPost {
    // Obtener todos los artículos (para admin)
    static async getAll() {
        const [rows] = await db.query('SELECT * FROM blog_posts ORDER BY id DESC');
        return rows;
    }

    // Obtener últimos artículos publicados (para home u otras secciones)
    static async getLatest(limit = 3) {
        const [rows] = await db.query(
            'SELECT * FROM blog_posts WHERE is_published = TRUE ORDER BY published_at DESC, id DESC LIMIT ?',
            [limit]
        );
        return rows;
    }

    // Obtener artículos publicados con filtros opcionales (para catálogo)
    static async getPublished({ category = null, search = null, limit = 12, offset = 0 } = {}) {
        let sql = 'SELECT * FROM blog_posts WHERE is_published = TRUE';
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

        sql += ' ORDER BY published_at DESC, id DESC LIMIT ? OFFSET ?';
        params.push(limit, offset);

        const [rows] = await db.query(sql, params);
        return rows;
    }

    // Contar artículos para paginación o métricas
    static async countPublished({ category = null, search = null } = {}) {
        let sql = 'SELECT COUNT(*) as total FROM blog_posts WHERE is_published = TRUE';
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
        return rows[0] ? rows[0].total : 0;
    }

    // Obtener por ID
    static async getById(id) {
        const [rows] = await db.query('SELECT * FROM blog_posts WHERE id = ?', [id]);
        return rows[0] || null;
    }

    // Obtener por Slug
    static async getBySlug(slug) {
        const [rows] = await db.query('SELECT * FROM blog_posts WHERE slug = ?', [slug]);
        return rows[0] || null;
    }

    // Obtener artículos relacionados (misma categoría o recientes)
    static async getRelated(id, category, limit = 3) {
        const [rows] = await db.query(
            'SELECT * FROM blog_posts WHERE is_published = TRUE AND id != ? AND (category = ? OR 1=1) ORDER BY (category = ?) DESC, id DESC LIMIT ?',
            [id, category, category, limit]
        );
        return rows;
    }

    // Obtener todas las categorías únicas
    static async getCategories() {
        const [rows] = await db.query(
            'SELECT category, COUNT(*) as count FROM blog_posts WHERE is_published = TRUE GROUP BY category ORDER BY count DESC'
        );
        return rows;
    }

    // Crear artículo
    static async create(data) {
        const { title, subtitle, category, author, summary, content, image_url, tags, is_published, published_at } = data;
        const slug = BlogPost.generateSlug(title);

        const sql = `
            INSERT INTO blog_posts 
            (title, slug, subtitle, category, author, summary, content, image_url, tags, is_published, published_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const [result] = await db.query(sql, [
            title,
            slug,
            subtitle || '',
            category || 'Reflexiones',
            author || 'Hablemos de YHWH',
            summary || '',
            content || '',
            image_url || '',
            tags || '',
            is_published !== undefined ? is_published : true,
            published_at || new Date()
        ]);

        return result;
    }

    // Actualizar artículo
    static async update(id, data) {
        const { title, subtitle, category, author, summary, content, image_url, tags, is_published, published_at } = data;
        const slug = BlogPost.generateSlug(title);

        const sql = `
            UPDATE blog_posts 
            SET title = ?, slug = ?, subtitle = ?, category = ?, author = ?, summary = ?, content = ?, image_url = ?, tags = ?, is_published = ?, published_at = ? 
            WHERE id = ?
        `;

        return await db.query(sql, [
            title,
            slug,
            subtitle || '',
            category || 'Reflexiones',
            author || 'Hablemos de YHWH',
            summary || '',
            content || '',
            image_url || '',
            tags || '',
            is_published !== undefined ? is_published : true,
            published_at || new Date(),
            id
        ]);
    }

    // Incrementar contador de visitas
    static async incrementViews(id) {
        return await db.query('UPDATE blog_posts SET views = views + 1 WHERE id = ?', [id]);
    }

    // Eliminar artículo
    static async delete(id) {
        return await db.query('DELETE FROM blog_posts WHERE id = ?', [id]);
    }

    // Total de artículos
    static async count() {
        const [rows] = await db.query('SELECT COUNT(*) as total FROM blog_posts');
        return rows[0] ? rows[0].total : 0;
    }

    // Generador de slug amigable para URLs
    static generateSlug(text) {
        if (!text) return 'post-' + Date.now();
        return text
            .toString()
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
            .replace(/[^a-z0-9]+/g, '-')     // Reemplazar caracteres especiales por guión
            .replace(/^-+|-+$/g, '')         // Quitar guiones al inicio y fin
            + '-' + Math.floor(100 + Math.random() * 900); // Sufijo para garantizar unicidad
    }
}

module.exports = BlogPost;
