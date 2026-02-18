const fs = require('fs');
const path = require('path');

async function initDB(db) {
    try {
        console.log('--- Comprobando tablas en la base de datos ---');

        // Elegir el archivo SQL según el entorno
        const sqlFile = process.env.DATABASE_URL ? 'database_pg.sql' : 'database.sql';
        const sqlPath = path.join(__dirname, '../../../', sqlFile);
        const sql = fs.readFileSync(sqlPath, 'utf8');

        // Ejecutar el SQL completo
        await db.query(sql);
        console.log(`--- Esquema de base de datos verificado/actualizado (${sqlFile}) ---`);

        // Verificar si las tablas existen ahora (especialmente portfolio)
        const [tables] = await db.query(process.env.DATABASE_URL ?
            "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'" :
            "SHOW TABLES");
        console.log('--- Tablas detectadas en la DB:', tables.map(t => t.table_name || Object.values(t)[0]).join(', '));


        // Asegurar que las contraseñas estén correctamente hasheadas (opcional si ya están en SQL)
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash('admin123', 10);

        console.log('--- Verificando credenciales... ---');
        await db.query('UPDATE users SET password = ? WHERE username IN (?, ?)', [hashedPassword, 'admin', 'editor']);
        console.log('--- Credenciales actualizadas exitosamente ---');
    } catch (error) {
        console.error('--- ERROR CRÍTICO AL INICIALIZAR LA BASE DE DATOS ---');
        throw error; // Re-lanzar para que app.js lo capture
    }
}

module.exports = initDB;
