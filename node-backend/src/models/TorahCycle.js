const db = require('../config/db');
const fs = require('fs');
const path = require('path');

class TorahCycle {
    /**
     * Asegura que existan las tablas para ciclos históricos y archivo
     */
    static async ensureTables() {
        try {
            // 1. Tabla de ciclos
            await db.query(`
                CREATE TABLE IF NOT EXISTS torah_cycles (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(150) NOT NULL,
                    year_label VARCHAR(50) DEFAULT '',
                    start_date DATE NULL,
                    end_date DATE NULL,
                    notes TEXT NULL,
                    is_current TINYINT(1) DEFAULT 0,
                    archived_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            `);

            // 2. Tabla histórica de Parashot
            await db.query(`
                CREATE TABLE IF NOT EXISTS historical_parashot (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    cycle_id INT NOT NULL,
                    original_id INT NULL,
                    parasha_number INT NULL,
                    title VARCHAR(255) NOT NULL,
                    subtitle VARCHAR(255) DEFAULT '',
                    description TEXT NULL,
                    content LONGTEXT NULL,
                    image_url VARCHAR(500) DEFAULT '',
                    pdf_file VARCHAR(500) DEFAULT '',
                    icon VARCHAR(100) DEFAULT 'bi-journal-text',
                    link VARCHAR(255) DEFAULT '',
                    youtube_link VARCHAR(255) DEFAULT '',
                    views INT DEFAULT 0,
                    is_published TINYINT(1) DEFAULT 1,
                    archived_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    INDEX idx_hp_cycle (cycle_id),
                    INDEX idx_hp_num (parasha_number),
                    FOREIGN KEY (cycle_id) REFERENCES torah_cycles(id) ON DELETE CASCADE
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            `);

            // 3. Tabla histórica de Aliyot
            await db.query(`
                CREATE TABLE IF NOT EXISTS historical_aliyot (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    cycle_id INT NOT NULL,
                    historical_parasha_id INT NULL,
                    original_id INT NULL,
                    aliyah_number INT NOT NULL,
                    title VARCHAR(255) NOT NULL,
                    verses_reference VARCHAR(255) DEFAULT '',
                    content LONGTEXT NULL,
                    content_hebrew LONGTEXT NULL,
                    content_phonetic LONGTEXT NULL,
                    audio_url LONGTEXT NULL,
                    reading_date DATE NULL,
                    is_published TINYINT(1) DEFAULT 1,
                    archived_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    INDEX idx_ha_cycle (cycle_id),
                    INDEX idx_ha_parasha (historical_parasha_id),
                    FOREIGN KEY (cycle_id) REFERENCES torah_cycles(id) ON DELETE CASCADE
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            `);

            // 4. Tabla histórica de Haftarot
            await db.query(`
                CREATE TABLE IF NOT EXISTS historical_haftarot (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    cycle_id INT NOT NULL,
                    historical_parasha_id INT NULL,
                    original_id INT NULL,
                    title VARCHAR(255) NOT NULL,
                    subtitle VARCHAR(255) DEFAULT '',
                    parasha_reference VARCHAR(255) DEFAULT '',
                    description TEXT NULL,
                    content LONGTEXT NULL,
                    image_url VARCHAR(500) DEFAULT '',
                    youtube_link VARCHAR(255) DEFAULT '',
                    audio_url LONGTEXT NULL,
                    author VARCHAR(150) DEFAULT 'Moréh Kalev Aquerman',
                    author_role VARCHAR(150) DEFAULT 'Moréh',
                    author_img VARCHAR(500) DEFAULT '/assets/img/team/kaleb.jpg',
                    authors LONGTEXT NULL,
                    views INT DEFAULT 0,
                    is_published TINYINT(1) DEFAULT 1,
                    archived_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    INDEX idx_hh_cycle (cycle_id),
                    INDEX idx_hh_parasha (historical_parasha_id),
                    FOREIGN KEY (cycle_id) REFERENCES torah_cycles(id) ON DELETE CASCADE
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            `);

            console.log('✅ Tablas históricas de Torá verificadas/creadas correctamente.');
        } catch (err) {
            console.error('⚠️ Error en ensureTables TorahCycle:', err.message);
        }
    }

