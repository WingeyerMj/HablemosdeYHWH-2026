const db = require('../config/db');

class Aliyah {
    /**
     * Parsear audio_url a un array estructurado de audios [{ title, url, cycle_name, reader, reader_role, reader_img }]
     */
    static parseAudios(audio_url, fallbackReader = '') {
        if (!audio_url || typeof audio_url !== 'string' || audio_url.trim() === '') {
            return [];
        }
        const trimmed = audio_url.trim();
        const resolveReader = (item) => {
            if (item && item.reader && String(item.reader).trim() !== '') {
                return String(item.reader).trim();
            }
            if (fallbackReader && String(fallbackReader).trim() !== '') {
                return String(fallbackReader).trim();
            }
            const cName = (item && item.cycle_name ? String(item.cycle_name) : '').toLowerCase();
            if (cName.includes('2025 - 2026') || cName.includes('2025-2026')) {
                return 'Menajem Ben Leví';
            }
            return '';
        };
        if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
            try {
                const parsed = JSON.parse(trimmed);
                if (Array.isArray(parsed)) {
                    return parsed
                        .filter(item => item && item.url && item.url.trim() !== '')
                        .map(item => ({
                            title: item.title || 'Audio de la Lectura',
                            url: item.url.trim(),
                            cycle_name: item.cycle_name || '',
                            reader: resolveReader(item),
                            reader_role: item.reader_role || 'Lector de Aliyot',
                            reader_img: item.reader_img || '',
                            gain_db: Number(item.gain_db) || 0
                        }));
                } else if (parsed.url) {
                    return [{
                        title: parsed.title || 'Audio de la Lectura',
                        url: parsed.url.trim(),
                        cycle_name: parsed.cycle_name || '',
                        reader: resolveReader(parsed),
                        reader_role: parsed.reader_role || 'Lector de Aliyot',
                        reader_img: parsed.reader_img || '',
                        gain_db: Number(parsed.gain_db) || 0
                    }];
                }
            } catch (e) {}
        }
        return [{ 
            title: 'Audio de la Lectura', 
            url: trimmed,
            cycle_name: '',
            reader: fallbackReader || '',
            reader_role: 'Lector de Aliyot',
            reader_img: '',
            gain_db: 0
        }];
    }

    /**
     * Serializar lista de audios a JSON string preservando ciclo, lector y ganancia dB
     */
    static serializeAudios(audios, fallbackReader = '') {
        if (!audios || !Array.isArray(audios) || audios.length === 0) {
            return '';
        }
        const clean = audios
            .filter(a => a && a.url && a.url.trim() !== '')
            .map(a => ({
                title: a.title || 'Audio de la Lectura',
                url: a.url.trim(),
                cycle_name: a.cycle_name || '',
                reader: (a.reader && String(a.reader).trim() !== '') ? String(a.reader).trim() : (fallbackReader || ''),
                reader_role: a.reader_role || '',
                reader_img: a.reader_img || '',
                gain_db: Number(a.gain_db) || 0
            }));
        if (clean.length === 0) return '';
        return JSON.stringify(clean);
    }

    /**
     * Asegurar que la columna sort_order exista y se encuentre inicializada
     */
    static async ensureColumns() {
        try {
            await db.query(`ALTER TABLE aliyot ADD COLUMN IF NOT EXISTS sort_order INT DEFAULT 0`);
            const [check] = await db.query('SELECT COUNT(*) as cnt FROM aliyot WHERE sort_order > 0');
            if (check && check[0] && Number(check[0].cnt) === 0) {
                await Aliyah.resetToUploadOrder();
            }
        } catch (e) {
            console.warn('Aviso ensureColumns Aliyah:', e.message);
        }
    }

    /**
     * Restablecer el orden al orden cronológico original de subida (más recientes primero)
     */
    static async resetToUploadOrder() {
        try {
            const [rows] = await db.query('SELECT id FROM aliyot ORDER BY created_at DESC, id DESC');
            if (rows && rows.length > 0) {
                for (let i = 0; i < rows.length; i++) {
                    await db.query('UPDATE aliyot SET sort_order = ? WHERE id = ?', [i + 1, rows[i].id]);
                }
            }
            return true;
        } catch (e) {
            console.error('Error resetToUploadOrder:', e);
            return false;
        }
    }

    /**
     * Reorganizar automáticamente todas las Aliyot agrupadas por Parashá y Día (1 a 7)
     */
    static async autoOrganizeByParasha() {
        try {
            const sql = `
                SELECT a.id, a.aliyah_number, p.parasha_number, p.cycle_name
                FROM aliyot a
                LEFT JOIN parashot p ON a.parasha_id = p.id
                ORDER BY 
                    (COALESCE(p.cycle_name, '') LIKE '%2026 - 2027%' OR COALESCE(p.cycle_name, '') LIKE '%2026%') DESC,
                    COALESCE(p.parasha_number, 0) DESC,
                    a.aliyah_number ASC,
                    a.id ASC
            `;
            const [rows] = await db.query(sql);
            if (rows && rows.length > 0) {
                for (let i = 0; i < rows.length; i++) {
                    await db.query('UPDATE aliyot SET sort_order = ? WHERE id = ?', [i + 1, rows[i].id]);
                }
            }
            return true;
        } catch (e) {
            console.error('Error autoOrganizeByParasha:', e);
            return false;
        }
    }

    /**
     * Actualizar el orden secuencial (sort_order) a partir de una lista ordenada de IDs
     */
    static async updateSortOrder(orderedIds) {
        if (!Array.isArray(orderedIds) || orderedIds.length === 0) return false;
        for (let i = 0; i < orderedIds.length; i++) {
            const id = parseInt(orderedIds[i], 10);
            if (id) {
                await db.query('UPDATE aliyot SET sort_order = ? WHERE id = ?', [i + 1, id]);
            }
        }
        return true;
    }

    /**
     * Mover una Aliyá individual hacia arriba o hacia abajo en la lista
     */
    static async moveSingle(aliyahId, direction) {
        const id = parseInt(aliyahId, 10);
        if (!id) return false;

        const aliyot = await Aliyah.getAllWithParasha();
        const index = aliyot.findIndex(a => a.id === id);
        if (index === -1) return false;

        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= aliyot.length) return false;

        // Intercambiar posiciones
        const temp = aliyot[index];
        aliyot[index] = aliyot[targetIndex];
        aliyot[targetIndex] = temp;

        const orderedIds = aliyot.map(a => a.id);
        return await Aliyah.updateSortOrder(orderedIds);
    }

    /**
     * Mover una Aliyá directamente a una posición numérica específica (1-based)
     */
    static async moveToPosition(aliyahId, targetPosition) {
        const id = parseInt(aliyahId, 10);
        let target = parseInt(targetPosition, 10) - 1;
        if (!id || isNaN(target)) return false;

        const aliyot = await Aliyah.getAllWithParasha();
        const currentIndex = aliyot.findIndex(a => a.id === id);
        if (currentIndex === -1) return false;

        if (target < 0) target = 0;
        if (target >= aliyot.length) target = aliyot.length - 1;
        if (currentIndex === target) return true;

        const [item] = aliyot.splice(currentIndex, 1);
        aliyot.splice(target, 0, item);

        const orderedIds = aliyot.map(a => a.id);
        return await Aliyah.updateSortOrder(orderedIds);
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
                p.image_url as parasha_image_url,
                COALESCE(p.cycle_name, 'Ciclo 2025 - 2026') as cycle_name
            FROM aliyot a
            LEFT JOIN parashot p ON a.parasha_id = p.id
            ORDER BY 
                CASE 
                    WHEN a.sort_order IS NOT NULL AND a.sort_order > 0 THEN a.sort_order 
                    ELSE 999999 
                END ASC,
                a.created_at DESC, 
                a.aliyah_number ASC
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
        let sql = `
            SELECT a.*, COALESCE(p.cycle_name, 'Ciclo 2025 - 2026') as cycle_name 
            FROM aliyot a
            LEFT JOIN parashot p ON a.parasha_id = p.id
            WHERE a.parasha_id = ?
        `;
        if (onlyPublished) {
            sql += ' AND a.is_published = TRUE';
        }
        sql += ' ORDER BY a.aliyah_number ASC';
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
                p.image_url as parasha_image_url,
                COALESCE(p.cycle_name, 'Ciclo 2025 - 2026') as cycle_name
            FROM aliyot a
            LEFT JOIN parashot p ON a.parasha_id = p.id
            WHERE a.is_published = TRUE
            ORDER BY 
                (p.cycle_name LIKE '%2026 - 2027%' OR p.parasha_number = 1) DESC,
                a.updated_at DESC, 
                a.aliyah_number ASC
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
                p.image_url as parasha_image_url,
                COALESCE(p.cycle_name, 'Ciclo 2025 - 2026') as cycle_name
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
     * Crear una nueva Aliyá (incluyendo Hebreo y Fonética)
     */
    static async create(data) {
        const { parasha_id, aliyah_number, title, verses_reference, content, content_hebrew, content_phonetic, audio_url, reading_date, is_published } = data;
        const pId = (parasha_id && parasha_id !== '' && parasha_id !== 'null') ? Number(parasha_id) : null;
        const pub = (is_published !== undefined && is_published !== null) ? Boolean(is_published) : true;
        const rDate = reading_date || null;

        let initialSortOrder = 0;
        try {
            const [maxOrder] = await db.query('SELECT MAX(sort_order) as max_ord FROM aliyot');
            initialSortOrder = (maxOrder && maxOrder[0] && maxOrder[0].max_ord) ? (Number(maxOrder[0].max_ord) + 1) : 1;
        } catch (e) {}

        const sql = `
            INSERT INTO aliyot (parasha_id, aliyah_number, title, verses_reference, content, content_hebrew, content_phonetic, audio_url, reading_date, is_published, sort_order)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        return await db.query(sql, [
            pId, 
            aliyah_number, 
            title, 
            verses_reference || '', 
            content || '', 
            content_hebrew || '', 
            content_phonetic || '', 
            audio_url || '', 
            rDate, 
            pub,
            initialSortOrder
        ]);
    }

    /**
     * Actualizar una Aliyá por su ID
     */
    static async update(id, data) {
        const { parasha_id, aliyah_number, title, verses_reference, content, content_hebrew, content_phonetic, audio_url, reading_date, is_published } = data;
        const pId = (parasha_id && parasha_id !== '' && parasha_id !== 'null') ? Number(parasha_id) : null;
        const pub = (is_published !== undefined && is_published !== null) ? Boolean(is_published) : true;
        const rDate = reading_date || null;

        let sql = `
            UPDATE aliyot 
            SET parasha_id = ?, aliyah_number = ?, title = ?, verses_reference = ?, content = ?, content_hebrew = ?, content_phonetic = ?, reading_date = ?, is_published = ?
        `;
        const params = [
            pId, 
            aliyah_number, 
            title, 
            verses_reference || '', 
            content || '', 
            content_hebrew || '', 
            content_phonetic || '', 
            rDate, 
            pub
        ];

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
