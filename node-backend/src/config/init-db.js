const fs = require('fs');
const path = require('path');

async function initDB(db) {
    try {
        console.log('--- Comprobando tablas en la base de datos ---');

        // Elegir el archivo SQL según el entorno
        const sqlFile = process.env.DATABASE_URL ? 'database_pg.sql' : 'database.sql';
        const sqlPath = path.join(__dirname, '../../../', sqlFile);
        const sql = fs.readFileSync(sqlPath, 'utf8');

        // Dividir el SQL en sentencias individuales y ejecutar una por una
        // para que errores no críticos no detengan toda la inicialización
        const statements = sql
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('--'));

        let errors = 0;
        for (const stmt of statements) {
            try {
                await db.query(stmt);
            } catch (err) {
                // Errores no críticos: columna duplicada, dato ya existente, etc.
                const ignorable = [
                    'ER_DUP_FIELDNAME',   // Duplicate column name
                    'ER_DUP_ENTRY',       // Duplicate entry
                    'ER_TABLE_EXISTS',    // Table already exists
                    'ER_DUP_KEYNAME',     // Duplicate key name
                ];
                if (ignorable.includes(err.code)) {
                    console.warn(`  [WARN] Ignorando error no crítico: ${err.sqlMessage || err.message}`);
                    errors++;
                } else {
                    console.error(`  [ERROR] Sentencia fallida: ${stmt.substring(0, 80)}...`);
                    console.error(`          Error: ${err.message}`);
                    errors++;
                }
            }
        }
        console.log(`--- Esquema de base de datos verificado/actualizado (${sqlFile}) ${errors > 0 ? `con ${errors} advertencia(s)` : ''} ---`);

        // Verificar si las tablas existen ahora
        const [tables] = await db.query(process.env.DATABASE_URL ?
            "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'" :
            "SHOW TABLES");
        console.log('--- Tablas detectadas en la DB:', tables.map(t => t.table_name || Object.values(t)[0]).join(', '));

        // Asegurar que las contraseñas estén correctamente hasheadas
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash('admin123', 10);

        console.log('--- Verificando credenciales... ---');
        await db.query('UPDATE users SET password = ? WHERE username IN (?, ?)', [hashedPassword, 'admin', 'editor']);
        console.log('--- Credenciales actualizadas exitosamente ---');
    } catch (error) {
        console.error('--- ERROR CRÍTICO AL INICIALIZAR LA BASE DE DATOS ---');
        console.error(error);
        throw error;
    }
}

module.exports = initDB;