    /**
     * Obtener o inicializar el ciclo activo actual
     */
    static async getCurrentCycle() {
        await this.ensureTables();
        let [rows] = await db.query('SELECT * FROM torah_cycles WHERE is_current = 1 ORDER BY id DESC LIMIT 1');
        if (!rows || rows.length === 0) {
            const [all] = await db.query('SELECT * FROM torah_cycles ORDER BY id DESC LIMIT 1');
            if (all && all.length > 0) {
                await db.query('UPDATE torah_cycles SET is_current = 1 WHERE id = ?', [all[0].id]);
                rows = all;
            } else {
                const currentYear = new Date().getFullYear();
                const defaultName = `Ciclo ${currentYear} - ${currentYear + 1}`;
                const [insertRes] = await db.query(
                    'INSERT INTO torah_cycles (name, year_label, start_date, is_current, notes) VALUES (?, ?, CURDATE(), 1, ?)',
                    [defaultName, `${currentYear}-${currentYear + 1}`, 'Ciclo activo actual de lectura de la Torá']
                );
                const [created] = await db.query('SELECT * FROM torah_cycles WHERE id = ?', [insertRes.insertId]);
                rows = created;
            }
        }
        return rows && rows[0] ? rows[0] : null;
    }

    /**
     * Establecer un ciclo como el activo
     */
    static async setCurrentCycle(id) {
        await this.ensureTables();
        await db.query('UPDATE torah_cycles SET is_current = 0');
        await db.query('UPDATE torah_cycles SET is_current = 1 WHERE id = ?', [id]);
        return await this.getCycleById(id);
    }

    /**
     * Crear un nuevo ciclo
     */
    static async createCycle({ name, yearLabel = '', notes = '', isCurrent = true }) {
        await this.ensureTables();
        if (isCurrent) {
            await db.query('UPDATE torah_cycles SET is_current = 0');
        }
        const [res] = await db.query(
            'INSERT INTO torah_cycles (name, year_label, start_date, is_current, notes) VALUES (?, ?, CURDATE(), ?, ?)',
            [name.trim(), yearLabel.trim(), isCurrent ? 1 : 0, notes.trim()]
        );
        return await this.getCycleById(res.insertId);
    }

    /**
     * Obtener todos los ciclos archivados
     */
    static async getAllCycles() {
        await this.ensureTables();
        const [rows] = await db.query(`
            SELECT c.*, 
                   COUNT(DISTINCT hp.id) as parashot_count,
                   COUNT(DISTINCT ha.id) as aliyot_count,
                   COUNT(DISTINCT hh.id) as haftarot_count
            FROM torah_cycles c
            LEFT JOIN historical_parashot hp ON c.id = hp.cycle_id
            LEFT JOIN historical_aliyot ha ON c.id = ha.cycle_id
            LEFT JOIN historical_haftarot hh ON c.id = hh.cycle_id
            GROUP BY c.id
            ORDER BY c.is_current DESC, c.archived_at DESC, c.id DESC
        `);
        return rows || [];
    }

    /**
     * Obtener un ciclo por su ID
     */
    static async getCycleById(id) {
        await this.ensureTables();
        const [rows] = await db.query('SELECT * FROM torah_cycles WHERE id = ?', [id]);
        return rows && rows[0] ? rows[0] : null;
    }

    /**
     * Obtener Parashot históricas de un ciclo
     */
    static async getHistoricalParashot(cycleId) {
        await this.ensureTables();
        const [rows] = await db.query(
            'SELECT * FROM historical_parashot WHERE cycle_id = ? ORDER BY CAST(parasha_number AS UNSIGNED) ASC, id ASC',
            [cycleId]
        );
        return rows || [];
    }

    /**
     * Obtener Parasha histórica por ID
     */
    static async getHistoricalParashaById(id) {
        await this.ensureTables();
        const [rows] = await db.query(`
            SELECT hp.*, tc.name as cycle_name, tc.year_label as cycle_year
            FROM historical_parashot hp
            JOIN torah_cycles tc ON hp.cycle_id = tc.id
            WHERE hp.id = ?
        `, [id]);
        return rows && rows[0] ? rows[0] : null;
    }

    /**
     * Obtener Aliyot históricas de un ciclo (opcionalmente filtrado por parashá histórica)
     */
    static async getHistoricalAliyot(cycleId, historicalParashaId = null) {
        await this.ensureTables();
        let sql = `
            SELECT ha.*, hp.title as parasha_title, hp.parasha_number, hp.subtitle as parasha_subtitle
            FROM historical_aliyot ha
            LEFT JOIN historical_parashot hp ON ha.historical_parasha_id = hp.id
            WHERE ha.cycle_id = ?
        `;
        const params = [cycleId];
        if (historicalParashaId) {
            sql += ' AND ha.historical_parasha_id = ?';
            params.push(historicalParashaId);
        }
        sql += ' ORDER BY CAST(hp.parasha_number AS UNSIGNED) ASC, ha.aliyah_number ASC';
        const [rows] = await db.query(sql, params);

        const Aliyah = require('./Aliyah');
        return (rows || []).map(r => ({
            ...r,
            audios: Aliyah.parseAudios(r.audio_url)
        }));
    }

