const db = require('../config/db');

async function run() {
    try {
        console.log('--- Creando tabla haftarot en la base de datos ---');

        await db.query(`
            CREATE TABLE IF NOT EXISTS haftarot (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                subtitle VARCHAR(255),
                parasha_reference VARCHAR(255),
                description TEXT,
                content LONGTEXT,
                image_url VARCHAR(500),
                youtube_link VARCHAR(500),
                audio_url VARCHAR(500),
                author VARCHAR(150) DEFAULT 'Moréh Kaleb',
                author_role VARCHAR(150) DEFAULT 'Moréh',
                author_img VARCHAR(500) DEFAULT '/assets/img/team/kaleb.jpg',
                is_published BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Tabla haftarot creada / verificada con éxito');

        // Insertar datos de muestra si la tabla está vacía
        const [countRow] = await db.query('SELECT COUNT(*) as total FROM haftarot');
        if (countRow[0].total === 0) {
            await db.query(`
                INSERT INTO haftarot (title, subtitle, parasha_reference, description, content, author, author_role, author_img, youtube_link)
                VALUES 
                (
                    'Haftará Bereshit: El Creador y Su Gloria',
                    'Isaías 42:5 - 43:10',
                    'Correspondiente a Parashá Bereshit',
                    'Así dice el Todopoderoso YHWH, el que crea los cielos y los extiende; el que afirma la tierra y lo que en ella brota; el que da aliento al pueblo que mora en ella.',
                    '<p>En esta porción profética conectamos el relato de la creación en Génesis con la soberanía eterna de YHWH revelada a través del profeta Isaías.</p><p>Analizamos el propósito del llamado de Israel como luz para las naciones y la fidelidad inmutable del Creador.</p>',
                    'Moréh Kaleb',
                    'Moréh',
                    '/assets/img/team/kaleb.jpg',
                    'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
                ),
                (
                    'Haftará Noaj: Pacto de Paz Inquebrantable',
                    'Isaías 54:1 - 55:5',
                    'Correspondiente a Parashá Noaj',
                    'Porque esto es para mí como en los días de Noé, cuando juré que nunca más las aguas de Noé pasarían sobre la tierra.',
                    '<p>El profeta Isaías toma la promesa del arco iris y el pacto de Noé para ilustrar la misericordia eterna y la redención prometida a Su pueblo.</p>',
                    'Moréh Kaleb',
                    'Moréh',
                    '/assets/img/team/kaleb.jpg',
                    ''
                )
            `);
            console.log('✅ 2 Haftarot de muestra insertadas');
        }

        const [rows] = await db.query('SELECT id, title, subtitle, parasha_reference, author FROM haftarot');
        console.log('Haftarot en BD:', rows);

        try {
            const [fLinks] = await db.query("SELECT * FROM footer_links WHERE url LIKE '%haftara%'");
            if (fLinks.length === 0) {
                await db.query("INSERT INTO footer_links (category, title, url) VALUES (?, ?, ?)", [
                    'Enlaces Útiles',
                    'Haftará',
                    '/haftara'
                ]);
                console.log('✅ Enlace de Haftará agregado al footer');
            }
        } catch (fErr) {
            console.warn('Nota sobre footer_links:', fErr.message);
        }

        process.exit(0);
    } catch (err) {
        console.error('Error en migración de Haftará:', err);
        process.exit(1);
    }
}

run();
