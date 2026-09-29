const db = require('../config/db');

async function addColumnIfNotExists(table, column, definition) {
    try {
        const isPostgres = !!process.env.DATABASE_URL;
        if (isPostgres) {
            const [cols] = await db.query(
                "SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = ? AND column_name = ?",
                [table, column]
            );
            if (!cols || cols.length === 0) {
                await db.query(`ALTER TABLE "${table}" ADD COLUMN IF NOT EXISTS "${column}" ${definition}`);
                console.log(`  ✅ Columna '${column}' agregada a '${table}' (PG)`);
                return true;
            } else {
                console.log(`  ⏭️  Columna '${column}' ya existe en '${table}' (PG)`);
                return false;
            }
        } else {
            const [cols] = await db.query(`SHOW COLUMNS FROM \`${table}\` LIKE ?`, [column]);
            if (!cols || cols.length === 0) {
                await db.query(`ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${definition}`);
                console.log(`  ✅ Columna '${column}' agregada a '${table}' (MySQL)`);
                return true;
            } else {
                console.log(`  ⏭️  Columna '${column}' ya existe en '${table}' (MySQL)`);
                return false;
            }
        }
    } catch (err) {
        console.warn(`  ⚠️ Aviso agregando '${column}' a '${table}':`, err.message);
        return false;
    }
}

async function runMigration() {
    try {
        console.log('=== INICIANDO MIGRACIÓN GENERAL DE VISTAS ===');

        // 1. Tablas principales
        await addColumnIfNotExists('parashot', 'views', 'INT DEFAULT 0');
        await addColumnIfNotExists('portfolio', 'views', 'INT DEFAULT 0');
        await addColumnIfNotExists('ensenanzas', 'views', 'INT DEFAULT 0');
        await addColumnIfNotExists('haftarot', 'views', 'INT DEFAULT 0');
        await addColumnIfNotExists('semillas_torah', 'views', 'INT DEFAULT 0');
        await addColumnIfNotExists('semillas_articulos', 'views_count', 'INT DEFAULT 0');
        await addColumnIfNotExists('semillas_shorts', 'views_count', 'INT DEFAULT 0');
        await addColumnIfNotExists('blog_posts', 'views', 'INT DEFAULT 0');

        // 2. Tablas de secciones dinámicas
        try {
            const [dynamicSections] = await db.query('SELECT DISTINCT data_table FROM dynamic_sections WHERE data_table IS NOT NULL AND data_table != ""');
            if (dynamicSections && dynamicSections.length > 0) {
                for (const ds of dynamicSections) {
                    const table = ds.data_table;
                    if (table) {
                        console.log(`🔍 Verificando tabla dinámica '${table}'...`);
                        await addColumnIfNotExists(table, 'views', 'INT DEFAULT 0');
                    }
                }
            }
        } catch (e) {
            console.warn('Aviso verificando dynamic_sections:', e.message);
        }

        console.log('=== MIGRACIÓN GENERAL DE VISTAS FINALIZADA CON ÉXITO ===');
    } catch (err) {
        console.error('Error en runMigration:', err.message);
    }
}

// Auto-run if executed directly
if (require.main === module) {
    runMigration().then(() => process.exit(0)).catch(() => process.exit(1));
}

module.exports = runMigration;
