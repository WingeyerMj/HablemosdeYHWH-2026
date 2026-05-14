const db = require('./src/config/db');

async function runMigration() {
    try {
        console.log("Running migration to add parasha_number column...");
        await db.query("ALTER TABLE parashot ADD COLUMN parasha_number INT AFTER id");
        console.log("Migration successful.");
    } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
            console.log("Column parasha_number already exists.");
        } else {
            console.error("Migration error:", error);
        }
    } finally {
        process.exit();
    }
}

runMigration();
