const db = require('../config/db');

class Team {
    static async getAll() {
        const [rows] = await db.query('SELECT * FROM team ORDER BY created_at DESC');
        return rows;
    }

    static async create(data) {
        const { name, role, description, img } = data;
        return await db.query(
            'INSERT INTO team (name, role, description, img) VALUES (?, ?, ?, ?)',
            [name, role, description, img]
        );
    }

    static async delete(id) {
        return await db.query('DELETE FROM team WHERE id = ?', [id]);
    }
}

module.exports = Team;