    /**
     * Obtener Haftarot históricas de un ciclo
     */
    static async getHistoricalHaftarot(cycleId) {
        await this.ensureTables();
        const [rows] = await db.query(`
            SELECT hh.*, hp.title as parasha_title, hp.parasha_number, hp.subtitle as parasha_subtitle
            FROM historical_haftarot hh
            LEFT JOIN historical_parashot hp ON hh.historical_parasha_id = hp.id
            WHERE hh.cycle_id = ?
            ORDER BY CAST(hp.parasha_number AS UNSIGNED) ASC, hh.id ASC
        `, [cycleId]);

        const Haftara = require('./Haftara');
        return (rows || []).map(r => Haftara.normalize(r));
    }

    /**
     * Obtener Haftará histórica por ID
     */
    static async getHistoricalHaftaraById(id) {
        await this.ensureTables();
        const [rows] = await db.query(`
            SELECT hh.*, hp.title as parasha_title, hp.parasha_number, hp.subtitle as parasha_subtitle,
                   tc.name as cycle_name, tc.year_label as cycle_year
            FROM historical_haftarot hh
            LEFT JOIN historical_parashot hp ON hh.historical_parasha_id = hp.id
            JOIN torah_cycles tc ON hh.cycle_id = tc.id
            WHERE hh.id = ?
        `, [id]);

        if (!rows || !rows[0]) return null;
        const Haftara = require('./Haftara');
        return Haftara.normalize(rows[0]);
    }

