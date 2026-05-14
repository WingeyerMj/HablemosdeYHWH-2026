const db = require('../config/db');

class FooterModel {
    static async getFooterConfig() {
        const [rows] = await db.query("SELECT * FROM home_section_footer LIMIT 1");
        return rows[0] || {};
    }

    static async getFooterLinks() {
        const [rows] = await db.query("SELECT * FROM footer_links ORDER BY category, order_index ASC");
        // Agrupar por categoría
        const grouped = {};
        rows.forEach(link => {
            if (!grouped[link.category]) grouped[link.category] = [];
            grouped[link.category].push(link);
        });
        return grouped;
    }
}

module.exports = FooterModel;
