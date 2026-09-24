const db = require('../config/db');

class Seder {
    static async ensureTable() {
        try {
            await db.query(`
                CREATE TABLE IF NOT EXISTS seder (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    title VARCHAR(500) NOT NULL,
                    subtitle VARCHAR(500) DEFAULT '',
                    festival VARCHAR(255) DEFAULT '' COMMENT 'Nombre de la fiesta (Pesaj, Sucot, Shavuot, etc.)',
                    festival_date DATE DEFAULT NULL COMMENT 'Fecha de la fiesta',
                    description TEXT DEFAULT NULL,
                    content LONGTEXT DEFAULT NULL COMMENT 'Contenido completo del seder en HTML',
                    order_text LONGTEXT DEFAULT NULL COMMENT 'Orden del seder paso a paso',
                    prayers TEXT DEFAULT NULL COMMENT 'Oraciones y bendiciones',
                    readings TEXT DEFAULT NULL COMMENT 'Lecturas bíblicas asociadas',
                    songs TEXT DEFAULT NULL COMMENT 'Canciones y alabanzas',
                    image_url VARCHAR(500) DEFAULT '',
                    pdf_file VARCHAR(500) DEFAULT '' COMMENT 'Archivo PDF del seder',
                    author VARCHAR(255) DEFAULT 'Moréh Kalev Aquerman',
                    author_role VARCHAR(255) DEFAULT 'Moreh מורה',
                    author_img VARCHAR(500) DEFAULT '/assets/img/team/kaleb.jpg',
                    is_published BOOLEAN DEFAULT TRUE,
                    is_featured BOOLEAN DEFAULT FALSE,
                    views INT DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            `);
            console.log('✅ Tabla seder verificada/creada');
        } catch (e) {
            console.warn('⚠️ Error verificando tabla seder:', e.message);
        }
    }

    static normalize(row) {
        if (!row) return null;
        // Parse order_text if it's JSON
        if (row.order_text && typeof row.order_text === 'string') {
            try {
                row.order_steps = JSON.parse(row.order_text);
            } catch(e) {
                row.order_steps = [];
            }
        } else {
            row.order_steps = [];
        }
        return row;
    }

    static async getAll() {
        await Seder.ensureTable();
        const [rows] = await db.query('SELECT * FROM seder ORDER BY COALESCE(festival_date, DATE(created_at)) DESC, id DESC');
        return (rows || []).map(r => Seder.normalize(r));
    }

    static async getLatest(limit = 4) {
        await Seder.ensureTable();
        const [rows] = await db.query('SELECT * FROM seder WHERE is_published = TRUE ORDER BY COALESCE(festival_date, DATE(created_at)) DESC, id DESC LIMIT ?', [limit]);
        return (rows || []).map(r => Seder.normalize(r));
    }

    static async getPublished() {
        await Seder.ensureTable();
        const [rows] = await db.query('SELECT * FROM seder WHERE is_published = TRUE ORDER BY COALESCE(festival_date, DATE(created_at)) DESC, id DESC');
        return (rows || []).map(r => Seder.normalize(r));
    }

    static async getFeatured() {
        await Seder.ensureTable();
        const [rows] = await db.query('SELECT * FROM seder WHERE is_published = TRUE AND is_featured = TRUE ORDER BY COALESCE(festival_date, DATE(created_at)) DESC LIMIT 3');
        return (rows || []).map(r => Seder.normalize(r));
    }

    static async getByFestival(festival) {
        await Seder.ensureTable();
        const [rows] = await db.query('SELECT * FROM seder WHERE is_published = TRUE AND festival = ? ORDER BY festival_date DESC', [festival]);
        return (rows || []).map(r => Seder.normalize(r));
    }

    static async getFestivals() {
        await Seder.ensureTable();
        const [rows] = await db.query('SELECT DISTINCT festival FROM seder WHERE festival IS NOT NULL AND festival != "" AND is_published = TRUE ORDER BY festival');
        return (rows || []).map(r => r.festival);
    }

    static async create(data) {
        await Seder.ensureTable();
        const { title, subtitle, festival, festival_date, description, content, order_text, prayers, readings, songs, image_url, pdf_file, author, author_role, author_img, is_published, is_featured } = data;
        const finalDate = festival_date && festival_date.trim() !== '' ? festival_date : null;

        const [result] = await db.query(
            `INSERT INTO seder (title, subtitle, festival, festival_date, description, content, order_text, prayers, readings, songs, image_url, pdf_file, author, author_role, author_img, is_published, is_featured) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                title,
                subtitle || '',
                festival || '',
                finalDate,
                description || '',
                content || '',
                order_text || '',
                prayers || '',
                readings || '',
                songs || '',
                image_url || '',
                pdf_file || '',
                author || 'Moréh Kalev Aquerman',
                author_role || 'Moreh מורה',
                author_img || '/assets/img/team/kaleb.jpg',
                is_published !== undefined ? is_published : true,
                is_featured !== undefined ? is_featured : false
            ]
        );
        return result;
    }

    static async update(id, data) {
        await Seder.ensureTable();
        const { title, subtitle, festival, festival_date, description, content, order_text, prayers, readings, songs, image_url, pdf_file, author, author_role, author_img, is_published, is_featured } = data;
        const finalDate = festival_date && festival_date.trim() !== '' ? festival_date : null;

        return await db.query(
            `UPDATE seder SET 
                title = ?, 
                subtitle = ?, 
                festival = ?,
                festival_date = ?, 
                description = ?, 
                content = ?, 
                order_text = ?,
                prayers = ?,
                readings = ?,
                songs = ?,
                image_url = ?, 
                pdf_file = ?,
                author = ?, 
                author_role = ?, 
                author_img = ?, 
                is_published = ?,
                is_featured = ?
             WHERE id = ?`,
            [
                title,
                subtitle || '',
                festival || '',
                finalDate,
                description || '',
                content || '',
                order_text || '',
                prayers || '',
                readings || '',
                songs || '',
                image_url || '',
                pdf_file || '',
                author || 'Moréh Kalev Aquerman',
                author_role || 'Moreh מורה',
                author_img || '/assets/img/team/kaleb.jpg',
                is_published !== undefined ? is_published : true,
                is_featured !== undefined ? is_featured : false,
                id
            ]
        );
    }

    static async getById(id) {
        await Seder.ensureTable();
        const [rows] = await db.query('SELECT * FROM seder WHERE id = ?', [id]);
        return rows && rows[0] ? Seder.normalize(rows[0]) : null;
    }

    static async delete(id) {
        return await db.query('DELETE FROM seder WHERE id = ?', [id]);
    }

    static async count() {
        await Seder.ensureTable();
        const [rows] = await db.query('SELECT COUNT(*) as total FROM seder');
        return rows[0] ? rows[0].total : 0;
    }

    static async incrementViews(id) {
        try {
            await db.query('UPDATE seder SET views = COALESCE(views, 0) + 1 WHERE id = ?', [id]);
        } catch (e) {
            console.warn('Aviso incrementViews seder:', e.message);
        }
    }

    static async togglePublish(id) {
        await db.query('UPDATE seder SET is_published = NOT is_published WHERE id = ?', [id]);
    }

    static async toggleFeatured(id) {
        await db.query('UPDATE seder SET is_featured = NOT is_featured WHERE id = ?', [id]);
    }
}

module.exports = Seder;
