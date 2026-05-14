const db = require('../config/db');

class Pricing {
    static async getAll() {
        const [rows] = await db.query('SELECT * FROM pricing ORDER BY id ASC');
        return rows;
    }

    static async create(data) {
        const { name, price, featured, features, na_features } = data;
        return await db.query(
            'INSERT INTO pricing (name, price, featured, features, na_features) VALUES (?, ?, ?, ?, ?)',
            [name, price, featured, features, na_features]
        );
    }

    static async update(id, data) {
        const { name, price, featured, features, na_features } = data;
        return await db.query(
            'UPDATE pricing SET name = ?, price = ?, featured = ?, features = ?, na_features = ? WHERE id = ?',
            [name, price, featured, features, na_features, id]
        );
    }

    static async delete(id) {
        return await db.query('DELETE FROM pricing WHERE id = ?', [id]);
    }
}

module.exports = Pricing;
