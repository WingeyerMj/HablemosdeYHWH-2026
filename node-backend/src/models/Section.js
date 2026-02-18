const db = require('../config/db');

class Section {
    static async getAll() {
        const [rows] = await db.query('SELECT * FROM sections');
        return rows;
    }

    static async getByName(name) {
        const [rows] = await db.query('SELECT * FROM sections WHERE section_name = ?', [name]);
        return rows[0];
    }

    static async update(id, data) {
        const { title, subtitle, content, image_url } = data;
        return await db.query(
            'UPDATE sections SET title = ?, subtitle = ?, content = ?, image_url = ? WHERE id = ?',
            [title, subtitle, content, image_url, id]
        );
    }
}

module.exports = Section;
