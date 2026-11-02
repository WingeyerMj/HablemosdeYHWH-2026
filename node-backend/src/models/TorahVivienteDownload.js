const db = require('../config/db');

class TorahVivienteDownload {
    static async ensureTable() {
        const isPostgres = !!process.env.DATABASE_URL;
        if (isPostgres) {
            await db.query(`
                CREATE TABLE IF NOT EXISTS torah_viviente_clicks (
                    id SERIAL PRIMARY KEY,
                    ip_address VARCHAR(100),
                    platform VARCHAR(80),
                    browser VARCHAR(80),
                    user_agent VARCHAR(500),
                    referrer VARCHAR(300),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
                CREATE INDEX IF NOT EXISTS idx_tv_clicks_created ON torah_viviente_clicks(created_at);
                CREATE INDEX IF NOT EXISTS idx_tv_clicks_ip ON torah_viviente_clicks(ip_address);
                CREATE INDEX IF NOT EXISTS idx_tv_clicks_platform ON torah_viviente_clicks(platform);
            `);
        } else {
            await db.query(`
                CREATE TABLE IF NOT EXISTS torah_viviente_clicks (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    ip_address VARCHAR(100) NULL,
                    platform VARCHAR(80) NULL,
                    browser VARCHAR(80) NULL,
                    user_agent VARCHAR(500) NULL,
                    referrer VARCHAR(300) NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    INDEX idx_tv_clicks_created (created_at),
                    INDEX idx_tv_clicks_ip (ip_address),
                    INDEX idx_tv_clicks_platform (platform)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            `);
        }
    }

    static parseUserAgent(ua = '') {
        const str = String(ua || '');
        let platform = 'Desconocido';
        if (/android/i.test(str)) platform = 'Android';
        else if (/iphone|ipad|ipod/i.test(str)) platform = 'iOS';
        else if (/windows phone/i.test(str)) platform = 'Windows Phone';
        else if (/windows/i.test(str)) platform = 'Windows';
        else if (/macintosh|mac os x/i.test(str)) platform = 'Mac OS';
        else if (/cros/i.test(str)) platform = 'ChromeOS';
        else if (/linux/i.test(str)) platform = 'Linux';

        let browser = 'Desconocido';
        if (/edg\//i.test(str)) browser = 'Edge';
        else if (/opr\/|opera/i.test(str)) browser = 'Opera';
        else if (/chrome|crios/i.test(str)) browser = 'Chrome';
        else if (/firefox|fxios/i.test(str)) browser = 'Firefox';
        else if (/safari/i.test(str) && !/chrome/i.test(str)) browser = 'Safari';
        else if (/msie|trident/i.test(str)) browser = 'Internet Explorer';

        return { platform, browser };
    }

    static async recordClick({ ip = '', platform = '', browser = '', userAgent = '', referrer = '' }) {
        await this.ensureTable();
        const parsed = this.parseUserAgent(userAgent);
        const finalPlatform = (platform && platform !== 'Desconocido') ? platform : parsed.platform;
        const finalBrowser = (browser && browser !== 'Desconocido') ? browser : parsed.browser;

        const cleanIp = String(ip || '').replace(/^.*:/, '').slice(0, 99) || '0.0.0.0';
        const cleanUa = String(userAgent || '').slice(0, 490);
        const cleanRef = String(referrer || '').slice(0, 290);

        const [result] = await db.query(`
            INSERT INTO torah_viviente_clicks (ip_address, platform, browser, user_agent, referrer)
            VALUES (?, ?, ?, ?, ?)
        `, [cleanIp, finalPlatform.slice(0, 75), finalBrowser.slice(0, 75), cleanUa, cleanRef]);

        return result.insertId || true;
    }

    static async getStats() {
        await this.ensureTable();

        // 1. Totales globales
        const [totalRows] = await db.query(`
            SELECT 
                COUNT(*) AS total,
                COUNT(DISTINCT ip_address) AS uniques,
                COUNT(CASE WHEN created_at >= NOW() - INTERVAL 1 DAY THEN 1 END) AS last_24h,
                COUNT(CASE WHEN created_at >= NOW() - INTERVAL 30 DAY THEN 1 END) AS last_30d
            FROM torah_viviente_clicks
        `);

        // 2. Desglose por plataforma
        const [platforms] = await db.query(`
            SELECT COALESCE(NULLIF(platform, ''), 'Desconocido') AS platform, COUNT(*) AS count
            FROM torah_viviente_clicks
            GROUP BY platform
            ORDER BY count DESC
            LIMIT 10
        `);

        // 3. Desglose por navegador
        const [browsers] = await db.query(`
            SELECT COALESCE(NULLIF(browser, ''), 'Desconocido') AS browser, COUNT(*) AS count
            FROM torah_viviente_clicks
            GROUP BY browser
            ORDER BY count DESC
            LIMIT 10
        `);

        // 4. Últimos 100 clics detallados
        const [recent] = await db.query(`
            SELECT id, ip_address, platform, browser, user_agent, referrer, created_at
            FROM torah_viviente_clicks
            ORDER BY created_at DESC
            LIMIT 100
        `);

        return {
            totals: totalRows[0] || { total: 0, uniques: 0, last_24h: 0, last_30d: 0 },
            platforms,
            browsers,
            recent
        };
    }

    static async deleteClick(id) {
        await this.ensureTable();
        await db.query('DELETE FROM torah_viviente_clicks WHERE id = ?', [id]);
        return true;
    }

    static async clearAll() {
        await this.ensureTable();
        await db.query('DELETE FROM torah_viviente_clicks');
        return true;
    }
}

module.exports = TorahVivienteDownload;

