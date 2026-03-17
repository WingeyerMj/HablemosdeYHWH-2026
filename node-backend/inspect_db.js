const db = require('./src/config/db');

async function inspect() {
    console.log('--- Inspección de Base de Datos ---');
    try {
        const isPostgres = !!process.env.DATABASE_URL;
        console.log(`Motor detectado: ${isPostgres ? 'PostgreSQL' : 'MySQL'}`);

        let tablesQuery = isPostgres 
            ? "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
            : "SHOW TABLES";
        
        const [tables] = await db.query(tablesQuery);
        console.log('\nTablas encontradas:');
        const tableNames = tables.map(t => t.table_name || Object.values(t)[0]);
        console.log(tableNames.join(', '));

        for (const tableName of tableNames) {
            try {
                const [countRes] = await db.query(`SELECT COUNT(*) as total FROM ${tableName}`);
                const count = countRes[0].total;
                console.log(`\n- ${tableName}: ${count} registros`);
                
                if (count > 0) {
                    const [rows] = await db.query(`SELECT * FROM ${tableName} LIMIT 1`);
                    console.log('  Ejemplo:', JSON.stringify(rows[0]).substring(0, 100) + '...');
                }
            } catch (err) {
                console.log(`  Error al leer tabla ${tableName}: ${err.message}`);
            }
        }

    } catch (error) {
        console.error('Error general:', error.message);
    } finally {
        await db.end();
        process.exit();
    }
}

inspect();
