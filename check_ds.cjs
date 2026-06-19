const db = require('./node-backend/src/config/db');
async function check() {
    try {
        const [rows] = await db.query('SELECT * FROM dynamic_sections');
        console.log(rows);
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
check();
