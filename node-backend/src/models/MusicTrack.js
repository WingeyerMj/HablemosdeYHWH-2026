const db = require('../config/db');

let _ensurePromise = null;

class MusicTrack {
    static async ensureTable() {
        if (_ensurePromise) return _ensurePromise;
        _ensurePromise = (async () => {
            const isPostgres = !!process.env.DATABASE_URL;
            if (isPostgres) {
                await db.query(`
                    CREATE TABLE IF NOT EXISTS music_tracks (
                        id SERIAL PRIMARY KEY,
                        title VARCHAR(255) NOT NULL,
                        artist VARCHAR(150) DEFAULT 'Hablemos de YHWH',
                        category VARCHAR(100) DEFAULT 'Alabanza',
                        target_section VARCHAR(60) DEFAULT 'general',
                        in_auto_playlist BOOLEAN DEFAULT TRUE,
                        description TEXT DEFAULT NULL,
                        lyrics TEXT DEFAULT NULL,
                        audio_url VARCHAR(500) NOT NULL,
                        cover_image VARCHAR(500) DEFAULT NULL,
                        duration_label VARCHAR(40) DEFAULT NULL,
                        sort_order INT DEFAULT 0,
                        is_active BOOLEAN DEFAULT TRUE,
                        plays_count INT DEFAULT 0,
                        downloads_count INT DEFAULT 0,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    );
                    CREATE INDEX IF NOT EXISTS idx_music_active ON music_tracks(is_active);
                    CREATE INDEX IF NOT EXISTS idx_music_sort ON music_tracks(sort_order, id);
                `);
                try { await db.query(`ALTER TABLE music_tracks ADD COLUMN IF NOT EXISTS target_section VARCHAR(60) DEFAULT 'general'`); } catch (e) {}
                try { await db.query(`ALTER TABLE music_tracks ADD COLUMN IF NOT EXISTS in_auto_playlist BOOLEAN DEFAULT TRUE`); } catch (e) {}
                try { await db.query(`ALTER TABLE music_tracks ADD COLUMN IF NOT EXISTS downloads_count INT DEFAULT 0`); } catch (e) {}
            } else {
                await db.query(`
                    CREATE TABLE IF NOT EXISTS music_tracks (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        title VARCHAR(255) NOT NULL,
                        artist VARCHAR(150) DEFAULT 'Hablemos de YHWH',
                        category VARCHAR(100) DEFAULT 'Alabanza',
                        target_section VARCHAR(60) DEFAULT 'general',
                        in_auto_playlist BOOLEAN DEFAULT TRUE,
                        description TEXT DEFAULT NULL,
                        lyrics TEXT DEFAULT NULL,
                        audio_url VARCHAR(500) NOT NULL,
                        cover_image VARCHAR(500) DEFAULT NULL,
                        duration_label VARCHAR(40) DEFAULT NULL,
                        sort_order INT DEFAULT 0,
                        is_active BOOLEAN DEFAULT TRUE,
                        plays_count INT DEFAULT 0,
                        downloads_count INT DEFAULT 0,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                        INDEX idx_music_active (is_active),
                        INDEX idx_music_sort (sort_order, id)
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
                `);
                try { await db.query(`ALTER TABLE music_tracks ADD COLUMN target_section VARCHAR(60) DEFAULT 'general' AFTER category`); } catch (e) {}
                try { await db.query(`ALTER TABLE music_tracks ADD COLUMN in_auto_playlist BOOLEAN DEFAULT TRUE AFTER target_section`); } catch (e) {}
                try { await db.query(`ALTER TABLE music_tracks ADD COLUMN downloads_count INT DEFAULT 0 AFTER plays_count`); } catch (e) {}
            }

            const [rows] = await db.query('SELECT COUNT(*) AS total FROM music_tracks');
            const count = rows && rows[0] ? Number(rows[0].total || rows[0].count || 0) : 0;
            if (count === 0) {
                await this.seedDefaults();
            } else {
                // Asegurar que la canción infantil del Alef-Bet exista en el catálogo de Semillas de Torah
                const [kidRows] = await db.query(
                    'SELECT id FROM music_tracks WHERE audio_url = ?',
                    ['/assets/audio/alefato-hebreo.mp3']
                );
                if (!kidRows || kidRows.length === 0) {
                    await this.create({
                        title: 'El Canto Alegre del Alef-Bet',
                        artist: 'Semillas de Torah',
                        category: 'Infantil',
                        target_section: 'semillas',
                        in_auto_playlist: 0,
                        description: 'Canción rítmica infantil para aprender las 22 letras del Alef-Bet hebreo cantando en familia.',
                        audio_url: '/assets/audio/alefato-hebreo.mp3',
                        sort_order: 4,
                        is_active: 1
                    }, { skipEnsure: true });
                }
            }
        })().catch((err) => {
            _ensurePromise = null;
            throw err;
        });
        return _ensurePromise;
    }

