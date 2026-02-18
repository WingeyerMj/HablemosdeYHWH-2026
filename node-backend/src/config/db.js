const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || `postgres://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME}`,
    ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

// Helper to maintain MySQL-like syntax as much as possible
module.exports = {
    query: async (text, params) => {
        // Simple conversion from ? to $1, $2, etc.
        let count = 1;
        const pgText = text.replace(/\?/g, () => `$${count++}`);
        const res = await pool.query(pgText, params);
        return [res.rows, res.fields];
    },
    end: () => pool.end()
};
