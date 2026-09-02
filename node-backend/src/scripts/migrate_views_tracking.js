const db = require('../config/db');

async function run() {
    try {
        console.log('--- Iniciando migración de contador de visualizaciones ---');

        // 1. Columnas views para ensenanzas
        await db.query(`ALTER TABLE ensenanzas ADD COLUMN IF NOT EXISTS views INT DEFAULT 0`);
        console.log('✅ Columna views agregada/verificada en ensenanzas');

        // 2. Columnas views para parashot
        await db.query(`ALTER TABLE parashot ADD COLUMN IF NOT EXISTS views INT DEFAULT 0`);
        console.log('✅ Columna views agregada/verificada en parashot');

        // 3. Columnas views para haftarot
        await db.query(`ALTER TABLE haftarot ADD COLUMN IF NOT EXISTS views INT DEFAULT 0`);
        console.log('✅ Columna views agregada/verificada en haftarot');

        // 4. Crear o actualizar semillas_torah
        await db.query(`
            CREATE TABLE IF NOT EXISTS semillas_torah (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                subtitle VARCHAR(255),
                category VARCHAR(100) DEFAULT 'Parashá Infantil',
                description TEXT,
                content LONGTEXT,
                image_url VARCHAR(500),
                pdf_file VARCHAR(500),
                video_file VARCHAR(500),
                youtube_link VARCHAR(500),
                author VARCHAR(100) DEFAULT 'Elva Avila',
                views INT DEFAULT 0,
                is_published BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        await db.query(`ALTER TABLE semillas_torah ADD COLUMN IF NOT EXISTS views INT DEFAULT 0`);
        console.log('✅ Tabla y columna views agregada/verificada en semillas_torah');

        // 5. Columnas views_count en semillas_shorts
        await db.query(`
            CREATE TABLE IF NOT EXISTS semillas_shorts (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                youtube_url VARCHAR(500) NOT NULL,
                video_id VARCHAR(50),
                description TEXT,
                category VARCHAR(100) DEFAULT 'Shorts',
                author VARCHAR(100) DEFAULT 'Elva Avila',
                views_count INT DEFAULT 0,
                is_published BOOLEAN DEFAULT TRUE,
                display_order INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        await db.query(`ALTER TABLE semillas_shorts ADD COLUMN IF NOT EXISTS views_count INT DEFAULT 0`);
        console.log('✅ Columna views_count agregada/verificada en semillas_shorts');

        // 6. Verificar blog_posts
        await db.query(`ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS views INT DEFAULT 0`);
        console.log('✅ Columna views agregada/verificada en blog_posts');

        console.log('--- Migración de visualizaciones completada con éxito ---');
        process.exit(0);
    } catch (err) {
        console.error('Error en migración de visualizaciones:', err);
        process.exit(1);
    }
}

run();
