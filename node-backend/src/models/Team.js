const db = require('../config/db');

class Team {
    static async ensureColumns() {
        try {
            await db.query(`
                ALTER TABLE team 
                ADD COLUMN IF NOT EXISTS is_active TINYINT(1) NOT NULL DEFAULT 1
            `);
        } catch (e) {
            try {
                const [cols] = await db.query(`SHOW COLUMNS FROM team LIKE 'is_active'`);
                if (!cols || cols.length === 0) {
                    await db.query(`ALTER TABLE team ADD COLUMN is_active TINYINT(1) NOT NULL DEFAULT 1`);
                }
            } catch(err) {
                console.warn('Aviso asegurando columna is_active en team:', err.message);
            }
        }
    }

    static async getAll() {
        await this.ensureColumns();
        const [rows] = await db.query('SELECT * FROM team ORDER BY created_at DESC');
        return rows;
    }

    static async getActive() {
        await this.ensureColumns();
        const [rows] = await db.query('SELECT * FROM team WHERE is_active = 1 ORDER BY created_at DESC');
        return rows;
    }

    static async getById(id) {
        await this.ensureColumns();
        const [rows] = await db.query('SELECT * FROM team WHERE id = ?', [id]);
        return rows[0] || null;
    }

    static async create(data) {
        await this.ensureColumns();
        const { name, role, description, img, is_active } = data;
        const activeVal = (is_active === 0 || is_active === '0') ? 0 : 1;
        return await db.query(
            'INSERT INTO team (name, role, description, img, is_active) VALUES (?, ?, ?, ?, ?)',
            [name, role, description || '', img || '', activeVal]
        );
    }

    static async update(id, data) {
        await this.ensureColumns();
        const { name, role, description, img, is_active } = data;
        const activeVal = (is_active === 0 || is_active === '0') ? 0 : 1;
        return await db.query(
            'UPDATE team SET name = ?, role = ?, description = ?, img = ?, is_active = ? WHERE id = ?',
            [name, role, description || '', img || '', activeVal, id]
        );
    }

    static async toggleStatus(id) {
        await this.ensureColumns();
        return await db.query('UPDATE team SET is_active = IF(is_active = 1, 0, 1) WHERE id = ?', [id]);
    }

    static async delete(id) {
        return await db.query('DELETE FROM team WHERE id = ?', [id]);
    }
}

module.exports = Team;
