const db = require('../config/db');

class Ensenanza {
    static async ensureAuthorsColumn() {
        try {
            const [cols] = await db.query("SHOW COLUMNS FROM ensenanzas LIKE 'authors'");
            if (!cols || cols.length === 0) {
                await db.query("ALTER TABLE ensenanzas ADD COLUMN authors LONGTEXT DEFAULT NULL AFTER author_img");
                console.log('✅ Columna authors agregada a ensenanzas');
            }
        } catch (e) {
            try {
                await db.query("ALTER TABLE ensenanzas ADD COLUMN IF NOT EXISTS authors TEXT DEFAULT NULL");
            } catch (errPG) {}
        }
    }

    static normalize(row) {
        if (!row) return null;
        let authorsList = [];

        if (row.authors) {
            try {
                const parsed = typeof row.authors === 'string' ? JSON.parse(row.authors) : row.authors;
                if (Array.isArray(parsed) && parsed.length > 0) {
                    authorsList = parsed.filter(a => a && (a.name || a.nombre)).map(a => ({
                        name: (a.name || a.nombre || '').trim(),
                        role: (a.role || a.rol || 'Moréh').trim(),
                        img: (a.img || a.foto || a.image_url || '/assets/img/team/kaleb.jpg').trim()
                    }));
                }
            } catch (e) {
                // If parsing fails, fall back to author field
            }
        }

        if (authorsList.length === 0) {
            authorsList = [{
                name: row.author || 'Moréh Kalev Aquerman',
                role: row.author_role || 'Moreh מורה',
                img: row.author_img || '/assets/img/team/kaleb.jpg'
            }];
        }

        row.authors_list = authorsList;
        
        if (authorsList.length === 1) {
            row.authors_display = authorsList[0].name;
        } else if (authorsList.length === 2) {
            row.authors_display = `${authorsList[0].name} y ${authorsList[1].name}`;
        } else {
            const last = authorsList[authorsList.length - 1].name;
            const rest = authorsList.slice(0, -1).map(a => a.name).join(', ');
            row.authors_display = `${rest} y ${last}`;
        }

        // Primary author fallback for legacy template usage
        if (!row.author && authorsList.length > 0) {
            row.author = authorsList[0].name;
        }
        if (!row.author_role && authorsList.length > 0) {
            row.author_role = authorsList[0].role;
        }
        if (!row.author_img && authorsList.length > 0) {
            row.author_img = authorsList[0].img;
        }

        return row;
    }

    static async getAll() {
        await Ensenanza.ensureAuthorsColumn();
        const [rows] = await db.query('SELECT * FROM ensenanzas ORDER BY COALESCE(teaching_date, DATE(created_at)) DESC, id DESC');
        return (rows || []).map(r => Ensenanza.normalize(r));
    }

    static async getLatest(limit = 4) {
        await Ensenanza.ensureAuthorsColumn();
        const [rows] = await db.query('SELECT * FROM ensenanzas WHERE is_published = TRUE ORDER BY COALESCE(teaching_date, DATE(created_at)) DESC, id DESC LIMIT ?', [limit]);
        return (rows || []).map(r => Ensenanza.normalize(r));
    }

    static async getPublished() {
        await Ensenanza.ensureAuthorsColumn();
        const [rows] = await db.query('SELECT * FROM ensenanzas WHERE is_published = TRUE ORDER BY COALESCE(teaching_date, DATE(created_at)) DESC, id DESC');
        return (rows || []).map(r => Ensenanza.normalize(r));
    }

