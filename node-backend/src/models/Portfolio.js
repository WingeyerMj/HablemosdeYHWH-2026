const db = require('../config/db');

class Portfolio {
    static async getAll() {
        const [rows] = await db.query('SELECT * FROM portfolio ORDER BY event_date DESC, created_at DESC');
        return rows;
    }

    static async getUpcoming() {
        const [rows] = await db.query(
            'SELECT * FROM portfolio WHERE event_date >= CURDATE() AND is_published = TRUE ORDER BY event_date ASC'
        );
        return rows;
    }

    static async getPast() {
        const [rows] = await db.query(
            'SELECT * FROM portfolio WHERE event_date < CURDATE() AND is_published = TRUE ORDER BY event_date DESC'
        );
        return rows;
    }

    static async getPublished() {
        const [rows] = await db.query('SELECT * FROM portfolio WHERE is_published = TRUE ORDER BY event_date DESC, created_at DESC');
        return rows;
    }

    static async create(data) {
        const { title, subtitle, category, description, content, event_date, image_url } = data;
        const img = image_url || '';
        return await db.query(
            'INSERT INTO portfolio (title, subtitle, category, description, content, event_date, image_url, img) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [title, subtitle || '', category || '', description || '', content || '', event_date || null, image_url || '', img]
        );
    }

    static async update(id, data) {
        const { title, subtitle, category, description, content, event_date, image_url } = data;
        return await db.query(
            'UPDATE portfolio SET title = ?, subtitle = ?, category = ?, description = ?, content = ?, event_date = ?, image_url = ?, img = ? WHERE id = ?',
            [title, subtitle || '', category || '', description || '', content || '', event_date || null, image_url || '', image_url || '', id]
        );
    }

    static async delete(id) {
        return await db.query('DELETE FROM portfolio WHERE id = ?', [id]);
    }

    static async getById(id) {
        const [rows] = await db.query('SELECT * FROM portfolio WHERE id = ?', [id]);
        return rows[0];
    }

    static async count() {
        const [rows] = await db.query('SELECT COUNT(*) as total FROM portfolio');
        return rows[0].total;
    }
}

module.exports = Portfolio;