    static async seedDefaults() {
        const defaults = [
            {
                title: 'El Redil',
                artist: 'Hablemos de YHWH',
                category: 'Alabanza',
                target_section: 'general',
                in_auto_playlist: 1,
                description: 'Cántico congregacional de alabanza y comunión en El Redil de Yeshua.',
                audio_url: '/assets/audio/musica/el-redil.mp3',
                sort_order: 1,
                is_active: 1
            },
            {
                title: 'Shabat',
                artist: 'Hablemos de YHWH',
                category: 'Shabat',
                target_section: 'general',
                in_auto_playlist: 1,
                description: 'Melodía apacible para recibir y disfrutar la paz del Shabat en familia.',
                audio_url: '/assets/audio/musica/shabat.mp3',
                sort_order: 2,
                is_active: 1
            },
            {
                title: 'El Ruido',
                artist: 'Hablemos de YHWH',
                category: 'Reflexión',
                target_section: 'general',
                in_auto_playlist: 1,
                description: 'Cántico de reflexión espiritual para escuchar la voz del Eterno sobre el ruido del mundo.',
                audio_url: '/assets/audio/musica/el-ruido.mp3',
                sort_order: 3,
                is_active: 1
            },
            {
                title: 'El Canto Alegre del Alef-Bet',
                artist: 'Semillas de Torah',
                category: 'Infantil',
                target_section: 'semillas',
                in_auto_playlist: 0,
                description: 'Canción rítmica infantil para aprender las 22 letras del Alef-Bet hebreo cantando en familia.',
                audio_url: '/assets/audio/alefato-hebreo.mp3',
                sort_order: 4,
                is_active: 1
            }
        ];

        for (const item of defaults) {
            await this.create(item, { skipEnsure: true });
        }
    }

    static async getAll() {
        await this.ensureTable();
        const [rows] = await db.query(
            'SELECT * FROM music_tracks ORDER BY sort_order ASC, id DESC'
        );
        return rows || [];
    }

    static async getActive() {
        await this.ensureTable();
        const isPostgres = !!process.env.DATABASE_URL;
        const activeVal = isPostgres ? 'TRUE' : '1';
        const [rows] = await db.query(
            `SELECT * FROM music_tracks WHERE is_active = ${activeVal} ORDER BY sort_order ASC, id DESC`
        );
        return rows || [];
    }

    static async getAutoPlaylist() {
        await this.ensureTable();
        const isPostgres = !!process.env.DATABASE_URL;
        const activeVal = isPostgres ? 'TRUE' : '1';
        const [rows] = await db.query(
            `SELECT * FROM music_tracks WHERE is_active = ${activeVal} AND in_auto_playlist = ${activeVal} ORDER BY sort_order ASC, id DESC`
        );
        return rows || [];
    }

    static async getBySection(section = 'general') {
        await this.ensureTable();
        const isPostgres = !!process.env.DATABASE_URL;
        const activeVal = isPostgres ? 'TRUE' : '1';
        if (section === 'semillas') {
            const [rows] = await db.query(
                `SELECT * FROM music_tracks WHERE is_active = ${activeVal} AND (target_section IN ('semillas', 'ambas') OR category = 'Infantil') ORDER BY sort_order ASC, id DESC`
            );
            return rows || [];
        }
        const [rows] = await db.query(
            `SELECT * FROM music_tracks WHERE is_active = ${activeVal} AND (target_section IN ('general', 'ambas') OR target_section IS NULL) ORDER BY sort_order ASC, id DESC`
        );
        return rows || [];
    }

    static async getById(id) {
        await this.ensureTable();
        const [rows] = await db.query('SELECT * FROM music_tracks WHERE id = ?', [id]);
        return rows && rows[0] ? rows[0] : null;
    }

