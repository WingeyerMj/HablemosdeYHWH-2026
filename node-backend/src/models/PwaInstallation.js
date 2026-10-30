const fs = require('fs');
const path = require('path');
const db = require('../config/db');

class PwaInstallation {
    static async ensureTable() {
        const postgres = !!process.env.DATABASE_URL;
        await db.query(postgres ? `
            CREATE TABLE IF NOT EXISTS pwa_installations (
                id SERIAL PRIMARY KEY,
                installation_id VARCHAR(80) NOT NULL UNIQUE,
                platform VARCHAR(80),
                display_mode VARCHAR(30),
                user_agent VARCHAR(500),
                app_version VARCHAR(80),
                installed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_seen_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                launch_count INT DEFAULT 1,
                is_installed BOOLEAN DEFAULT TRUE
            )
        ` : `
            CREATE TABLE IF NOT EXISTS pwa_installations (
                id INT AUTO_INCREMENT PRIMARY KEY,
                installation_id VARCHAR(80) NOT NULL UNIQUE,
                platform VARCHAR(80) NULL,
                display_mode VARCHAR(30) NULL,
                user_agent VARCHAR(500) NULL,
                app_version VARCHAR(80) NULL,
                installed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_seen_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                launch_count INT DEFAULT 1,
                is_installed BOOLEAN DEFAULT TRUE,
                INDEX idx_pwa_last_seen (last_seen_at),
                INDEX idx_pwa_platform (platform)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);
    }

    static async record(data) {
        await this.ensureTable();
        const values = [
            data.installationId,
            data.platform || 'Desconocido',
            data.displayMode || 'browser',
            String(data.userAgent || '').substring(0, 500),
            data.appVersion || this.getCalendarVersion()
        ];
        if (process.env.DATABASE_URL) {
            await db.query(`
                INSERT INTO pwa_installations
                    (installation_id, platform, display_mode, user_agent, app_version, installed_at, last_seen_at, launch_count, is_installed)
                VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1, TRUE)
                ON CONFLICT (installation_id) DO UPDATE SET
                    platform = EXCLUDED.platform,
                    display_mode = EXCLUDED.display_mode,
                    user_agent = EXCLUDED.user_agent,
                    app_version = EXCLUDED.app_version,
                    last_seen_at = CURRENT_TIMESTAMP,
                    launch_count = pwa_installations.launch_count + 1,
                    is_installed = TRUE
            `, values);
        } else {
            await db.query(`
                INSERT INTO pwa_installations
                    (installation_id, platform, display_mode, user_agent, app_version, installed_at, last_seen_at, launch_count, is_installed)
                VALUES (?, ?, ?, ?, ?, NOW(), NOW(), 1, TRUE)
                ON DUPLICATE KEY UPDATE
                    platform = VALUES(platform),
                    display_mode = VALUES(display_mode),
                    user_agent = VALUES(user_agent),
                    app_version = VALUES(app_version),
                    last_seen_at = NOW(),
                    launch_count = launch_count + 1,
                    is_installed = TRUE
            `, values);
        }
    }

    static getCalendarVersion() {
        const roots = [
            path.join(__dirname, '../../../Calendar'),
            path.join(__dirname, '../../../public/assets/calendar')
        ];
        let latest = 0;
        const visit = directory => {
            if (!fs.existsSync(directory)) return;
            for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
                const full = path.join(directory, entry.name);
                if (entry.isDirectory()) visit(full);
                else if (/\.(js|css|html|json)$/i.test(entry.name)) {
                    latest = Math.max(latest, fs.statSync(full).mtimeMs || 0);
                }
            }
        };
        roots.forEach(visit);
        return latest ? `calendar-${Math.floor(latest)}` : 'calendar-1';
    }

    static async getDashboard() {
        await this.ensureTable();
        const dateExpr = process.env.DATABASE_URL
            ? "last_seen_at >= CURRENT_TIMESTAMP - INTERVAL '30 days'"
            : 'last_seen_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)';
        const dayExpr = process.env.DATABASE_URL
            ? "TO_CHAR(installed_at, 'YYYY-MM-DD')"
            : "DATE_FORMAT(installed_at, '%Y-%m-%d')";
        const [totals] = await db.query(`
            SELECT COUNT(*) AS total,
                   SUM(CASE WHEN ${dateExpr} THEN 1 ELSE 0 END) AS active_30,
                   SUM(CASE WHEN display_mode = 'standalone' THEN 1 ELSE 0 END) AS standalone
            FROM pwa_installations WHERE is_installed = TRUE
        `);
        const [platforms] = await db.query(`
            SELECT COALESCE(platform, 'Desconocido') AS platform, COUNT(*) AS total
            FROM pwa_installations WHERE is_installed = TRUE
            GROUP BY platform ORDER BY total DESC
        `);
        const [versions] = await db.query(`
            SELECT COALESCE(app_version, 'Sin versión') AS app_version, COUNT(*) AS total
            FROM pwa_installations WHERE is_installed = TRUE
            GROUP BY app_version ORDER BY total DESC LIMIT 10
        `);
        const [daily] = await db.query(`
            SELECT ${dayExpr} AS day, COUNT(*) AS total
            FROM pwa_installations
            WHERE installed_at >= ${process.env.DATABASE_URL ? "CURRENT_TIMESTAMP - INTERVAL '30 days'" : 'DATE_SUB(NOW(), INTERVAL 30 DAY)'}
            GROUP BY ${dayExpr} ORDER BY day ASC
        `);
        const [recent] = await db.query(`
            SELECT installation_id, platform, display_mode, app_version, installed_at, last_seen_at, launch_count
            FROM pwa_installations ORDER BY last_seen_at DESC LIMIT 100
        `);
        return {
            totals: totals[0] || { total: 0, active_30: 0, standalone: 0 },
            platforms,
            versions,
            daily,
            recent,
            currentVersion: this.getCalendarVersion()
        };
    }
}

module.exports = PwaInstallation;

