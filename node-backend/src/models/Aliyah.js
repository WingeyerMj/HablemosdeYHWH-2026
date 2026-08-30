const db = require('../config/db');

class Aliyah {
    /**
     * Obtener todas las Aliyot de una Parashá (ordenadas 1 a 7)
     */
    static async getByParashaId(parashaId) {
        const [rows] = await db.query(
            'SELECT * FROM aliyot WHERE parasha_id = ? ORDER BY aliyah_number ASC',
            [parashaId]
        );
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
     * Obtener Aliyá por su ID
     */
    static async getById(id) {
        const [rows] = await db.query('SELECT * FROM aliyot WHERE id = ?', [id]);
        return rows[0] || null;
    }

    /**
     * Guardar o actualizar una Aliyá (Upsert por parasha_id y aliyah_number)
     */
    static async upsert(data) {
        const { parasha_id, aliyah_number, title, verses_reference, content, audio_url } = data;

        if (audio_url !== undefined) {
            const sql = `
                INSERT INTO aliyot (parasha_id, aliyah_number, title, verses_reference, content, audio_url)
                VALUES (?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                    title = VALUES(title),
                    verses_reference = VALUES(verses_reference),
                    content = VALUES(content),
                    audio_url = VALUES(audio_url),
                    updated_at = CURRENT_TIMESTAMP
            `;
            return await db.query(sql, [parasha_id, aliyah_number, title, verses_reference || '', content || '', audio_url]);
        } else {
            const sql = `
                INSERT INTO aliyot (parasha_id, aliyah_number, title, verses_reference, content)
                VALUES (?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                    title = VALUES(title),
                    verses_reference = VALUES(verses_reference),
                    content = VALUES(content),
                    updated_at = CURRENT_TIMESTAMP
            `;
            return await db.query(sql, [parasha_id, aliyah_number, title, verses_reference || '', content || '']);
        }
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
