const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const db = require('../config/db');

const ALL_54_PARASHOT = [
    [1, 'Bereshit', 'Génesis 1:1 al 6:8', 'Porción 1: Génesis 1:1 al 6:8', '<p>Estudio de la porción <strong>Bereshit</strong> (Génesis 1:1 al 6:8).</p>'],
    [2, 'Noaj', 'Génesis 6:9 al 11:32', 'Porción 2: Génesis 6:9 al 11:32', '<p>Estudio de la porción <strong>Noaj</strong> (Génesis 6:9 al 11:32).</p>'],
    [3, 'Lej Lejá', 'Génesis 12:1 al 17:27', 'Porción 3: Génesis 12:1 al 17:27', '<p>Estudio de la porción <strong>Lej Lejá</strong> (Génesis 12:1 al 17:27).</p>'],
    [4, 'Vayerá', 'Génesis 18:1 al 22:24', 'Porción 4: Génesis 18:1 al 22:24', '<p>Estudio de la porción <strong>Vayerá</strong> (Génesis 18:1 al 22:24).</p>'],
    [5, 'Jayei Sarah', 'Génesis 23:1 al 25:18', 'Porción 5: Génesis 23:1 al 25:18', '<p>Estudio de la porción <strong>Jayei Sarah</strong> (Génesis 23:1 al 25:18).</p>'],
    [6, 'Toldot', 'Génesis 25:19 al 28:9', 'Porción 6: Génesis 25:19 al 28:9', '<p>Estudio de la porción <strong>Toldot</strong> (Génesis 25:19 al 28:9).</p>'],
    [7, 'Vayetze', 'Génesis 28:10 al 32:3', 'Porción 7: Génesis 28:10 al 32:3', '<p>Estudio de la porción <strong>Vayetze</strong> (Génesis 28:10 al 32:3).</p>'],
    [8, 'Vayishlaj', 'Génesis 32:4 al 36:43', 'Porción 8: Génesis 32:4 al 36:43', '<p>Estudio de la porción <strong>Vayishlaj</strong> (Génesis 32:4 al 36:43).</p>'],
    [9, 'Vayeshev', 'Génesis 37:1 al 40:23', 'Porción 9: Génesis 37:1 al 40:23', '<p>Estudio de la porción <strong>Vayeshev</strong> (Génesis 37:1 al 40:23).</p>'],
    [10, 'Miketz', 'Génesis 41:1 al 44:17', 'Porción 10: Génesis 41:1 al 44:17', '<p>Estudio de la porción <strong>Miketz</strong> (Génesis 41:1 al 44:17).</p>'],
    [11, 'Vayigash', 'Génesis 44:18 al 47:27', 'Porción 11: Génesis 44:18 al 47:27', '<p>Estudio de la porción <strong>Vayigash</strong> (Génesis 44:18 al 47:27).</p>'],
    [12, 'Vayeji', 'Génesis 47:28 al 50:26', 'Porción 12: Génesis 47:28 al 50:26', '<p>Estudio de la porción <strong>Vayeji</strong> (Génesis 47:28 al 50:26).</p>'],
    [13, 'Shemot', 'Éxodo 1:1 al 6:1', 'Porción 13: Éxodo 1:1 al 6:1', '<p>Estudio de la porción <strong>Shemot</strong> (Éxodo 1:1 al 6:1).</p>'],
    [14, 'Vaerá', 'Éxodo 6:2 al 9:35', 'Porción 14: Éxodo 6:2 al 9:35', '<p>Estudio de la porción <strong>Vaerá</strong> (Éxodo 6:2 al 9:35).</p>'],
    [15, 'Bo', 'Éxodo 10:1 al 13:16', 'Porción 15: Éxodo 10:1 al 13:16', '<p>Estudio de la porción <strong>Bo</strong> (Éxodo 10:1 al 13:16).</p>'],
    [16, 'Beshalaj', 'Éxodo 13:17 al 17:16', 'Porción 16: Éxodo 13:17 al 17:16', '<p>Estudio de la porción <strong>Beshalaj</strong> (Éxodo 13:17 al 17:16).</p>'],
    [17, 'Yitró', 'Éxodo 18:1 al 20:23', 'Porción 17: Éxodo 18:1 al 20:23', '<p>Estudio de la porción <strong>Yitró</strong> (Éxodo 18:1 al 20:23).</p>'],
    [18, 'Mishpatim', 'Éxodo 21:1 al 24:18', 'Porción 18: Éxodo 21:1 al 24:18', '<p>Estudio de la porción <strong>Mishpatim</strong> (Éxodo 21:1 al 24:18).</p>'],
    [19, 'Terumah', 'Éxodo 25:1 al 27:19', 'Porción 19: Éxodo 25:1 al 27:19', '<p>Estudio de la porción <strong>Terumah</strong> (Éxodo 25:1 al 27:19).</p>'],
    [20, 'Tetzaveh', 'Éxodo 27:20 al 30:10', 'Porción 20: Éxodo 27:20 al 30:10', '<p>Estudio de la porción <strong>Tetzaveh</strong> (Éxodo 27:20 al 30:10).</p>'],
    [21, 'Ki Tisá', 'Éxodo 30:11 al 34:35', 'Porción 21: Éxodo 30:11 al 34:35', '<p>Estudio de la porción <strong>Ki Tisá</strong> (Éxodo 30:11 al 34:35).</p>'],
    [22, 'Vayakhel', 'Éxodo 35:1 al 38:20', 'Porción 22: Éxodo 35:1 al 38:20', '<p>Estudio de la porción <strong>Vayakhel</strong> (Éxodo 35:1 al 38:20).</p>'],
    [23, 'Pekudei', 'Éxodo 38:21 al 40:38', 'Porción 23: Éxodo 38:21 al 40:38', '<p>Estudio de la porción <strong>Pekudei</strong> (Éxodo 38:21 al 40:38).</p>'],
    [24, 'Vayikrá', 'Levítico 1:1 al 5:26', 'Porción 24: Levítico 1:1 al 5:26', '<p>Estudio de la porción <strong>Vayikrá</strong> (Levítico 1:1 al 5:26).</p>'],
    [25, 'Tzav', 'Levítico 6:1 al 8:36', 'Porción 25: Levítico 6:1 al 8:36', '<p>Estudio de la porción <strong>Tzav</strong> (Levítico 6:1 al 8:36).</p>'],
    [26, 'Sheminí', 'Levítico 9:1 al 11:47', 'Porción 26: Levítico 9:1 al 11:47', '<p>Estudio de la porción <strong>Sheminí</strong> (Levítico 9:1 al 11:47).</p>'],
    [27, 'Tazria', 'Levítico 12:1 al 13:59', 'Porción 27: Levítico 12:1 al 13:59', '<p>Estudio de la porción <strong>Tazria</strong> (Levítico 12:1 al 13:59).</p>'],
    [28, 'Metzorá', 'Levítico 14:1 al 15:33', 'Porción 28: Levítico 14:1 al 15:33', '<p>Estudio de la porción <strong>Metzorá</strong> (Levítico 14:1 al 15:33).</p>'],
    [29, 'Ajarei Mot', 'Levítico 16:1 al 18:30', 'Porción 29: Levítico 16:1 al 18:30', '<p>Estudio de la porción <strong>Ajarei Mot</strong> (Levítico 16:1 al 18:30).</p>'],
    [30, 'Kedoshim', 'Levítico 19:1 al 20:27', 'Porción 30: Levítico 19:1 al 20:27', '<p>Estudio de la porción <strong>Kedoshim</strong> (Levítico 19:1 al 20:27).</p>'],
    [31, 'Emor', 'Levítico 21:1 al 24:23', 'Porción 31: Levítico 21:1 al 24:23', '<p>Estudio de la porción <strong>Emor</strong> (Levítico 21:1 al 24:23).</p>'],
    [32, 'Behar', 'Levítico 25:1 al 26:2', 'Porción 32: Levítico 25:1 al 26:2', '<p>Estudio de la porción <strong>Behar</strong> (Levítico 25:1 al 26:2).</p>'],
    [33, 'Bejukotai', 'Levítico 26:3 al 27:34', 'Porción 33: Levítico 26:3 al 27:34', '<p>Estudio de la porción <strong>Bejukotai</strong> (Levítico 26:3 al 27:34).</p>'],
    [34, 'Bemidbar', 'Números 1:1 al 4:20', 'Porción 34: Números 1:1 al 4:20', '<p>Estudio de la porción <strong>Bemidbar</strong> (Números 1:1 al 4:20).</p>'],
    [35, 'Nasó', 'Números 4:21 al 7:89', 'Porción 35: Números 4:21 al 7:89', '<p>Estudio de la porción <strong>Nasó</strong> (Números 4:21 al 7:89).</p>'],
    [36, 'Behaalotjá', 'Números 8:1 al 12:16', 'Porción 36: Números 8:1 al 12:16', '<p>Estudio de la porción <strong>Behaalotjá</strong> (Números 8:1 al 12:16).</p>'],
    [37, 'Shelaj Lejá', 'Números 13:1 al 15:41', 'Porción 37: Números 13:1 al 15:41', '<p>Estudio de la porción <strong>Shelaj Lejá</strong> (Números 13:1 al 15:41).</p>'],
    [38, 'Kóraj', 'Números 16:1 al 18:32', 'Porción 38: Números 16:1 al 18:32', '<p>Estudio de la porción <strong>Kóraj</strong> (Números 16:1 al 18:32).</p>'],
    [39, 'Jukat', 'Números 19:1 al 22:1', 'Porción 39: Números 19:1 al 22:1', '<p>Estudio de la porción <strong>Jukat</strong> (Números 19:1 al 22:1).</p>'],
    [40, 'Balak', 'Números 22:2 al 25:9', 'Porción 40: Números 22:2 al 25:9', '<p>Estudio de la porción <strong>Balak</strong> (Números 22:2 al 25:9).</p>'],
    [41, 'Pinjás', 'Números 25:10 al 30:1', 'Porción 41: Números 25:10 al 30:1', '<p>Estudio de la porción <strong>Pinjás</strong> (Números 25:10 al 30:1).</p>'],
    [42, 'Matot', 'Números 30:2 al 32:42', 'Porción 42: Números 30:2 al 32:42', '<p>Estudio de la porción <strong>Matot</strong> (Números 30:2 al 32:42).</p>'],
    [43, 'Masei', 'Números 33:1 al 36:13', 'Porción 43: Números 33:1 al 36:13', '<p>Estudio de la porción <strong>Masei</strong> (Números 33:1 al 36:13).</p>'],
    [44, 'Devarim', 'Deuteronomio 1:1 al 3:22', 'Porción 44: Deuteronomio 1:1 al 3:22', '<p>Estudio de la porción <strong>Devarim</strong> (Deuteronomio 1:1 al 3:22).</p>'],
    [45, 'Vaetjanán', 'Deuteronomio 3:23 al 7:11', 'Porción 45: Deuteronomio 3:23 al 7:11', '<p>Estudio de la porción <strong>Vaetjanán</strong> (Deuteronomio 3:23 al 7:11).</p>'],
    [46, 'Ekev', 'Deuteronomio 7:12 al 11:25', 'Porción 46: Deuteronomio 7:12 al 11:25', '<p>Estudio de la porción <strong>Ekev</strong> (Deuteronomio 7:12 al 11:25).</p>'],
    [47, 'Reeh', 'Deuteronomio 11:26 al 16:17', 'Porción 47: Deuteronomio 11:26 al 16:17', '<p>Estudio de la porción <strong>Reeh</strong> (Deuteronomio 11:26 al 16:17).</p>'],
    [48, 'Shofetim', 'Deuteronomio 16:18 al 21:9', 'Porción 48: Deuteronomio 16:18 al 21:9', '<p>Estudio de la porción <strong>Shofetim</strong> (Deuteronomio 16:18 al 21:9).</p>'],
    [49, 'Ki Tetzé', 'Deuteronomio 21:10 al 25:19', 'Porción 49: Deuteronomio 21:10 al 25:19', '<p>Estudio de la porción <strong>Ki Tetzé</strong> (Deuteronomio 21:10 al 25:19).</p>'],
    [50, 'Ki Tavó', 'Deuteronomio 26:1 al 29:8', 'Porción 50: Deuteronomio 26:1 al 29:8', '<p>Estudio de la porción <strong>Ki Tavó</strong> (Deuteronomio 26:1 al 29:8).</p>'],
    [51, 'Nitzavim', 'Deuteronomio 29:9 al 30:20', 'Porción 51: Deuteronomio 29:9 al 30:20', '<p>Estudio de la porción <strong>Nitzavim</strong> (Deuteronomio 29:9 al 30:20).</p>'],
    [52, 'Vayélej', 'Deuteronomio 31:1 al 31:30', 'Porción 52: Deuteronomio 31:1 al 31:30', '<p>Estudio de la porción <strong>Vayélej</strong> (Deuteronomio 31:1 al 31:30).</p>'],
    [53, 'Haazinu', 'Deuteronomio 32:1 al 32:52', 'Porción 53: Deuteronomio 32:1 al 32:52', '<p>Estudio de la porción <strong>Haazinu</strong> (Deuteronomio 32:1 al 32:52).</p>'],
    [54, 'Vezot Haberajáh', 'Deuteronomio 33:1 al 34:12', 'Porción 54: Deuteronomio 33:1 al 34:12', '<p>Estudio de la porción <strong>Vezot Haberajáh</strong> (Deuteronomio 33:1 al 34:12).</p>']
];

