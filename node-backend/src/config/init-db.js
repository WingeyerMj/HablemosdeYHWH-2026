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


        // Asegurar que las contraseñas estén correctamente hasheadas para PostgreSQL
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash('admin123', 10);

        console.log('--- Actualizando credenciales de acceso... ---');
        await db.query('UPDATE users SET password = ? WHERE username IN (?, ?)', [hashedPassword, 'admin', 'editor']);
        console.log('--- Credenciales listas: Usuario "admin" / Pass "admin123" ---');
    } catch (error) {
        console.error('--- Error al inicializar la base de datos ---');
        console.error(error);
    }
}

module.exports = initDB;
