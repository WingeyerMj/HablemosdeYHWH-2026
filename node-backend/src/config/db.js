const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

let pool;

if (process.env.DATABASE_URL) {
    // Modo PostgreSQL (Para Render)
    const { Pool } = require('pg');
    const isLocal = process.env.DATABASE_URL.includes('localhost') || process.env.DATABASE_URL.includes('127.0.0.1');
    const pgPool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: isLocal ? false : { rejectUnauthorized: false }
    });

    pool = {
        query: async (text, params = []) => {
            let pgText = text;
            if (params && params.length > 0) {
                let count = 1;
                pgText = text.replace(/\?/g, () => `$${count++}`);
            }
            const res = await pgPool.query(pgText, params);

            // Si hay múltiples statements, res es un array de resultados
            if (Array.isArray(res)) {
                const lastRes = res[res.length - 1];
                return [lastRes.rows, lastRes.fields];
            }

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
        queueLimit: 0,
        multipleStatements: true
    });
    // Prevenir que errores de conexión no manejados maten el proceso
    pool.pool && pool.pool.on && pool.pool.on('error', (err) => {
        console.warn('⚠️ Error en pool MySQL (ignorado):', err.code || err.message);
    });
}

module.exports = pool;