async function migrate() {
    console.log('=== Iniciando migración y precarga de las 54 Parashot en la Base de Datos ===');
    console.log('Host:', process.env.DB_HOST, 'User:', process.env.DB_USER, 'Database:', process.env.DB_NAME);

    try {
        const createSql = `
            CREATE TABLE IF NOT EXISTS aliyot (
                id INT AUTO_INCREMENT PRIMARY KEY,
                parasha_id INT NULL DEFAULT NULL,
                aliyah_number INT NOT NULL,
                title VARCHAR(255) NOT NULL,
                verses_reference VARCHAR(255),
                content LONGTEXT,
                content_hebrew LONGTEXT,
                content_phonetic LONGTEXT,
                audio_url TEXT,
                reading_date DATE DEFAULT NULL,
                is_published BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (parasha_id) REFERENCES parashot(id) ON DELETE SET NULL,
                INDEX idx_parasha_aliyah (parasha_id, aliyah_number)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `;
        await db.query(createSql);
        console.log('✅ Tabla aliyot verificada/creada');

        try {
            await db.query('ALTER TABLE aliyot ADD COLUMN IF NOT EXISTS content_hebrew LONGTEXT AFTER content;');
            await db.query('ALTER TABLE aliyot ADD COLUMN IF NOT EXISTS content_phonetic LONGTEXT AFTER content_hebrew;');
        } catch(e) {}

        try {
            await db.query('ALTER TABLE parashot ADD UNIQUE INDEX IF NOT EXISTS unique_parasha_num (parasha_number);');
        } catch(e) {}

        console.log('🌱 Insertando / Actualizando las 54 Parashot del Ciclo Anual...');
        for (const p of ALL_54_PARASHOT) {
            const [pNum, title, subtitle, desc, content] = p;
            const insertSql = `
                INSERT INTO parashot (parasha_number, title, subtitle, description, content)
                VALUES (?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE 
                    title = VALUES(title),
                    subtitle = VALUES(subtitle),
                    description = VALUES(description);
            `;
            await db.query(insertSql, [pNum, title, subtitle, desc, content]);
        }
        console.log('✅ 54 Parashot precargadas con éxito en la base de datos');

        const [pCount] = await db.query('SELECT COUNT(*) as total FROM parashot');
        console.log(`📊 Total de Parashot en la base de datos: ${pCount[0].total}`);

        process.exit(0);
    } catch(err) {
        console.error('❌ Error en migración:', err);
        process.exit(1);
    }
}

migrate();
