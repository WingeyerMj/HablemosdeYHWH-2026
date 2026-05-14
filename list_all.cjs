const db = require('./node-backend/src/config/db');

async function check() {
    try {
        const [rows] = await db.query('SELECT id, title, subtitle FROM parashot');
        console.log('All parashot:', rows);
        process.exit(0);
    } catch (e) {
        console.error('Error:', e);
        process.exit(1);
    }
}

check();
