const db = require('../config/db');
const path = require('path');
const fs = require('fs');

class Haftara {
    static async ensureColumns() {
        try {
            const [colsAuthors] = await db.query("SHOW COLUMNS FROM haftarot LIKE 'authors'");
            if (!colsAuthors || colsAuthors.length === 0) {
                await db.query("ALTER TABLE haftarot ADD COLUMN authors LONGTEXT DEFAULT NULL AFTER author_img");
                console.log('✅ Columna authors agregada a haftarot');
            }
        } catch (e) {
            try {
                await db.query("ALTER TABLE haftarot ADD COLUMN IF NOT EXISTS authors TEXT DEFAULT NULL");
            } catch (errPG) {}
        }

        try {
            const [colsParasha] = await db.query("SHOW COLUMNS FROM haftarot LIKE 'parasha_id'");
            if (!colsParasha || colsParasha.length === 0) {
                await db.query("ALTER TABLE haftarot ADD COLUMN parasha_id INT DEFAULT NULL AFTER id");
                console.log('✅ Columna parasha_id agregada a haftarot');
            }
        } catch (e) {
            try {
                await db.query("ALTER TABLE haftarot ADD COLUMN IF NOT EXISTS parasha_id INT DEFAULT NULL");
            } catch (errPG) {}
        }

        // Auto-link Haftarot to Parashot if unlinked
        await Haftara.autoLinkParashot();
    }

    static async autoLinkParashot() {
        try {
            await db.query(`
                UPDATE haftarot h
                JOIN parashot p ON (
                    h.parasha_id IS NULL AND (
                        h.title LIKE CONCAT('%', p.title, '%')
                        OR h.parasha_reference LIKE CONCAT('%', p.title, '%')
                        OR (h.subtitle IS NOT NULL AND h.subtitle != '' AND (h.subtitle LIKE CONCAT('%', p.title, '%') OR p.subtitle LIKE CONCAT('%', h.subtitle, '%')))
                    )
                )
                SET h.parasha_id = p.id
                WHERE h.parasha_id IS NULL
            `);
        } catch(e) {}
    }

