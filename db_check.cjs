const db = require('./node-backend/src/config/db');

async function check() {
    try {
        const [rows] = await db.query('SELECT * FROM parashot');
        console.log('Total rows in parashot:', rows.length);
        console.log('Sample data:', rows.slice(0, 2));
        process.exit(0);
    } catch (e) {
        console.error('Error:', e);
        process.exit(1);
    }
}

check();
