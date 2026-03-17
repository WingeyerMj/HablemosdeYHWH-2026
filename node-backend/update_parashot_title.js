const db = require('./src/config/db');

async function updateTitle() {
    try {
        console.log('--- Actualizando título de la sección Parashot ---');
        const [res] = await db.query("UPDATE dynamic_sections SET title = 'Parashot' WHERE slug = 'parashot'");
        console.log('Resultado:', res.affectedRows || res.rowCount, 'fila(s) actualizada(s).');
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await db.end();
        process.exit();
    }
}

updateTitle();
