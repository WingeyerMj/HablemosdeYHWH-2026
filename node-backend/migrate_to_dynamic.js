const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mysql = require('mysql2/promise');

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'hablemos_yhwh'
};

async function migrate() {
    console.log('--- Iniciando Migración a Tablas Dinámicas Individuales ---');
    let db;
    try {
        db = await mysql.createConnection(dbConfig);

        // 0. Asegurar que la columna data_table existe en dynamic_sections
        try {
            await db.query('ALTER TABLE dynamic_sections ADD COLUMN data_table VARCHAR(255) DEFAULT NULL AFTER show_in_navbar');
            console.log('Columna data_table agregada a dynamic_sections.');
        } catch (e) {
            // 1060 = Duplicate column name
            if (e.errno !== 1060) {
                console.warn('Advertencia al agregar columna data_table:', e.message);
            }
        }

        // 1. Obtener todas las secciones de la tabla original
        const [sections] = await db.query('SELECT * FROM sections');
        console.log(`Encontradas ${sections.length} secciones base.`);

        for (const section of sections) {
            const slug = section.section_name.toLowerCase().trim();
            const tableName = `home_section_${slug}`;
            
            console.log(`\nProcesando sección: ${section.section_name} -> Tabla: ${tableName}`);

            // 2. Crear la tabla individual si no existe
            await db.query(`
                CREATE TABLE IF NOT EXISTS \`${tableName}\` (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    title VARCHAR(255),
                    subtitle TEXT,
                    content TEXT,
                    image_url VARCHAR(255),
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
            `);

            // 3. Insertar datos en la tabla individual si está vacía
            const [rows] = await db.query(`SELECT COUNT(*) as count FROM \`${tableName}\``);
            if (rows[0].count === 0) {
                await db.query(`
                    INSERT INTO \`${tableName}\` (title, subtitle, content, image_url)
                    VALUES (?, ?, ?, ?)
                `, [section.title, section.subtitle, section.content, section.image_url]);
                console.log(`  - Datos insertados en ${tableName}`);
            } else {
                console.log(`  - La tabla ${tableName} ya contenía datos.`);
            }

            // 4. Vincular con dynamic_sections
            // Buscar si ya existe la sección dinámica
            const [dsRows] = await db.query('SELECT id FROM dynamic_sections WHERE slug = ?', [slug]);
            
            if (dsRows.length > 0) {
                // Actualizar para vincular la tabla
                await db.query('UPDATE dynamic_sections SET data_table = ? WHERE slug = ?', [tableName, slug]);
                console.log(`  - Sección dinámica actualizada con data_table = ${tableName}`);
            } else {
                // Crear la sección dinámica si no existía (ej. footer)
                let icon = 'bi-file-text';
                if(slug === 'hero') icon = 'bi-house';
                else if(slug === 'calendario') icon = 'bi-calendar3';
                else if(slug === 'about') icon = 'bi-info-circle';

                await db.query(`
                    INSERT INTO dynamic_sections (title, slug, section_type, summary, content, icon, image_url, nav_order, is_active, show_in_navbar, data_table)
                    VALUES (?, ?, 'inline', ?, ?, ?, ?, 0, 1, 1, ?)
                `, [section.title, slug, section.subtitle, section.content, icon, section.image_url, tableName]);
                console.log(`  - Nueva sección dinámica creada con data_table = ${tableName}`);
            }
        }

        console.log('\n--- Migración completada exitosamente ---');
    } catch (err) {
        console.error('Error durante la migración:', err);
    } finally {
        if (db) await db.end();
    }
}

migrate();
