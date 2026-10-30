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

        await db.query(postgres ? `
            CREATE TABLE IF NOT EXISTS pwa_release_state (
                id INT PRIMARY KEY,
                version VARCHAR(80) NOT NULL,
                alert_active BOOLEAN DEFAULT FALSE,
                alert_message VARCHAR(300),
                published_at TIMESTAMP NULL
            )
        ` : `
            CREATE TABLE IF NOT EXISTS pwa_release_state (
                id INT PRIMARY KEY,
                version VARCHAR(80) NOT NULL,
                alert_active TINYINT(1) DEFAULT 0,
                alert_message VARCHAR(300) NULL,
                published_at TIMESTAMP NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);
    }

    static async getReleaseConfig() {
        await this.ensureTable();
        const defaultMsg = 'Hay una versión nueva. Actualizá ahora para descargarla y seguir usándola sin conexión.';
        const [rows] = await db.query('SELECT * FROM pwa_release_state WHERE id = 1 LIMIT 1');
        if (!rows || !rows.length) {
            const initialVersion = 'calendario-base-v1';
            if (process.env.DATABASE_URL) {
                await db.query(
                    'INSERT INTO pwa_release_state (id, version, alert_active, alert_message, published_at) VALUES (1, ?, FALSE, ?, NULL) ON CONFLICT (id) DO NOTHING',
                    [initialVersion, defaultMsg]
                );
            } else {
                await db.query(
                    'INSERT IGNORE INTO pwa_release_state (id, version, alert_active, alert_message, published_at) VALUES (1, ?, 0, ?, NULL)',
                    [initialVersion, defaultMsg]
                );
            }
            return {
                version: initialVersion,
                alertActive: false,
                alertMessage: defaultMsg,
                publishedAt: null
            };
        }
        const r = rows[0];
        return {
            version: r.version || 'calendario-base-v1',
            alertActive: Boolean(r.alert_active),
            alertMessage: r.alert_message || defaultMsg,
            publishedAt: r.published_at || null
        };
    }

    static async publishManualUpdate(customMessage) {
        await this.ensureTable();
        const defaultMsg = 'Hay una versión nueva. Actualizá ahora para descargarla y seguir usándola sin conexión.';
        const msg = String(customMessage || defaultMsg).trim().substring(0, 280) || defaultMsg;
        const now = new Date();
        const stamp = now.toISOString().slice(0, 16).replace(/[-:T]/g, '');
        const newVersion = `cal-${stamp}-${Math.floor(Math.random() * 90 + 10)}`;

        if (process.env.DATABASE_URL) {
            await db.query(`
                INSERT INTO pwa_release_state (id, version, alert_active, alert_message, published_at)
                VALUES (1, ?, TRUE, ?, CURRENT_TIMESTAMP)
                ON CONFLICT (id) DO UPDATE SET
                    version = EXCLUDED.version,
                    alert_active = TRUE,
                    alert_message = EXCLUDED.alert_message,
                    published_at = CURRENT_TIMESTAMP
            `, [newVersion, msg]);
        } else {
            await db.query(`
                INSERT INTO pwa_release_state (id, version, alert_active, alert_message, published_at)
                VALUES (1, ?, 1, ?, NOW())
                ON DUPLICATE KEY UPDATE
                    version = VALUES(version),
                    alert_active = 1,
                    alert_message = VALUES(alert_message),
                    published_at = NOW()
            `, [newVersion, msg]);
        }
        return newVersion;
    }

    static async deactivateAlert() {
        await this.ensureTable();
        if (process.env.DATABASE_URL) {
            await db.query('UPDATE pwa_release_state SET alert_active = FALSE WHERE id = 1');
        } else {
            await db.query('UPDATE pwa_release_state SET alert_active = 0 WHERE id = 1');
        }
    }

    static async record(data) {
        await this.ensureTable();
        const releaseConfig = await this.getReleaseConfig();
        const values = [
            data.installationId,
            data.platform || 'Desconocido',
            data.displayMode || 'browser',
            String(data.userAgent || '').substring(0, 500),
            data.appVersion || releaseConfig.version
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
        return 'calendario-base-v1';
    }

    static async getDashboard() {
        await this.ensureTable();
        const releaseConfig = await this.getReleaseConfig();
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
            currentVersion: releaseConfig.version,
            releaseConfig
        };
    }
}

module.exports = PwaInstallation;
