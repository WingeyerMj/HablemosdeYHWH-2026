const db = require('../config/db');

function normalizeText(value) {
    return String(value || '').trim().normalize('NFKC');
}
function normalizeUrl(value) {
    const url = String(value || '').trim();
    return /^(\/|#|https?:\/\/|mailto:|tel:)/i.test(url) ? url : '#';
}
function groupFooterLinks(rows = []) {
    const grouped = {};
    const seen = new Set();
    for (const row of rows) {
        if (row.is_active === false || row.is_active === 0) continue;
        const category = normalizeText(row.category);
        const title = normalizeText(row.title);
        const url = normalizeUrl(row.url);
        if (!category || !title) continue;
        const key = title.toLocaleLowerCase('es') + '\u0000' + url.toLocaleLowerCase('es');
        if (seen.has(key)) continue;
        seen.add(key);
        if (!grouped[category]) grouped[category] = [];
        grouped[category].push({ ...row, category, title, url });
    }
    return grouped;
}

class FooterModel {
    static async getFooterConfig() {
        const [rows] = await db.query("SELECT * FROM home_section_footer LIMIT 1");
        return rows[0] || {};
    }

    static async getFooterLinks() {
        const [rows] = await db.query("SELECT * FROM footer_links ORDER BY order_index ASC, id ASC");
        return groupFooterLinks(rows);
    }
}

module.exports = FooterModel;
module.exports.groupFooterLinks = groupFooterLinks;
