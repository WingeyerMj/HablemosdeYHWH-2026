const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'hablemos_yhwh'
};

async function exportDB() {
    const db = await mysql.createConnection(dbConfig);
    try {
        console.log('--- Iniciando exportación de base de datos ---');
        let sqlDump = `-- Hablemos de YHWH - Database Dump\n`;
        sqlDump += `-- Generado: ${new Date().toISOString()}\n\n`;
        sqlDump += `CREATE DATABASE IF NOT EXISTS hablemos_yhwh;\nUSE hablemos_yhwh;\n\n`;

        // Obtener todas las tablas
        const [tables] = await db.query('SHOW TABLES');
        for (const tableRow of tables) {
            const tableName = Object.values(tableRow)[0];
            console.log(`Exportando tabla: ${tableName}`);

            // Estructura
            const [createTable] = await db.query(`SHOW CREATE TABLE ${tableName}`);
            sqlDump += `DROP TABLE IF EXISTS ${tableName};\n`;
            sqlDump += createTable[0]['Create Table'] + ';\n\n';

            // Datos
            const [rows] = await db.query(`SELECT * FROM ${tableName}`);
            if (rows.length > 0) {
                const columns = Object.keys(rows[0]).map(c => `\`${c}\``).join(', ');
                sqlDump += `INSERT INTO \`${tableName}\` (${columns}) VALUES\n`;
                
                const values = rows.map(row => {
                    const rowValues = Object.values(row).map(val => {
                        if (val === null) return 'NULL';
                        if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
                        if (val instanceof Date) return `'${val.toISOString().slice(0, 19).replace('T', ' ')}'`;
                        return val;
                    });
                    return `(${rowValues.join(', ')})`;
                }).join(',\n') + ';\n\n';
                
                sqlDump += values;
            }
        }

        const outputPath = path.join(__dirname, '../database/hablemos_yhwh.sql');
        // Asegurar que la carpeta existe
        const dir = path.dirname(outputPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(outputPath, sqlDump);
        console.log(`--- Exportación completada exitosamente: ${outputPath} ---`);
        console.log('--- Puedes usar este archivo para importar en tu servidor cloud ---');
    } catch (err) {
        console.error('Exportación fallida:', err);
    } finally {
        await db.end();
    }
}

exportDB();