    /**
     * Crear copia en base de datos secundaria 'hablemos_yhwh_historico' y generar archivo .sql
     */
    static async exportToSecondaryDatabaseAndFile(cycleId, cycleName, currentData) {
        const result = { dbCreated: false, sqlFilePath: null, error: null };
        try {
            // 1. Intentar crear y poblar la base de datos externa 'hablemos_yhwh_historico'
            try {
                await db.query('CREATE DATABASE IF NOT EXISTS hablemos_yhwh_historico CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
                
                // Crear tablas en la base de datos histórica si no existen
                await db.query(`
                    CREATE TABLE IF NOT EXISTS hablemos_yhwh_historico.torah_cycles (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        name VARCHAR(150) NOT NULL,
                        year_label VARCHAR(50) DEFAULT '',
                        start_date DATE NULL,
                        end_date DATE NULL,
                        notes TEXT NULL,
                        archived_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
                `);

                await db.query(`
                    CREATE TABLE IF NOT EXISTS hablemos_yhwh_historico.parashot (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        cycle_id INT NOT NULL,
                        parasha_number INT NULL,
                        title VARCHAR(255) NOT NULL,
                        subtitle VARCHAR(255) DEFAULT '',
                        description TEXT NULL,
                        content LONGTEXT NULL,
                        image_url VARCHAR(500) DEFAULT '',
                        pdf_file VARCHAR(500) DEFAULT '',
                        icon VARCHAR(100) DEFAULT 'bi-journal-text',
                        link VARCHAR(255) DEFAULT '',
                        youtube_link VARCHAR(255) DEFAULT '',
                        views INT DEFAULT 0,
                        archived_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
                `);

                await db.query(`
                    CREATE TABLE IF NOT EXISTS hablemos_yhwh_historico.aliyot (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        cycle_id INT NOT NULL,
                        parasha_id INT NULL,
                        aliyah_number INT NOT NULL,
                        title VARCHAR(255) NOT NULL,
                        verses_reference VARCHAR(255) DEFAULT '',
                        content LONGTEXT NULL,
                        content_hebrew LONGTEXT NULL,
                        content_phonetic LONGTEXT NULL,
                        audio_url LONGTEXT NULL,
                        reading_date DATE NULL,
                        archived_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
                `);

                await db.query(`
                    CREATE TABLE IF NOT EXISTS hablemos_yhwh_historico.haftarot (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        cycle_id INT NOT NULL,
                        parasha_id INT NULL,
                        title VARCHAR(255) NOT NULL,
                        subtitle VARCHAR(255) DEFAULT '',
                        parasha_reference VARCHAR(255) DEFAULT '',
                        description TEXT NULL,
                        content LONGTEXT NULL,
                        image_url VARCHAR(500) DEFAULT '',
                        youtube_link VARCHAR(255) DEFAULT '',
                        audio_url LONGTEXT NULL,
                        author VARCHAR(150) DEFAULT 'Moréh Kalev Aquerman',
                        author_role VARCHAR(150) DEFAULT 'Moréh',
                        author_img VARCHAR(500) DEFAULT '/assets/img/team/kaleb.jpg',
                        authors LONGTEXT NULL,
                        views INT DEFAULT 0,
                        archived_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
                `);

                // Insertar ciclo en la base de datos secundaria
                await db.query(`
                    INSERT INTO hablemos_yhwh_historico.torah_cycles (id, name, year_label, notes) 
                    VALUES (?, ?, ?, ?)
                    ON DUPLICATE KEY UPDATE name = VALUES(name)
                `, [cycleId, cycleName, currentData.yearLabel || '', currentData.notes || '']);

                // Copiar parashot
                for (const p of currentData.parashot) {
                    await db.query(`
                        INSERT INTO hablemos_yhwh_historico.parashot 
                        (cycle_id, parasha_number, title, subtitle, description, content, image_url, pdf_file, icon, link, youtube_link, views)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    `, [cycleId, p.parasha_number, p.title, p.subtitle || '', p.description || '', p.content || '', p.image_url || '', p.pdf_file || '', p.icon || '', p.link || '', p.youtube_link || '', p.views || 0]);
                }

                // Copiar aliyot
                for (const a of currentData.aliyot) {
                    await db.query(`
                        INSERT INTO hablemos_yhwh_historico.aliyot
                        (cycle_id, parasha_id, aliyah_number, title, verses_reference, content, content_hebrew, content_phonetic, audio_url, reading_date)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    `, [cycleId, a.parasha_id, a.aliyah_number, a.title, a.verses_reference || '', a.content || '', a.content_hebrew || '', a.content_phonetic || '', a.audio_url || '', a.reading_date || null]);
                }

                // Copiar haftarot
                for (const h of currentData.haftarot) {
                    await db.query(`
                        INSERT INTO hablemos_yhwh_historico.haftarot
                        (cycle_id, parasha_id, title, subtitle, parasha_reference, description, content, image_url, youtube_link, audio_url, author, author_role, author_img, authors, views)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    `, [cycleId, h.parasha_id, h.title, h.subtitle || '', h.parasha_reference || '', h.description || '', h.content || '', h.image_url || '', h.youtube_link || '', h.audio_url || '', h.author || '', h.author_role || '', h.author_img || '', h.authors ? (typeof h.authors === 'string' ? h.authors : JSON.stringify(h.authors)) : null, h.views || 0]);
                }

                result.dbCreated = true;
                console.log('✅ Base de datos hablemos_yhwh_historico creada y sincronizada con éxito.');
            } catch (secDbErr) {
                console.warn('⚠️ Nota sobre base de datos secundaria (permisos MySQL):', secDbErr.message);
                result.error = secDbErr.message;
            }

            // 2. Generar archivo de volcado SQL descargable
            const backupsDir = path.join(__dirname, '../../../database/backups');
            if (!fs.existsSync(backupsDir)) {
                fs.mkdirSync(backupsDir, { recursive: true });
            }
            const cleanName = cycleName.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
            const fileName = `ciclo_historico_${cycleId}_${cleanName}_${Date.now()}.sql`;
            const filePath = path.join(backupsDir, fileName);

            let sqlDump = `-- ====================================================\n`;
            sqlDump += `-- RESPALDO HISTÓRICO: ${cycleName}\n`;
            sqlDump += `-- Generado: ${new Date().toISOString()}\n`;
            sqlDump += `-- ====================================================\n\n`;

            sqlDump += `-- PARASHOT (${currentData.parashot.length} registros)\n`;
            for (const p of currentData.parashot) {
                sqlDump += `INSERT INTO parashot_historico (cycle_id, parasha_number, title, subtitle, description, youtube_link, pdf_file) VALUES (${cycleId}, ${p.parasha_number || 'NULL'}, ${JSON.stringify(p.title || '')}, ${JSON.stringify(p.subtitle || '')}, ${JSON.stringify(p.description || '')}, ${JSON.stringify(p.youtube_link || '')}, ${JSON.stringify(p.pdf_file || '')});\n`;
            }

            sqlDump += `\n-- ALIYOT (${currentData.aliyot.length} registros)\n`;
            for (const a of currentData.aliyot) {
                sqlDump += `INSERT INTO aliyot_historico (cycle_id, parasha_id, aliyah_number, title, verses_reference, audio_url) VALUES (${cycleId}, ${a.parasha_id || 'NULL'}, ${a.aliyah_number}, ${JSON.stringify(a.title || '')}, ${JSON.stringify(a.verses_reference || '')}, ${JSON.stringify(a.audio_url || '')});\n`;
            }

            sqlDump += `\n-- HAFTAROT (${currentData.haftarot.length} registros)\n`;
            for (const h of currentData.haftarot) {
                sqlDump += `INSERT INTO haftarot_historico (cycle_id, parasha_id, title, subtitle, youtube_link, audio_url) VALUES (${cycleId}, ${h.parasha_id || 'NULL'}, ${JSON.stringify(h.title || '')}, ${JSON.stringify(h.subtitle || '')}, ${JSON.stringify(h.youtube_link || '')}, ${JSON.stringify(h.audio_url || '')});\n`;
            }

            fs.writeFileSync(filePath, sqlDump, 'utf8');
            result.sqlFilePath = `/database/backups/${fileName}`;
            result.fileName = fileName;

        } catch (dumpErr) {
            console.warn('⚠️ Error generando volcado SQL:', dumpErr.message);
        }
        return result;
    }

    /**
     * EJECUTAR PASAJE HISTÓRICO Y RESETEO DEL CICLO DE LA TORÁ
     * 1. Respalda Parashot, Aliyot y Haftarot en tablas históricas.
     * 2. Exporta a base de datos secundaria y genera archivo SQL.
     * 3. Resetea los enlaces de video (YouTube), audios y contadores en la base de datos activa.
     */
    static async archiveCurrentCycleAndReset({ cycleName, yearLabel, notes, startDate, newCycleName }) {
        await this.ensureTables();

        // 1. Obtener los datos actuales completos
        const [currentParashot] = await db.query('SELECT * FROM parashot ORDER BY CAST(parasha_number AS UNSIGNED) ASC, id ASC');
        const [currentAliyot] = await db.query('SELECT * FROM aliyot ORDER BY parasha_id ASC, aliyah_number ASC');
        const [currentHaftarot] = await db.query('SELECT * FROM haftarot ORDER BY id ASC');

        const nameToSave = cycleName && cycleName.trim() ? cycleName.trim() : `Ciclo ${new Date().getFullYear() - 1} - ${new Date().getFullYear()}`;
        const labelToSave = yearLabel && yearLabel.trim() ? yearLabel.trim() : `${new Date().getFullYear() - 1}-${new Date().getFullYear()}`;

        // 2. Insertar nuevo registro en torah_cycles
        const [cycleRes] = await db.query(`
            INSERT INTO torah_cycles (name, year_label, start_date, end_date, notes, is_current)
            VALUES (?, ?, ?, ?, ?, 0)
        `, [nameToSave, labelToSave, startDate || null, new Date(), notes || 'Archivado al concluir ciclo anual de la Torá']);

        const cycleId = cycleRes.insertId;

        // 3. Insertar Parashot históricas y mapear sus IDs originales -> nuevos IDs históricos
        const parashaIdMap = new Map(); // original_id -> historical_parasha_id

        for (const p of currentParashot) {
            const [hpRes] = await db.query(`
                INSERT INTO historical_parashot 
                (cycle_id, original_id, parasha_number, title, subtitle, description, content, image_url, pdf_file, icon, link, youtube_link, views, is_published)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                cycleId,
                p.id,
                p.parasha_number,
                p.title,
                p.subtitle || '',
                p.description || '',
                p.content || '',
                p.image_url || '',
                p.pdf_file || '',
                p.icon || 'bi-journal-text',
                p.link || '',
                p.youtube_link || '',
                p.views || 0,
                p.is_published !== undefined ? p.is_published : 1
            ]);
            parashaIdMap.set(p.id, hpRes.insertId);
        }

        // 4. Insertar Aliyot históricas
        for (const a of currentAliyot) {
            const histParashaId = a.parasha_id ? (parashaIdMap.get(a.parasha_id) || null) : null;
            await db.query(`
                INSERT INTO historical_aliyot
                (cycle_id, historical_parasha_id, original_id, aliyah_number, title, verses_reference, content, content_hebrew, content_phonetic, audio_url, reading_date, is_published)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                cycleId,
                histParashaId,
                a.id,
                a.aliyah_number,
                a.title,
                a.verses_reference || '',
                a.content || '',
                a.content_hebrew || '',
                a.content_phonetic || '',
                a.audio_url || '',
                a.reading_date || null,
                a.is_published !== undefined ? a.is_published : 1
            ]);
        }

        // 5. Insertar Haftarot históricas
        for (const h of currentHaftarot) {
            const histParashaId = h.parasha_id ? (parashaIdMap.get(h.parasha_id) || null) : null;
            await db.query(`
                INSERT INTO historical_haftarot
                (cycle_id, historical_parasha_id, original_id, title, subtitle, parasha_reference, description, content, image_url, youtube_link, audio_url, author, author_role, author_img, authors, views, is_published)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                cycleId,
                histParashaId,
                h.id,
                h.title,
                h.subtitle || '',
                h.parasha_reference || '',
                h.description || '',
                h.content || '',
                h.image_url || '',
                h.youtube_link || '',
                h.audio_url || '',
                h.author || 'Moréh Kalev Aquerman',
                h.author_role || 'Moréh',
                h.author_img || '/assets/img/team/kaleb.jpg',
                h.authors ? (typeof h.authors === 'string' ? h.authors : JSON.stringify(h.authors)) : null,
                h.views || 0,
                h.is_published !== undefined ? h.is_published : 1
            ]);
        }

        // 6. Exportar a base de datos secundaria y generar archivo SQL
        const exportDetails = await this.exportToSecondaryDatabaseAndFile(cycleId, nameToSave, {
            yearLabel: labelToSave,
            notes: notes || '',
            parashot: currentParashot,
            aliyot: currentAliyot,
            haftarot: currentHaftarot
        });

        // 7. REALIZAR EL RESETEO EN LA BASE DE DATOS ACTIVA
        // A) Parashot: Limpiar videos de YouTube, PDFs subidos del ciclo anterior y reiniciar vistas a 0.
        // Se preserva la estructura canónica de las 54 Parashot (títulos, subtítulos, descripciones base e imágenes).
        await db.query(`
            UPDATE parashot 
            SET youtube_link = '', 
                pdf_file = '', 
                views = 0
        `);

        // B) Aliyot: Limpiar audios grabados del ciclo anterior y fechas de lectura para permitir subirlos nuevamente día a día.
        await db.query(`
            UPDATE aliyot 
            SET audio_url = NULL, 
                reading_date = NULL
        `);

        // C) Haftarot: Limpiar videos de YouTube, audios y reiniciar vistas para grabaciones del nuevo ciclo.
        await db.query(`
            UPDATE haftarot 
            SET youtube_link = '', 
                audio_url = NULL, 
                views = 0
        `);

        // 8. Crear el registro del Nuevo Ciclo Activo
        const newCycleTitle = newCycleName && newCycleName.trim() ? newCycleName.trim() : `Ciclo ${new Date().getFullYear()} - ${new Date().getFullYear() + 1}`;
        await db.query('UPDATE torah_cycles SET is_current = 0');
        const [ncRes] = await db.query(`
            INSERT INTO torah_cycles (name, year_label, start_date, notes, is_current)
            VALUES (?, ?, CURDATE(), 'Ciclo activo actual de la Torá iniciado después de Sucot', 1)
        `, [newCycleTitle, `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`]);
        const newCycleId = ncRes.insertId;

        // 9. Actualizar ciclo en parashot activas
        try {
            await db.query(`
                UPDATE parashot 
                SET cycle_id = ?, 
                    cycle_name = ?
            `, [newCycleId, newCycleTitle]);
        } catch (colErr) {
            console.warn('Aviso al actualizar cycle en parashot:', colErr.message);
        }

        return {
            success: true,
            cycleId,
            cycleName: nameToSave,
            parashotCount: currentParashot.length,
            aliyotCount: currentAliyot.length,
            haftarotCount: currentHaftarot.length,
            secondaryDbCreated: exportDetails.dbCreated,
            backupSqlFile: exportDetails.sqlFilePath,
            fileName: exportDetails.fileName
        };
    }

    /**
     * Eliminar un ciclo histórico
     */
    static async deleteCycle(cycleId) {
        await this.ensureTables();
        return await db.query('DELETE FROM torah_cycles WHERE id = ?', [cycleId]);
    }
}

module.exports = TorahCycle;
