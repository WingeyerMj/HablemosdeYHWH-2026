const db = require('./src/config/db');

async function reactivate() {
    try {
        console.log('Reactivating sections...');
        const [res] = await db.query("UPDATE dynamic_sections SET is_active = true WHERE slug IN ('parashot', 'eventos', 'equipo')");
        console.log('Rows updated:', res.affectedRows || res.rowCount);
    } catch (e) {
        console.error('Error:', e);
    } finally {
        process.exit();
    }
}

reactivate();
