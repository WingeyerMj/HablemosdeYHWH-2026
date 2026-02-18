const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

let pool;

if (process.env.DATABASE_URL) {
    // Modo PostgreSQL (Para Render)
    const { Pool } = require('pg');
    const pgPool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    pool = {
        query: async (text, params) => {
            let count = 1;
            const pgText = text.replace(/\?/g, () => `$${count++}`);
            const res = await pgPool.query(pgText, params);
            return [res.rows, res.fields];
        },
        end: () => pgPool.end()
    };
} else {
    // Modo MySQL (Para Local)
    const mysql = require('mysql2/promise');
    pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASS || '',
        database: process.env.DB_NAME || 'hablemos_yhwh',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });
}

module.exports = pool;
