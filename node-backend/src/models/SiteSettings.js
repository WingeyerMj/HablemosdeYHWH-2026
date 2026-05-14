const db = require('../config/db');

class SiteSettings {
    /**
     * Obtener todas las configuraciones del sitio
     */
    static async getAll() {
        const [rows] = await db.query('SELECT * FROM site_settings ORDER BY setting_group ASC, id ASC');
        return rows;
    }

    /**
     * Obtener configuraciones agrupadas por grupo
     */
    static async getAllGrouped() {
        const rows = await this.getAll();
        const grouped = {};
        rows.forEach(row => {
            if (!grouped[row.setting_group]) {
                grouped[row.setting_group] = [];
            }
            grouped[row.setting_group].push(row);
        });
        return grouped;
    }

    /**
     * Obtener una configuración por su clave
     */
    static async get(key) {
        const [rows] = await db.query('SELECT * FROM site_settings WHERE setting_key = ?', [key]);
        return rows[0] ? rows[0].setting_value : null;
    }

    /**
     * Obtener múltiples configuraciones como objeto { key: value }
     */
    static async getMap() {
        const [rows] = await db.query('SELECT setting_key, setting_value FROM site_settings');
        const map = {};
        rows.forEach(row => {
            map[row.setting_key] = row.setting_value;
        });
        return map;
    }

    /**
     * Actualizar una configuración
     */
    static async set(key, value) {
        const [existing] = await db.query('SELECT id FROM site_settings WHERE setting_key = ?', [key]);
        if (existing.length > 0) {
            return await db.query('UPDATE site_settings SET setting_value = ? WHERE setting_key = ?', [value, key]);
        } else {
            return await db.query(
                'INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?)',
                [key, value]
            );
        }
    }

    /**
     * Actualizar múltiples configuraciones de golpe
     */
    static async setMultiple(data) {
        for (const [key, value] of Object.entries(data)) {
            await this.set(key, value);
        }
    }

    /**
     * Crear una nueva configuración
     */
    static async create(data) {
        const { setting_key, setting_value, setting_type, setting_group, label } = data;
        return await db.query(
            'INSERT INTO site_settings (setting_key, setting_value, setting_type, setting_group, label) VALUES (?, ?, ?, ?, ?)',
            [setting_key, setting_value || '', setting_type || 'text', setting_group || 'general', label || setting_key]
        );
    }

    /**
     * Eliminar una configuración
     */
    static async delete(key) {
        return await db.query('DELETE FROM site_settings WHERE setting_key = ?', [key]);
    }
}

module.exports = SiteSettings;
