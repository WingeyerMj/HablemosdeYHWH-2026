const db = require('./src/config/db');

(async () => {
    try {
        // List all tables
        const [tables] = await db.query("SHOW TABLES");
        console.log('All tables:');
        tables.forEach(t => console.log(' ', Object.values(t)[0]));

        // Show ensenanzas full structure
        const [cols] = await db.query("DESCRIBE ensenanzas");
        console.log('\nensenanzas structure:');
        cols.forEach(c => console.log(`  ${c.Field} | ${c.Type} | ${c.Null} | ${c.Default}`));

        // Find haftara-like tables
        const haftaraTables = tables.filter(t => {
            const name = Object.values(t)[0].toLowerCase();
            return name.includes('hafta');
        });
        console.log('\nHaftara-related tables:', haftaraTables.map(t => Object.values(t)[0]));

        for (const ht of haftaraTables) {
            const tableName = Object.values(ht)[0];
            const [hCols] = await db.query(`DESCRIBE ${tableName}`);
            console.log(`\n${tableName} structure:`);
            hCols.forEach(c => console.log(`  ${c.Field} | ${c.Type} | ${c.Null} | ${c.Default}`));
        }

        process.exit(0);
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
})();