    static extractYoutubeId(url) {
        if (!url || typeof url !== 'string') return '';
        const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|live\/|shorts\/))([\w-]{11})/);
        if (match && match[1]) return match[1];
        if (url.includes('watch?v=')) {
            return url.split('watch?v=')[1].split('&')[0];
        } else if (url.includes('youtu.be/')) {
            return url.split('youtu.be/')[1].split('?')[0];
        } else if (url.includes('embed/')) {
            return url.split('embed/')[1].split('?')[0];
        }
        return '';
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
                // Fallback to author field
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

        if (!row.author && authorsList.length > 0) {
            row.author = authorsList[0].name;
        }
        if (!row.author_role && authorsList.length > 0) {
            row.author_role = authorsList[0].role;
        }
        if (!row.author_img && authorsList.length > 0) {
            row.author_img = authorsList[0].img;
        }

        // Parasha Link normalization
        if (!row.parasha_id && row.matched_parasha_id) {
            row.parasha_id = row.matched_parasha_id;
        }

        // YouTube Thumbnail helper
        const ytId = Haftara.extractYoutubeId(row.youtube_link);
        row.youtube_id = ytId;
        row.youtube_thumbnail = ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : '';

        // Smart Display image helper
        let chosenImg = '';
        if (row.image_url && row.image_url.trim() !== '') {
            const cleanImg = row.image_url.trim();
            if (cleanImg.startsWith('http://') || cleanImg.startsWith('https://')) {
                chosenImg = cleanImg;
            } else {
                // Check if local file exists on disk
                const relPath = cleanImg.startsWith('/') ? cleanImg.slice(1) : cleanImg;
                const p1 = path.join(__dirname, '../../public', relPath);
                const p2 = path.join(__dirname, '../../../public', relPath);
                const p3 = path.join(process.cwd(), 'public', relPath);
                const p4 = path.join(process.cwd(), relPath);
                if (fs.existsSync(p1) || fs.existsSync(p2) || fs.existsSync(p3) || fs.existsSync(p4)) {
                    chosenImg = cleanImg.startsWith('/') ? cleanImg : '/' + cleanImg;
                } else if (row.youtube_thumbnail) {
                    chosenImg = row.youtube_thumbnail;
                } else if (row.parasha_image_url) {
                    chosenImg = row.parasha_image_url;
                } else {
                    chosenImg = cleanImg.startsWith('/') ? cleanImg : '/' + cleanImg;
                }
            }
        } else if (row.youtube_thumbnail) {
            chosenImg = row.youtube_thumbnail;
        } else if (row.parasha_image_url) {
            chosenImg = row.parasha_image_url;
        }
        row.display_image = chosenImg;

        return row;
    }

    static async getAll() {
        await Haftara.ensureColumns();
        const [rows] = await db.query(`
            SELECT h.*, 
                   COALESCE(p.id, p_match.id) AS matched_parasha_id,
                   COALESCE(p.title, p_match.title) AS parasha_title, 
                   COALESCE(p.subtitle, p_match.subtitle) AS parasha_subtitle, 
                   COALESCE(p.parasha_number, p_match.parasha_number) AS parasha_number,
                   COALESCE(p.image_url, p_match.image_url) AS parasha_image_url
            FROM haftarot h
            LEFT JOIN parashot p ON h.parasha_id = p.id
            LEFT JOIN parashot p_match ON (
                h.parasha_id IS NULL AND (
                    h.title LIKE CONCAT('%', p_match.title, '%')
                    OR h.parasha_reference LIKE CONCAT('%', p_match.title, '%')
                    OR p_match.title LIKE CONCAT('%', REPLACE(REPLACE(h.title, 'Haftará', ''), 'Parashá', ''), '%')
                )
            )
            ORDER BY COALESCE(p.parasha_number, p_match.parasha_number, 0) DESC, h.id DESC
        `);
        return (rows || []).map(r => Haftara.normalize(r));
    }

    static async getLatest(limit = 4) {
        await Haftara.ensureColumns();
        const [rows] = await db.query(`
            SELECT h.*, 
                   COALESCE(p.id, p_match.id) AS matched_parasha_id,
                   COALESCE(p.title, p_match.title) AS parasha_title, 
                   COALESCE(p.subtitle, p_match.subtitle) AS parasha_subtitle, 
                   COALESCE(p.parasha_number, p_match.parasha_number) AS parasha_number,
                   COALESCE(p.image_url, p_match.image_url) AS parasha_image_url
            FROM haftarot h
            LEFT JOIN parashot p ON h.parasha_id = p.id
            LEFT JOIN parashot p_match ON (
                h.parasha_id IS NULL AND (
                    h.title LIKE CONCAT('%', p_match.title, '%')
                    OR h.parasha_reference LIKE CONCAT('%', p_match.title, '%')
                    OR p_match.title LIKE CONCAT('%', REPLACE(REPLACE(h.title, 'Haftará', ''), 'Parashá', ''), '%')
                )
            )
            WHERE h.is_published = TRUE 
            ORDER BY COALESCE(p.parasha_number, p_match.parasha_number, 0) DESC, h.id DESC 
            LIMIT ?
        `, [limit]);
        return (rows || []).map(r => Haftara.normalize(r));
    }

    static async getPublished() {
        await Haftara.ensureColumns();
        const [rows] = await db.query(`
            SELECT h.*, 
                   COALESCE(p.id, p_match.id) AS matched_parasha_id,
                   COALESCE(p.title, p_match.title) AS parasha_title, 
                   COALESCE(p.subtitle, p_match.subtitle) AS parasha_subtitle, 
                   COALESCE(p.parasha_number, p_match.parasha_number) AS parasha_number,
                   COALESCE(p.image_url, p_match.image_url) AS parasha_image_url
            FROM haftarot h
            LEFT JOIN parashot p ON h.parasha_id = p.id
            LEFT JOIN parashot p_match ON (
                h.parasha_id IS NULL AND (
                    h.title LIKE CONCAT('%', p_match.title, '%')
                    OR h.parasha_reference LIKE CONCAT('%', p_match.title, '%')
                    OR p_match.title LIKE CONCAT('%', REPLACE(REPLACE(h.title, 'Haftará', ''), 'Parashá', ''), '%')
                )
            )
            WHERE h.is_published = TRUE 
            ORDER BY COALESCE(p.parasha_number, p_match.parasha_number, 0) DESC, h.id DESC
        `);
        return (rows || []).map(r => Haftara.normalize(r));
    }

    static async getById(id) {
        await Haftara.ensureColumns();
        const [rows] = await db.query(`
            SELECT h.*, 
                   COALESCE(p.id, p_match.id) AS matched_parasha_id,
                   COALESCE(p.title, p_match.title) AS parasha_title, 
                   COALESCE(p.subtitle, p_match.subtitle) AS parasha_subtitle, 
                   COALESCE(p.parasha_number, p_match.parasha_number) AS parasha_number,
                   COALESCE(p.image_url, p_match.image_url) AS parasha_image_url,
                   p.description AS parasha_description
            FROM haftarot h
            LEFT JOIN parashot p ON h.parasha_id = p.id
            LEFT JOIN parashot p_match ON (
                h.parasha_id IS NULL AND (
                    h.title LIKE CONCAT('%', p_match.title, '%')
                    OR h.parasha_reference LIKE CONCAT('%', p_match.title, '%')
                    OR p_match.title LIKE CONCAT('%', REPLACE(REPLACE(h.title, 'Haftará', ''), 'Parashá', ''), '%')
                )
            )
            WHERE h.id = ?
        `, [id]);
        return rows && rows[0] ? Haftara.normalize(rows[0]) : null;
    }

    static async getByParashaId(parashaId) {
        await Haftara.ensureColumns();
        if (!parashaId) return null;
        const [rows] = await db.query(`
            SELECT h.*, 
                   p.title AS parasha_title, 
                   p.subtitle AS parasha_subtitle, 
                   p.parasha_number,
                   p.image_url AS parasha_image_url,
                   p.description AS parasha_description
            FROM haftarot h
            LEFT JOIN parashot p ON h.parasha_id = p.id
            WHERE h.parasha_id = ? AND h.is_published = TRUE
            ORDER BY h.id DESC
            LIMIT 1
        `, [parashaId]);
        return rows && rows[0] ? Haftara.normalize(rows[0]) : null;
    }

    static async getByParashaTitle(parashaTitle) {
        await Haftara.ensureColumns();
        if (!parashaTitle || typeof parashaTitle !== 'string') return null;
        const cleanTitle = parashaTitle.replace(/parash[aá]/gi, '').trim();
        if (!cleanTitle) return null;

        const [rows] = await db.query(`
            SELECT h.*, 
                   COALESCE(p.id, p_match.id) AS matched_parasha_id,
                   COALESCE(p.title, p_match.title) AS parasha_title, 
                   COALESCE(p.subtitle, p_match.subtitle) AS parasha_subtitle, 
                   COALESCE(p.parasha_number, p_match.parasha_number) AS parasha_number,
                   COALESCE(p.image_url, p_match.image_url) AS parasha_image_url,
                   COALESCE(p.description, p_match.description) AS parasha_description
            FROM haftarot h
            LEFT JOIN parashot p ON h.parasha_id = p.id
            LEFT JOIN parashot p_match ON (
                h.parasha_id IS NULL AND (
                    h.title LIKE CONCAT('%', p_match.title, '%')
                    OR h.parasha_reference LIKE CONCAT('%', p_match.title, '%')
                    OR p_match.title LIKE CONCAT('%', REPLACE(REPLACE(h.title, 'Haftará', ''), 'Parashá', ''), '%')
                )
            )
            WHERE (h.title LIKE ? OR h.subtitle LIKE ? OR h.parasha_reference LIKE ?) 
              AND h.is_published = TRUE
            ORDER BY h.id DESC
            LIMIT 1
        `, [`%${cleanTitle}%`, `%${cleanTitle}%`, `%${cleanTitle}%`]);
        return rows && rows[0] ? Haftara.normalize(rows[0]) : null;
    }

    static async create(data) {
        await Haftara.ensureColumns();
        const { parasha_id, title, subtitle, parasha_reference, description, content, image_url, youtube_link, audio_url, author, author_role, author_img, authors, is_published } = data;

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
        const parsedParashaId = parasha_id ? parseInt(parasha_id) : null;

        try {
            return await db.query(
                `INSERT INTO haftarot (parasha_id, title, subtitle, parasha_reference, description, content, image_url, youtube_link, audio_url, author, author_role, author_img, authors, is_published) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    parsedParashaId,
                    title,
                    subtitle || '',
                    parasha_reference || '',
                    description || '',
                    content || '',
                    image_url || '',
                    youtube_link || '',
                    audio_url || '',
                    primaryAuthor,
                    primaryRole,
                    primaryImg,
                    authorsJson,
                    is_published !== undefined ? is_published : true
                ]
            );
        } catch (err) {
            return await db.query(
                `INSERT INTO haftarot (title, subtitle, parasha_reference, description, content, image_url, youtube_link, audio_url, author, author_role, author_img, is_published) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    title,
                    subtitle || '',
                    parasha_reference || '',
                    description || '',
                    content || '',
                    image_url || '',
                    youtube_link || '',
                    audio_url || '',
                    primaryAuthor,
                    primaryRole,
                    primaryImg,
                    is_published !== undefined ? is_published : true
                ]
            );
        }
    }

    static async update(id, data) {
        await Haftara.ensureColumns();
        const { parasha_id, title, subtitle, parasha_reference, description, content, image_url, youtube_link, audio_url, author, author_role, author_img, authors, is_published } = data;

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
        const parsedParashaId = parasha_id ? parseInt(parasha_id) : null;

        try {
            return await db.query(
                `UPDATE haftarot SET 
                    parasha_id = ?,
                    title = ?, 
                    subtitle = ?, 
                    parasha_reference = ?, 
                    description = ?, 
                    content = ?, 
                    image_url = ?, 
                    youtube_link = ?, 
                    audio_url = ?, 
                    author = ?, 
                    author_role = ?, 
                    author_img = ?, 
                    authors = ?, 
                    is_published = ? 
                 WHERE id = ?`,
                [
                    parsedParashaId,
                    title,
                    subtitle || '',
                    parasha_reference || '',
                    description || '',
                    content || '',
                    image_url || '',
                    youtube_link || '',
                    audio_url || '',
                    primaryAuthor,
                    primaryRole,
                    primaryImg,
                    authorsJson,
                    is_published !== undefined ? is_published : true,
                    id
                ]
            );
        } catch (err) {
            return await db.query(
                `UPDATE haftarot SET 
                    title = ?, 
                    subtitle = ?, 
                    parasha_reference = ?, 
                    description = ?, 
                    content = ?, 
                    image_url = ?, 
                    youtube_link = ?, 
                    audio_url = ?, 
                    author = ?, 
                    author_role = ?, 
                    author_img = ?, 
                    is_published = ? 
                 WHERE id = ?`,
                [
                    title,
                    subtitle || '',
                    parasha_reference || '',
                    description || '',
                    content || '',
                    image_url || '',
                    youtube_link || '',
                    audio_url || '',
                    primaryAuthor,
                    primaryRole,
                    primaryImg,
                    is_published !== undefined ? is_published : true,
                    id
                ]
            );
        }
    }

    static async delete(id) {
        return await db.query('DELETE FROM haftarot WHERE id = ?', [id]);
    }

    static async count() {
        const [rows] = await db.query('SELECT COUNT(*) as total FROM haftarot');
        return rows[0] ? rows[0].total : 0;
    }

    static async incrementViews(id) {
        try {
            await db.query('UPDATE haftarot SET views = views + 1 WHERE id = ?', [id]);
        } catch (e) {
            console.warn('Aviso incrementViews haftarot:', e.message);
        }
    }
}

module.exports = Haftara;