    static async create(data, opts = {}) {
        if (!opts.skipEnsure) await this.ensureTable();
        const isPostgres = !!process.env.DATABASE_URL;
        const activeVal = isPostgres
            ? (data.is_active === false || data.is_active === 0 || data.is_active === '0' ? false : true)
            : (data.is_active === false || data.is_active === 0 || data.is_active === '0' ? 0 : 1);

        const autoPlaylistVal = isPostgres
            ? (data.in_auto_playlist === false || data.in_auto_playlist === 0 || data.in_auto_playlist === '0' ? false : true)
            : (data.in_auto_playlist === false || data.in_auto_playlist === 0 || data.in_auto_playlist === '0' ? 0 : 1);

        const validSections = ['general', 'semillas', 'ambas'];
        const targetSection = validSections.includes(data.target_section) ? data.target_section : 'general';

        const params = [
            data.title,
            data.artist || 'Hablemos de YHWH',
            data.category || 'Alabanza',
            targetSection,
            autoPlaylistVal,
            data.description || null,
            data.lyrics || null,
            data.audio_url,
            data.cover_image || null,
            data.duration_label || null,
            Number.isFinite(Number(data.sort_order)) ? Number(data.sort_order) : 0,
            activeVal
        ];

        const sql = `
            INSERT INTO music_tracks
                (title, artist, category, target_section, in_auto_playlist, description, lyrics, audio_url, cover_image, duration_label, sort_order, is_active)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        await db.query(sql, params);
    }

    static async update(id, data) {
        await this.ensureTable();
        const isPostgres = !!process.env.DATABASE_URL;
        const activeVal = isPostgres
            ? (data.is_active === false || data.is_active === 0 || data.is_active === '0' ? false : true)
            : (data.is_active === false || data.is_active === 0 || data.is_active === '0' ? 0 : 1);

        const autoPlaylistVal = isPostgres
            ? (data.in_auto_playlist === false || data.in_auto_playlist === 0 || data.in_auto_playlist === '0' ? false : true)
            : (data.in_auto_playlist === false || data.in_auto_playlist === 0 || data.in_auto_playlist === '0' ? 0 : 1);

        const validSections = ['general', 'semillas', 'ambas'];
        const targetSection = validSections.includes(data.target_section) ? data.target_section : 'general';

        const params = [
            data.title,
            data.artist || 'Hablemos de YHWH',
            data.category || 'Alabanza',
            targetSection,
            autoPlaylistVal,
            data.description || null,
            data.lyrics || null,
            data.audio_url,
            data.cover_image || null,
            data.duration_label || null,
            Number.isFinite(Number(data.sort_order)) ? Number(data.sort_order) : 0,
            activeVal,
            id
        ];

        const sql = `
            UPDATE music_tracks
            SET title = ?,
                artist = ?,
                category = ?,
                target_section = ?,
                in_auto_playlist = ?,
                description = ?,
                lyrics = ?,
                audio_url = ?,
                cover_image = ?,
                duration_label = ?,
                sort_order = ?,
                is_active = ?
            WHERE id = ?
        `;
        await db.query(sql, params);
    }

    static async toggleActive(id) {
        await this.ensureTable();
        const item = await this.getById(id);
        if (!item) return;
        const isPostgres = !!process.env.DATABASE_URL;
        const nextVal = isPostgres ? !item.is_active : (item.is_active ? 0 : 1);
        await db.query('UPDATE music_tracks SET is_active = ? WHERE id = ?', [nextVal, id]);
    }

    static async toggleAutoPlaylist(id) {
        await this.ensureTable();
        const item = await this.getById(id);
        if (!item) return;
        const isPostgres = !!process.env.DATABASE_URL;
        const nextVal = isPostgres ? !item.in_auto_playlist : (item.in_auto_playlist ? 0 : 1);
        await db.query('UPDATE music_tracks SET in_auto_playlist = ? WHERE id = ?', [nextVal, id]);
    }

    static async incrementPlay(id) {
        await this.ensureTable();
        await db.query('UPDATE music_tracks SET plays_count = COALESCE(plays_count, 0) + 1 WHERE id = ?', [id]);
    }

    static async incrementDownload(id) {
        await this.ensureTable();
        await db.query('UPDATE music_tracks SET downloads_count = COALESCE(downloads_count, 0) + 1 WHERE id = ?', [id]);
    }

    static async delete(id) {
        await this.ensureTable();
        await db.query('DELETE FROM music_tracks WHERE id = ?', [id]);
    }
}

module.exports = MusicTrack;
