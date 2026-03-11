const db = require('./node-backend/src/config/db');

async function migrate() {
    try {
        console.log('Adding youtube_link column to parashot table...');
        await db.query('ALTER TABLE parashot ADD COLUMN IF NOT EXISTS youtube_link VARCHAR(255)');
        console.log('Column added successfully.');
        process.exit(0);
    } catch (e) {
        console.error('Migration failed:', e);
        process.exit(1);
    }
}

migrate();
