const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const db = require('../config/db');

async function migrate() {
    console.log('=== Iniciando migración de tabla aliyot en la Base de Datos ===');
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
        console.log('✅ Tabla aliyot creada o verificada correctamente');

        try {
            await db.query('ALTER TABLE aliyot ADD COLUMN IF NOT EXISTS content_hebrew LONGTEXT AFTER content;');
            await db.query('ALTER TABLE aliyot ADD COLUMN IF NOT EXISTS content_phonetic LONGTEXT AFTER content_hebrew;');
            console.log('✅ Columnas content_hebrew y content_phonetic agregadas');
        } catch(e) {
            console.log('ℹ️ Columnas ya existentes:', e.message);
        }

        try {
            await db.query('ALTER TABLE parashot ADD UNIQUE INDEX IF NOT EXISTS unique_parasha_num (parasha_number);');
            console.log('✅ Índice unique_parasha_num verificado');
        } catch(e) {
            console.log('ℹ️ Índice ya existente:', e.message);
        }

        const [tables] = await db.query('SHOW TABLES');
        console.log('📋 Tablas actuales en la DB:', tables.map(t => Object.values(t)[0]).join(', '));
        process.exit(0);
    } catch(err) {
        console.error('❌ Error en migración:', err);
        process.exit(1);
    }
}

migrate();
