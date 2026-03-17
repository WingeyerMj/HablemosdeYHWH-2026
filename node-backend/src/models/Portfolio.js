const db = require('../config/db');

class Portfolio {
    static async getAll() {
        const [rows] = await db.query('SELECT * FROM portfolio ORDER BY created_at DESC');
        return rows;
    }

    static async create(data) {
        const { title, category, img, description } = data;
        return await db.query(
            'INSERT INTO portfolio (title, category, img, description) VALUES (?, ?, ?, ?)',
            [title, category, img, description]
        );
    }

    static async delete(id) {
        return await db.query('DELETE FROM portfolio WHERE id = ?', [id]);
    }

    static async getById(id) {
        const [rows] = await db.query('SELECT * FROM portfolio WHERE id = ?', [id]);
        return rows[0];
    }
}

module.exports = Portfolio;
