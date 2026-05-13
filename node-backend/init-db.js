const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function initDB() {
    // Create connection without database selected
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS
    });

    try {
        console.log('Connecting to MySQL...');

        // Read SQL file
        const sqlPath = path.join(__dirname, '..', 'database.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        // Split by semicolon and filter out empty strings
        // This is a basic split, might fail on complex SQL but should work for this file
        const queries = sql.split(';').filter(q => q.trim().length > 0);

        for (let query of queries) {
            console.log('Executing query...');
            await connection.query(query);
        }

        console.log('Database initialized successfully!');
    } catch (error) {
        console.error('Initialization error:', error);
    } finally {
        await connection.end();
        process.exit();
    }
}

initDB();
