const db = require('../config/db');

class Testimonial {
    static async getAll() {
        const [rows] = await db.query('SELECT * FROM testimonials ORDER BY created_at DESC');
        return rows;
    }

    static async create(data) {
        const { name, role, text, img } = data;
        return await db.query(
            'INSERT INTO testimonials (name, role, text, img) VALUES (?, ?, ?, ?)',
            [name, role, text, img]
        );
    }

    static async delete(id) {
        return await db.query('DELETE FROM testimonials WHERE id = ?', [id]);
    }
}

module.exports = Testimonial;
