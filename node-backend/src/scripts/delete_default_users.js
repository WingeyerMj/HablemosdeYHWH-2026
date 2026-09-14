const db = require('../config/db');

async function deleteUsers() {
    try {
        console.log('Eliminando usuarios "admin" y "editor"...');
        const [result] = await db.query("DELETE FROM users WHERE username IN ('admin', 'editor')");
        console.log(`Operación completada. Filas afectadas: ${result.affectedRows || result.rowCount || 0}`);
        const [remaining] = await db.query("SELECT id, username, email, role FROM users");
        console.log('Usuarios restantes en la base de datos:');
        console.table(remaining);
        process.exit(0);
    } catch (err) {
        console.error('Error eliminando usuarios:', err.message);
        process.exit(1);
    }
}

deleteUsers();
