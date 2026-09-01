const db = require('../config/db');

async function run() {
    try {
        console.log('--- Iniciando migración de Kaleb y Enseñanzas ---');

        // 1. Verificar y agregar columnas en ensenanzas
        const [cols] = await db.query("SHOW COLUMNS FROM ensenanzas LIKE 'author'");
        if (cols.length === 0) {
            await db.query("ALTER TABLE ensenanzas ADD COLUMN author VARCHAR(150) DEFAULT 'Moréh Kaleb' AFTER youtube_link");
            await db.query("ALTER TABLE ensenanzas ADD COLUMN author_role VARCHAR(150) DEFAULT 'Moréh' AFTER author");
            await db.query("ALTER TABLE ensenanzas ADD COLUMN author_img VARCHAR(500) DEFAULT '/assets/img/team/kaleb.jpg' AFTER author_role");
            console.log('✅ Columnas author, author_role, author_img agregadas a ensenanzas');
        } else {
            console.log('ℹ️ Columnas ya existen en ensenanzas');
        }

        // 2. Asegurar que las enseñanzas tengan autor por defecto
        await db.query("UPDATE ensenanzas SET author = 'Moréh Kaleb' WHERE author IS NULL OR author = ''");
        await db.query("UPDATE ensenanzas SET author_role = 'Moréh' WHERE author_role IS NULL OR author_role = ''");
        await db.query("UPDATE ensenanzas SET author_img = '/assets/img/team/kaleb.jpg' WHERE author_img IS NULL OR author_img = ''");

        // 3. Insertar o actualizar Kaleb en la tabla team
        const [existing] = await db.query("SELECT * FROM team WHERE name LIKE '%Kaleb%'");
        if (existing.length === 0) {
            await db.query(
                "INSERT INTO team (name, role, description, img) VALUES (?, ?, ?, ?)",
                ['Kaleb', 'Moréh מורה', 'Da enseñanzas en la congregación.', '/assets/img/team/kaleb.jpg']
            );
            console.log('✅ Kaleb agregado a la tabla team');
        } else {
            await db.query(
                "UPDATE team SET role = ?, description = ?, img = ? WHERE id = ?",
                ['Moréh מורה', 'Da enseñanzas en la congregación.', '/assets/img/team/kaleb.jpg', existing[0].id]
            );
            console.log('✅ Kaleb actualizado en la tabla team');
        }

        const [team] = await db.query('SELECT * FROM team');
        console.log('Equipo actual en BD:', team);

        const [ens] = await db.query('SELECT id, title, author, author_role, author_img FROM ensenanzas');
        console.log('Enseñanzas actuales en BD:', ens);

        console.log('--- Migración completada con éxito ---');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error en migración:', err);
        process.exit(1);
    }
}

run();
