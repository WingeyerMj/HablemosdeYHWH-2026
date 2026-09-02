const db = require('../config/db');

async function run() {
    try {
        console.log('--- Limpiando duplicados de Kaleb en la tabla team ---');

        // 1. Eliminar cualquier registro con name = 'Kaleb' si ya existe 'Kalev Aquerman'
        const [kalevRows] = await db.query("SELECT * FROM team WHERE name LIKE '%Kalev%' OR name LIKE '%Aquerman%'");
        
        if (kalevRows.length > 0) {
            // Eliminar los duplicados que se llamen exactamente 'Kaleb'
            await db.query("DELETE FROM team WHERE name = 'Kaleb'");
            // Asegurar que Kalev Aquerman tenga los datos correctos
            await db.query(`
                UPDATE team 
                SET name = 'Kalev Aquerman', role = 'Moreh מורה'
                WHERE id = ?
            `, [kalevRows[0].id]);
        } else {
            // Si solo existía 'Kaleb', renombrarlo directamente a 'Kalev Aquerman'
            await db.query(`
                UPDATE team 
                SET name = 'Kalev Aquerman', role = 'Moreh מורה'
                WHERE name = 'Kaleb'
            `);
        }

        // 2. Actualizar las enseñanzas existentes para que el autor sea 'Moréh Kalev Aquerman'
        await db.query(`
            UPDATE ensenanzas 
            SET author = 'Moréh Kalev Aquerman', author_role = 'Moreh מורה'
            WHERE author = 'Kaleb' OR author = 'Moréh Kaleb'
        `);

        // 3. Actualizar las Haftarot existentes
        await db.query(`
            UPDATE haftarot 
            SET author = 'Moréh Kalev Aquerman', author_role = 'Moreh מורה'
            WHERE author = 'Kaleb' OR author = 'Moréh Kaleb'
        `);

        // Verificar el equipo resultante
        const [finalTeam] = await db.query('SELECT id, name, role, img FROM team ORDER BY id ASC');
        console.log('✅ Equipo actualizado sin duplicados:');
        console.table(finalTeam);

        process.exit(0);
    } catch (err) {
        console.error('Error al limpiar equipo:', err);
        process.exit(1);
    }
}

run();
