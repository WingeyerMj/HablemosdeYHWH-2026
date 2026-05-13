const mysql = require('mysql2/promise');
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'hablemos_yhwh'
};

async function migrate() {
    const db = await mysql.createConnection(dbConfig);
    try {
        // 1. Get current sections
        const [sections] = await db.query('SELECT * FROM sections');
        
        for (const section of sections) {
            const tableName = `home_section_${section.section_name.toLowerCase()}`;
            console.log(`Creating table: ${tableName}`);
            
            // Create table
            await db.query(`DROP TABLE IF EXISTS ${tableName}`);
            await db.query(`
                CREATE TABLE ${tableName} (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    title VARCHAR(255),
                    subtitle TEXT,
                    content TEXT,
                    image_url VARCHAR(255),
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )
            `);
            
            // Insert data
            await db.query(`
                INSERT INTO ${tableName} (title, subtitle, content, image_url)
                VALUES (?, ?, ?, ?)
            `, [section.title, section.subtitle, section.content, section.image_url]);
        }
        
        // Also create tables for sections that might not be in the DB yet but are in index.ejs
        const missingSections = ['parashot', 'eventos', 'equipo'];
        for (const ms of missingSections) {
            const tableName = `home_section_${ms}`;
            const [exists] = await db.query(`SHOW TABLES LIKE '${tableName}'`);
            if (exists.length === 0) {
                console.log(`Creating missing table: ${tableName}`);
                await db.query(`
                    CREATE TABLE ${tableName} (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        title VARCHAR(255),
                        subtitle TEXT,
                        content TEXT,
                        image_url VARCHAR(255),
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                    )
                `);
                // Insert default data
                const defaults = {
                    parashot: ['Parashot', 'Lo que ofrecemos', '', ''],
                    eventos: ['Eventos', 'Nuestro trabajo', '', ''],
                    equipo: ['Equipo', 'Conoce a los encargados', '', '']
                };
                await db.query(`
                    INSERT INTO ${tableName} (title, subtitle, content, image_url)
                    VALUES (?, ?, ?, ?)
                `, defaults[ms]);
            }
        }
        
        console.log('Migration completed successfully.');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await db.end();
    }
}

migrate();