    static async create(data) {
        await Ensenanza.ensureAuthorsColumn();
        const { title, subtitle, teaching_date, description, content, image_url, youtube_link, author, author_role, author_img, authors, is_published } = data;
        const finalDate = teaching_date && teaching_date.trim() !== '' ? teaching_date : new Date().toISOString().split('T')[0];

        let authorsList = [];
        if (authors) {
            try {
                authorsList = typeof authors === 'string' ? JSON.parse(authors) : authors;
                if (!Array.isArray(authorsList)) authorsList = [];
            } catch(e) {
                authorsList = [];
            }
        }

        if (authorsList.length === 0 && (author || author_role || author_img)) {
            authorsList = [{
                name: author || 'Moréh Kalev Aquerman',
                role: author_role || 'Moreh מורה',
                img: author_img || '/assets/img/team/kaleb.jpg'
            }];
        }

        const primaryAuthor = authorsList.length > 0 ? authorsList[0].name : (author || 'Moréh Kalev Aquerman');
        const primaryRole = authorsList.length > 0 ? authorsList[0].role : (author_role || 'Moreh מורה');
        const primaryImg = authorsList.length > 0 ? authorsList[0].img : (author_img || '/assets/img/team/kaleb.jpg');
        const authorsJson = JSON.stringify(authorsList);

        try {
            return await db.query(
                `INSERT INTO ensenanzas (title, subtitle, teaching_date, description, content, image_url, youtube_link, author, author_role, author_img, authors, is_published) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    title,
                    subtitle || '',
                    finalDate,
                    description || '',
                    content || '',
                    image_url || '',
                    youtube_link || '',
                    primaryAuthor,
                    primaryRole,
                    primaryImg,
                    authorsJson,
                    is_published !== undefined ? is_published : true
                ]
            );
        } catch (err) {
            // Fallback if authors column not present yet
            return await db.query(
                `INSERT INTO ensenanzas (title, subtitle, teaching_date, description, content, image_url, youtube_link, author, author_role, author_img, is_published) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    title,
                    subtitle || '',
                    finalDate,
                    description || '',
                    content || '',
                    image_url || '',
                    youtube_link || '',
                    primaryAuthor,
                    primaryRole,
                    primaryImg,
                    is_published !== undefined ? is_published : true
                ]
            );
        }
    }

    static async update(id, data) {
        await Ensenanza.ensureAuthorsColumn();
        const { title, subtitle, teaching_date, description, content, image_url, youtube_link, author, author_role, author_img, authors, is_published } = data;
        const finalDate = teaching_date && teaching_date.trim() !== '' ? teaching_date : new Date().toISOString().split('T')[0];

        let authorsList = [];
        if (authors) {
            try {
                authorsList = typeof authors === 'string' ? JSON.parse(authors) : authors;
                if (!Array.isArray(authorsList)) authorsList = [];
            } catch(e) {
                authorsList = [];
            }
        }

        if (authorsList.length === 0 && (author || author_role || author_img)) {
            authorsList = [{
                name: author || 'Moréh Kalev Aquerman',
                role: author_role || 'Moreh מורה',
                img: author_img || '/assets/img/team/kaleb.jpg'
            }];
        }

        const primaryAuthor = authorsList.length > 0 ? authorsList[0].name : (author || 'Moréh Kalev Aquerman');
        const primaryRole = authorsList.length > 0 ? authorsList[0].role : (author_role || 'Moreh מורה');
        const primaryImg = authorsList.length > 0 ? authorsList[0].img : (author_img || '/assets/img/team/kaleb.jpg');
        const authorsJson = JSON.stringify(authorsList);

        try {
            return await db.query(
                `UPDATE ensenanzas SET 
                    title = ?, 
                    subtitle = ?, 
                    teaching_date = ?, 
                    description = ?, 
                    content = ?, 
                    image_url = ?, 
                    youtube_link = ?, 
                    author = ?, 
                    author_role = ?, 
                    author_img = ?, 
                    authors = ?, 
                    is_published = ? 
                 WHERE id = ?`,
                [
                    title,
                    subtitle || '',
                    finalDate,
                    description || '',
                    content || '',
                    image_url || '',
                    youtube_link || '',
                    primaryAuthor,
                    primaryRole,
                    primaryImg,
                    authorsJson,
                    is_published !== undefined ? is_published : true,
                    id
                ]
            );
        } catch (err) {
            // Fallback if authors column update fails
            return await db.query(
                `UPDATE ensenanzas SET 
                    title = ?, 
                    subtitle = ?, 
                    teaching_date = ?, 
                    description = ?, 
                    content = ?, 
                    image_url = ?, 
                    youtube_link = ?, 
                    author = ?, 
                    author_role = ?, 
                    author_img = ?, 
                    is_published = ? 
                 WHERE id = ?`,
                [
                    title,
                    subtitle || '',
                    finalDate,
                    description || '',
                    content || '',
                    image_url || '',
                    youtube_link || '',
                    primaryAuthor,
                    primaryRole,
                    primaryImg,
                    is_published !== undefined ? is_published : true,
                    id
                ]
            );
        }
    }

    static async getById(id) {
        await Ensenanza.ensureAuthorsColumn();
        const [rows] = await db.query('SELECT * FROM ensenanzas WHERE id = ?', [id]);
        return rows && rows[0] ? Ensenanza.normalize(rows[0]) : null;
    }

    static async delete(id) {
        return await db.query('DELETE FROM ensenanzas WHERE id = ?', [id]);
    }

    static async count() {
        const [rows] = await db.query('SELECT COUNT(*) as total FROM ensenanzas');
        return rows[0] ? rows[0].total : 0;
    }

    static async incrementViews(id) {
        try {
            await db.query('UPDATE ensenanzas SET views = views + 1 WHERE id = ?', [id]);
        } catch (e) {
            console.warn('Aviso incrementViews ensenanzas:', e.message);
        }
    }
}

module.exports = Ensenanza;
