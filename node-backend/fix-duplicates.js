const db = require('./src/config/db');

async function fix() {
    try {
        console.log('Fixing duplicated sections...');
        const [res] = await db.query("UPDATE dynamic_sections SET is_active = false WHERE slug IN ('parashot', 'eventos', 'equipo')");
        console.log('Rows updated:', res.affectedRows || res.rowCount);
    } catch (e) {
        console.error('Error:', e);
    } finally {
        process.exit();
    }
}

fix();
