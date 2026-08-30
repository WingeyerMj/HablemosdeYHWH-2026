const db = require('../config/db');

class Aliyah {
    /**
     * Parsear audio_url a un array estructurado de audios [{ title, url }]
     */
    static parseAudios(audio_url) {
        if (!audio_url || typeof audio_url !== 'string' || audio_url.trim() === '') {
            return [];
        }
        const trimmed = audio_url.trim();
        if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
            try {
                const parsed = JSON.parse(trimmed);
                if (Array.isArray(parsed)) {
                    return parsed.filter(item => item && item.url && item.url.trim() !== '');
                } else if (parsed.url) {
                    return [parsed];
                }
            } catch (e) {}
        }
        // Soporte retrocompatible para cadenas simples de URL
        return [{ title: 'Audio de la Lectura', url: trimmed }];
    }

    /**
     * Serializar lista de audios a JSON string
     */
    static serializeAudios(audios) {
        if (!audios || !Array.isArray(audios) || audios.length === 0) {
            return '';
        }
        const clean = audios.filter(a => a && a.url && a.url.trim() !== '');
        if (clean.length === 0) return '';
        return JSON.stringify(clean);
    }

    /**
     * Obtener todas las Aliyot con datos de la Parashá y audios parseados
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
        return rows.map(r => ({
            ...r,
            audios: Aliyah.parseAudios(r.audio_url)
        }));
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
        return rows.map(r => ({
            ...r,
            audios: Aliyah.parseAudios(r.audio_url)
        }));
    }

    /**
     * Obtener Aliyot pendientes de vincular (sin parashá asignada)
     */
    static async getUnlinked() {
        const sql = `SELECT * FROM aliyot WHERE parasha_id IS NULL ORDER BY created_at DESC`;
        const [rows] = await db.query(sql);
        return rows.map(r => ({
            ...r,
            audios: Aliyah.parseAudios(r.audio_url)
        }));
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
        return rows.map(r => ({
            ...r,
            audios: Aliyah.parseAudios(r.audio_url)
        }));
    }

    /**
     * Obtener una Aliyá específica por Parashá y Número (1 a 7)
     */
    static async getByParashaAndNumber(parashaId, aliyahNumber) {
        const [rows] = await db.query(
            'SELECT * FROM aliyot WHERE parasha_id = ? AND aliyah_number = ?',
            [parashaId, aliyahNumber]
        );
        if (!rows[0]) return null;
        return {
            ...rows[0],
            audios: Aliyah.parseAudios(rows[0].audio_url)
        };
    }

    /**
     * Obtener Aliyá por su ID con datos de la Parashá y audios parseados
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
        if (!rows[0]) return null;
        return {
            ...rows[0],
            audios: Aliyah.parseAudios(rows[0].audio_url)
        };
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
        const { parasha_id, aliyah_number } = data;
        const pId = (parasha_id && parasha_id !== '' && parasha_id !== 'null') ? Number(parasha_id) : null;

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
