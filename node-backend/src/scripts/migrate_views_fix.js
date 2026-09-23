/**
 * Migración: Agregar columnas faltantes a ensenanzas y crear tabla haftarot
 * 
 * Problemas detectados:
 * 1. La tabla ensenanzas NO tiene columna 'views' (ni author, author_role, author_img, authors, teaching_date)
 * 2. La tabla haftarot NO EXISTE en la base de datos
 * 
 * El modelo Ensenanza.incrementViews() y Haftara.incrementViews() fallan silenciosamente
 * y las vistas muestran "0 vistas" siempre.
 */
const db = require('../config/db');

async function addColumnIfNotExists(table, column, definition) {
    try {
        const [cols] = await db.query(`SHOW COLUMNS FROM ${table} LIKE '${column}'`);
        if (!cols || cols.length === 0) {
            await db.query(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
            console.log(`  ✅ Columna '${column}' agregada a '${table}'`);
            return true;
        } else {
            console.log(`  ⏭️  Columna '${column}' ya existe en '${table}'`);
            return false;
        }
    } catch (err) {
        console.error(`  ❌ Error agregando '${column}' a '${table}':`, err.message);
        return false;
    }
}

async function run() {
    try {
        console.log('=== MIGRACIÓN: Corregir contador de visitas ===\n');

        // ========================================================
        // 1. Agregar columnas faltantes a la tabla ensenanzas
        // ========================================================
        console.log('📋 1. Verificando columnas de la tabla ensenanzas...');
        
        await addColumnIfNotExists('ensenanzas', 'views', 'INT DEFAULT 0 AFTER is_published');
        await addColumnIfNotExists('ensenanzas', 'author', "VARCHAR(150) DEFAULT 'Moréh Kalev Aquerman' AFTER youtube_link");
        await addColumnIfNotExists('ensenanzas', 'author_role', "VARCHAR(150) DEFAULT 'Moreh מורה' AFTER author");
        await addColumnIfNotExists('ensenanzas', 'author_img', "VARCHAR(500) DEFAULT '/assets/img/team/kaleb.jpg' AFTER author_role");
        await addColumnIfNotExists('ensenanzas', 'authors', 'LONGTEXT DEFAULT NULL AFTER author_img');
        await addColumnIfNotExists('ensenanzas', 'teaching_date', 'DATE DEFAULT NULL AFTER subtitle');
        await addColumnIfNotExists('ensenanzas', 'category', "VARCHAR(100) DEFAULT NULL AFTER teaching_date");

        // ========================================================
        // 2. Crear tabla haftarot si no existe
        // ========================================================
        console.log('\n📋 2. Verificando tabla haftarot...');

        try {
            const [tables] = await db.query("SHOW TABLES LIKE 'haftarot'");
            if (!tables || tables.length === 0) {
                await db.query(`
                    CREATE TABLE IF NOT EXISTS haftarot (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        parasha_id INT DEFAULT NULL,
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
                        authors LONGTEXT DEFAULT NULL,
                        views INT DEFAULT 0,
                        is_published BOOLEAN DEFAULT TRUE,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                    )
                `);
                console.log('  ✅ Tabla haftarot CREADA exitosamente');
            } else {
                console.log('  ⏭️  Tabla haftarot ya existe');
                // Asegurar que tenga la columna views
                await addColumnIfNotExists('haftarot', 'views', 'INT DEFAULT 0 AFTER authors');
                await addColumnIfNotExists('haftarot', 'parasha_id', 'INT DEFAULT NULL AFTER id');
                await addColumnIfNotExists('haftarot', 'authors', 'LONGTEXT DEFAULT NULL AFTER author_img');
            }
        } catch (err) {
            console.error('  ❌ Error creando tabla haftarot:', err.message);
        }

        // ========================================================
        // 3. Verificar el resultado
        // ========================================================
        console.log('\n📋 3. Verificando resultado...\n');

        const [eCols] = await db.query("SHOW COLUMNS FROM ensenanzas");
        console.log('Columnas de ensenanzas:', eCols.map(c => c.Field).join(', '));

        try {
            const [hCols] = await db.query("SHOW COLUMNS FROM haftarot");
            console.log('Columnas de haftarot:', hCols.map(c => c.Field).join(', '));
        } catch(err) {
            console.log('Error al verificar haftarot:', err.message);
        }

        // Test incrementViews works
        console.log('\n📋 4. Probando incrementViews...');
        try {
            const [eRows] = await db.query('SELECT id, views FROM ensenanzas LIMIT 1');
            if (eRows.length > 0) {
                const testId = eRows[0].id;
                const before = eRows[0].views;
                await db.query('UPDATE ensenanzas SET views = views + 1 WHERE id = ?', [testId]);
                const [after] = await db.query('SELECT views FROM ensenanzas WHERE id = ?', [testId]);
                console.log(`  ✅ Ensenanza id=${testId}: views ${before} → ${after[0].views}`);
                // Restaurar
                await db.query('UPDATE ensenanzas SET views = ? WHERE id = ?', [before, testId]);
            }
        } catch (err) {
            console.error('  ❌ Error probando incrementViews en ensenanzas:', err.message);
        }

        console.log('\n✅ Migración completada exitosamente!');
        process.exit(0);
    } catch (err) {
        console.error('Error general en migración:', err);
        process.exit(1);
    }
}

run();
