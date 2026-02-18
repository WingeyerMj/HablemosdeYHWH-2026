const fs = require('fs');
const path = require('path');

async function initDB(db) {
    try {
        // Solo ejecutamos esto si estamos en PostgreSQL (Render)
        if (!process.env.DATABASE_URL) return;

        console.log('--- Comprobando tablas en la base de datos ---');

        // Verificar si la tabla 'users' ya existe
        const [rows] = await db.query("SELECT FROM information_schema.tables WHERE table_name = 'users'");

        if (rows.length === 0) {
            console.log('--- Base de datos vacía. Cargando esquema inicial... ---');
            const sqlPath = path.join(__dirname, '../../../database_pg.sql');
            const sql = fs.readFileSync(sqlPath, 'utf8');

            await db.query(sql);
            console.log('--- Esquema cargado exitosamente ---');
        }

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
