const db = require('../config/db');

class DynamicSection {
    // Obtener todas las secciones dinámicas
    static async getAll() {
        const [rows] = await db.query('SELECT * FROM dynamic_sections ORDER BY nav_order ASC, id ASC');
        return rows;
    }

    // Obtener secciones permitidas para un usuario específico (si es editor)
    static async getAllByUserId(userId) {
        const [rows] = await db.query(
            `SELECT ds.* FROM dynamic_sections ds
             JOIN section_permissions sp ON ds.id = sp.section_id
             WHERE sp.user_id = ?
             ORDER BY ds.nav_order ASC, ds.id ASC`,
            [userId]
        );
        return rows;
    }

    // Obtener solo las activas
    static async getActive() {
        const [rows] = await db.query('SELECT * FROM dynamic_sections WHERE is_active = TRUE ORDER BY nav_order ASC');
        return rows;
    }

    // Obtener secciones para el navbar
    static async getNavbarSections() {
        const [rows] = await db.query(
            'SELECT id, title, slug, section_type, icon, nav_order FROM dynamic_sections WHERE is_active = TRUE AND show_in_navbar = TRUE ORDER BY nav_order ASC'
        );
        return rows;
    }

    // Obtener secciones inline activas (para la home)
    static async getInlineSections() {
        const [rows] = await db.query(
            'SELECT * FROM dynamic_sections WHERE is_active = TRUE AND section_type = ? ORDER BY nav_order ASC',
            ['inline']
        );
        return rows;
    }

    // Obtener por ID
    static async getById(id) {
        const [rows] = await db.query('SELECT * FROM dynamic_sections WHERE id = ?', [id]);
        return rows[0];
    }

    // Obtener por slug
    static async getBySlug(slug) {
        const [rows] = await db.query('SELECT * FROM dynamic_sections WHERE slug = ? AND is_active = TRUE', [slug]);
        return rows[0];
    }

    // Crear nueva sección
    static async create(data) {
        const { title, slug, section_type, summary, content, icon, image_url, nav_order, is_active, show_in_navbar, data_table } = data;
        const isPostgres = !!process.env.DATABASE_URL;

        const sql = `INSERT INTO dynamic_sections (title, slug, section_type, summary, content, icon, image_url, nav_order, is_active, show_in_navbar, data_table)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ${isPostgres ? 'RETURNING id' : ''}`;

        const [result] = await db.query(sql, [title, slug, section_type, summary || '', content || '', icon || 'bi-file-text', image_url || '', nav_order || 0, is_active !== false, show_in_navbar !== false, data_table || null]);

        if (isPostgres) {
            return { insertId: result[0].id };
        }
        return result; // MySQL result (ResultSetHeader)
    }



    // Actualizar sección
    static async update(id, data) {
        const { title, slug, section_type, summary, content, icon, image_url, nav_order, is_active, show_in_navbar, data_table } = data;
        return await db.query(
            `UPDATE dynamic_sections SET title = ?, slug = ?, section_type = ?, summary = ?, content = ?, icon = ?, image_url = ?, nav_order = ?, is_active = ?, show_in_navbar = ?, data_table = ? WHERE id = ?`,
            [title, slug, section_type, summary || '', content || '', icon || 'bi-file-text', image_url || '', nav_order || 0, !!is_active, !!show_in_navbar, data_table || null, id]
        );
    }


    // Eliminar sección
    static async delete(id) {
        return await db.query('DELETE FROM dynamic_sections WHERE id = ?', [id]);
    }

    // Generar slug desde título
    static generateSlug(title) {
        return title
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
            .replace(/[^a-z0-9]+/g, '-')     // Reemplazar especiales por guión
            .replace(/^-+|-+$/g, '');         // Quitar guiones al inicio/final
    }

    // --- Permisos ---
    static async getPermissions(sectionId) {
        const [rows] = await db.query('SELECT user_id FROM section_permissions WHERE section_id = ?', [sectionId]);
        return rows.map(r => r.user_id);
    }

    static async setPermissions(sectionId, userIds) {
        // Eliminar permisos previos
        await db.query('DELETE FROM section_permissions WHERE section_id = ?', [sectionId]);

        // Insertar nuevos permisos
        if (userIds && userIds.length > 0) {
            const isPostgres = !!process.env.DATABASE_URL;
            if (isPostgres) {
                // PostgreSQL: Build bulk insert manually or do it one by one
                // For simplicity and to avoid placeholder complexity, we'll do it one by one 
                // as there are usually very few editors per section.
                for (const uid of userIds) {
                    await db.query('INSERT INTO section_permissions (section_id, user_id) VALUES (?, ?)', [sectionId, uid]);
                }
            } else {
                // MySQL: supports array of arrays
                const values = userIds.map(uid => [sectionId, uid]);
                await db.query('INSERT INTO section_permissions (section_id, user_id) VALUES ?', [values]);
            }
        }
    }


    static async hasPermission(sectionId, userId) {
        const [rows] = await db.query('SELECT 1 FROM section_permissions WHERE section_id = ? AND user_id = ?', [sectionId, userId]);
        return rows.length > 0;
    }
}

module.exports = DynamicSection;
