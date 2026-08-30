const db = require('../config/db');

class Aliyah {
    /**
     * Obtener todas las Aliyot con datos de la Parashá (o NULL si no está vinculada aún)
     */
    static async getAllWithParasha() {
        const sql = `
            SELECT 
                a.*,
                p.title as parasha_title,
                p.subtitle as parasha_subtitle,
                p.parasha_number as parasha_number,
                p.image_url as parasha_image_url
            FROM aliyot a
            LEFT JOIN parashot p ON a.parasha_id = p.id
            ORDER BY a.created_at DESC, a.aliyah_number ASC
        `;
        const [rows] = await db.query(sql);
        return rows;
    }

    /**
     * Obtener todas las Aliyot de una Parashá (ordenadas 1 a 7)
     */
    static async getByParashaId(parashaId, onlyPublished = false) {
        let sql = 'SELECT * FROM aliyot WHERE parasha_id = ?';
        if (onlyPublished) {
            sql += ' AND is_published = TRUE';
        }
        sql += ' ORDER BY aliyah_number ASC';
        const [rows] = await db.query(sql, [parashaId]);
        return rows;
    }

    /**
     * Obtener Aliyot pendientes de vincular (sin parashá asignada)
     */
    static async getUnlinked() {
        const sql = `SELECT * FROM aliyot WHERE parasha_id IS NULL ORDER BY created_at DESC`;
        const [rows] = await db.query(sql);
        return rows;
    }

    /**
     * Obtener las Aliyot más recientes
     */
    static async getRecentAliyot(limit = 7) {
        const sql = `
            SELECT 
                a.*,
                p.title as parasha_title,
                p.subtitle as parasha_subtitle,
                p.parasha_number as parasha_number,
                p.image_url as parasha_image_url
            FROM aliyot a
            LEFT JOIN parashot p ON a.parasha_id = p.id
            WHERE a.is_published = TRUE
            ORDER BY a.updated_at DESC, a.aliyah_number ASC
            LIMIT ?
        `;
        const [rows] = await db.query(sql, [limit]);
        return rows;
    }

    /**
     * Obtener una Aliyá específica por Parashá y Número (1 a 7)
     */
    static async getByParashaAndNumber(parashaId, aliyahNumber) {
        const [rows] = await db.query(
            'SELECT * FROM aliyot WHERE parasha_id = ? AND aliyah_number = ?',
            [parashaId, aliyahNumber]
        );
        return rows[0] || null;
    }

    /**
     * Obtener Aliyá por su ID con datos de la Parashá
     */
    static async getById(id) {
        const sql = `
            SELECT 
                a.*,
                p.title as parasha_title,
                p.subtitle as parasha_subtitle,
                p.parasha_number as parasha_number,
                p.image_url as parasha_image_url
            FROM aliyot a
            LEFT JOIN parashot p ON a.parasha_id = p.id
            WHERE a.id = ?
        `;
        const [rows] = await db.query(sql, [id]);
        return rows[0] || null;
    }

    /**
     * Crear una nueva Aliyá (parasha_id puede ser null)
     */
    static async create(data) {
        const { parasha_id, aliyah_number, title, verses_reference, content, audio_url, reading_date, is_published } = data;
        const pId = (parasha_id && parasha_id !== '' && parasha_id !== 'null') ? Number(parasha_id) : null;
        const pub = (is_published !== undefined && is_published !== null) ? Boolean(is_published) : true;
        const rDate = reading_date || null;

        const sql = `
            INSERT INTO aliyot (parasha_id, aliyah_number, title, verses_reference, content, audio_url, reading_date, is_published)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        return await db.query(sql, [pId, aliyah_number, title, verses_reference || '', content || '', audio_url || '', rDate, pub]);
    }

    /**
     * Actualizar una Aliyá por su ID
     */
    static async update(id, data) {
        const { parasha_id, aliyah_number, title, verses_reference, content, audio_url, reading_date, is_published } = data;
        const pId = (parasha_id && parasha_id !== '' && parasha_id !== 'null') ? Number(parasha_id) : null;
        const pub = (is_published !== undefined && is_published !== null) ? Boolean(is_published) : true;
        const rDate = reading_date || null;

        let sql = `
            UPDATE aliyot 
            SET parasha_id = ?, aliyah_number = ?, title = ?, verses_reference = ?, content = ?, reading_date = ?, is_published = ?
        `;
        const params = [pId, aliyah_number, title, verses_reference || '', content || '', rDate, pub];

        if (audio_url !== undefined) {
            sql += `, audio_url = ?`;
            params.push(audio_url);
        }

        sql += ` WHERE id = ?`;
        params.push(id);

        return await db.query(sql, params);
    }

    /**
     * Vincular una Aliyá existente a una Parashá
     */
    static async linkToParasha(aliyahId, parashaId) {
        const pId = (parashaId && parashaId !== '' && parashaId !== 'null') ? Number(parashaId) : null;
        return await db.query('UPDATE aliyot SET parasha_id = ? WHERE id = ?', [pId, aliyahId]);
    }

    /**
     * Guardar o actualizar una Aliyá (Upsert por parasha_id y aliyah_number)
     */
    static async upsert(data) {
        const { parasha_id, aliyah_number, title, verses_reference, content, audio_url, reading_date, is_published } = data;
        const pId = (parasha_id && parasha_id !== '' && parasha_id !== 'null') ? Number(parasha_id) : null;
        const pub = (is_published !== undefined && is_published !== null) ? Boolean(is_published) : true;
        const rDate = reading_date || null;

        if (pId) {
            const [existing] = await db.query('SELECT id FROM aliyot WHERE parasha_id = ? AND aliyah_number = ?', [pId, aliyah_number]);
            if (existing && existing.length > 0) {
                return await this.update(existing[0].id, data);
            }
        }
        return await this.create(data);
    }

    /**
     * Eliminar el audio de una Aliyá
     */
    static async removeAudio(id) {
        return await db.query('UPDATE aliyot SET audio_url = NULL WHERE id = ?', [id]);
    }

    /**
     * Eliminar una Aliyá
     */
    static async delete(id) {
        return await db.query('DELETE FROM aliyot WHERE id = ?', [id]);
    }

    /**
     * Obtener todas las Parashot con resumen de sus Aliyot cargadas
     */
    static async getParashotOverview() {
        const sql = `
            SELECT 
                p.id, 
                p.parasha_number, 
                p.title, 
                p.subtitle, 
                p.image_url,
                COUNT(a.id) as total_aliyot,
                COUNT(CASE WHEN a.audio_url IS NOT NULL AND a.audio_url != '' THEN 1 END) as audios_count
            FROM parashot p
            LEFT JOIN aliyot a ON p.id = a.parasha_id
            GROUP BY p.id
            ORDER BY p.parasha_number DESC, p.id DESC
        `;
        const [rows] = await db.query(sql);
        return rows;
    }
}

module.exports = Aliyah;
