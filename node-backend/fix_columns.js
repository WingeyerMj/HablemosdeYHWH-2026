const { Client } = require('pg');
require('dotenv').config({ path: require('path').join(__dirname, '.env') });

async function fixColumns() {
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    try {
        await client.connect();
        console.log('Connected to DB');
        
        // Add missing columns
        const alterStatements = [
            "ALTER TABLE parashot ADD COLUMN IF NOT EXISTS subtitle TEXT",
            "ALTER TABLE parashot ADD COLUMN IF NOT EXISTS content TEXT",
            "ALTER TABLE parashot ADD COLUMN IF NOT EXISTS image_url VARCHAR(255)",
            "ALTER TABLE parashot ADD COLUMN IF NOT EXISTS parasha_number INT"
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
            WHERE table_name = 'parashot' 
            ORDER BY ordinal_position
        `);
        console.log('\nColumnas actuales de parashot:');
        res.rows.forEach(r => console.log(`  - ${r.column_name} (${r.data_type})`));

        // Check existing data
        const data = await client.query('SELECT id, parasha_number, title, subtitle FROM parashot');
        console.log('\nDatos existentes:', data.rows);

    } catch (err) {
        console.error('ERROR:', err.message);
    } finally {
        await client.end();
    }
}
fixColumns();
