const { Client } = require('pg');
require('dotenv').config({ path: require('path').join(__dirname, '.env') });

async function fixPortfolio() {
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    try {
        await client.connect();
        console.log('Connected to DB');
        
        const alterStatements = [
            "ALTER TABLE portfolio ADD COLUMN IF NOT EXISTS subtitle TEXT",
            "ALTER TABLE portfolio ADD COLUMN IF NOT EXISTS content TEXT",
            "ALTER TABLE portfolio ADD COLUMN IF NOT EXISTS image_url VARCHAR(255)"
        ];
        
        for (const sql of alterStatements) {
            try {
                await client.query(sql);
                console.log('OK:', sql);
            } catch (e) {
                console.log('Skip:', e.message);
            }
        }

        // Check current columns
        const res = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'portfolio' 
            ORDER BY ordinal_position
        `);
        console.log('\nColumnas actuales de portfolio:');
        res.rows.forEach(r => console.log(`  - ${r.column_name} (${r.data_type})`));

    } catch (err) {
        console.error('ERROR:', err.message);
    } finally {
        await client.end();
    }
}
fixPortfolio();
