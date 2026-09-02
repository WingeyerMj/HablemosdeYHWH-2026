const db = require('../config/db');

async function run() {
    try {
        console.log('--- Agregando columna teaching_date a la tabla ensenanzas ---');
        
        // Agregar columna teaching_date si no existe
        await db.query(`
            ALTER TABLE ensenanzas 
            ADD COLUMN IF NOT EXISTS teaching_date DATE DEFAULT (CURRENT_DATE) AFTER subtitle
        `);
        console.log('✅ Columna teaching_date agregada / verificada');

        // Asignar fechas por defecto a las enseñanzas existentes si son NULL
        await db.query(`
            UPDATE ensenanzas 
            SET teaching_date = DATE(created_at) 
            WHERE teaching_date IS NULL
        `);
        console.log('✅ Fechas actualizadas para registros existentes');

        const [rows] = await db.query('SELECT id, title, teaching_date, author FROM ensenanzas ORDER BY teaching_date ASC, id ASC');
        console.log('Enseñanzas ordenadas por fecha (antigua a actual):', rows);

        process.exit(0);
    } catch (err) {
        console.error('Error en migración de fecha para enseñanzas:', err);
        process.exit(1);
    }
}

run();
