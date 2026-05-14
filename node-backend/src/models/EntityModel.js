const db = require('../config/db');

class EntityModel {
    // Verificar si una tabla existe
    static async tableExists(tableName) {
        const query = process.env.DATABASE_URL ?
            "SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = ?" :
            "SHOW TABLES LIKE ?";
        const [rows] = await db.query(query, [tableName]);
        return rows.length > 0;
    }

    // Crear una tabla dinámica
    static async createDynamicTable(tableName, fields) {
        // Sanitizar nombre de tabla
        const sanitizedTable = tableName.replace(/[^a-z0-9_]/gi, '').toLowerCase();
        const isPostgres = !!process.env.DATABASE_URL;

        let sql;
        if (isPostgres) {
            // PostgreSQL syntax
            sql = `CREATE TABLE IF NOT EXISTS "${sanitizedTable}" (
                id SERIAL PRIMARY KEY,`;
            
            fields.forEach(field => {
                const name = field.name.replace(/[^a-z0-9_]/gi, '').toLowerCase();
                const type = field.type === 'text' ? 'TEXT' : 'VARCHAR(255)';
                sql += ` "${name}" ${type},`;
            });
            
            sql += ` created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP )`;
        } else {
            // MySQL syntax
            sql = `CREATE TABLE IF NOT EXISTS \`${sanitizedTable}\` (
                id INT AUTO_INCREMENT PRIMARY KEY,`;

            fields.forEach(field => {
                const name = field.name.replace(/[^a-z0-9_]/gi, '').toLowerCase();
                const type = field.type === 'text' ? 'TEXT' : 'VARCHAR(255)';
                sql += ` \`${name}\` ${type},`;
            });

            sql += ` created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP )`;
        }

        await db.query(sql);
        return sanitizedTable;
    }

    // Obtener todos los registros de una tabla
    static async getAll(tableName) {
        const quote = process.env.DATABASE_URL ? '"' : '`';
        const [rows] = await db.query(`SELECT * FROM ${quote}${tableName}${quote} ORDER BY id DESC`);
        return rows;
    }

    // Insertar registro
    static async insert(tableName, data) {
        const isPostgres = !!process.env.DATABASE_URL;
        const quote = isPostgres ? '"' : '`';
        
        if (isPostgres) {
            const keys = Object.keys(data);
            const values = Object.values(data);
            const columns = keys.map(k => `"${k}"`).join(', ');
            const placeholders = keys.map((_, i) => `?`).join(', ');
            
            const sql = `INSERT INTO ${quote}${tableName}${quote} (${columns}) VALUES (${placeholders})`;
            const [result] = await db.query(sql, values);
            return result;
        } else {
            // MySQL supports SET ?
            const [result] = await db.query(`INSERT INTO ${quote}${tableName}${quote} SET ?`, [data]);
            return result;
        }
    }

    // Eliminar registro
    static async delete(tableName, id) {
        const quote = process.env.DATABASE_URL ? '"' : '`';
        return await db.query(`DELETE FROM ${quote}${tableName}${quote} WHERE id = ?`, [id]);
    }

    // Obtener columnas de una tabla para conocer su estructura
    static async getColumns(tableName) {
        const isPostgres = !!process.env.DATABASE_URL;
        
        if (isPostgres) {
            const [rows] = await db.query(
                "SELECT column_name as \"Field\", data_type as \"Type\" FROM information_schema.columns WHERE table_schema = 'public' AND table_name = ?",
                [tableName]
            );
            return rows.filter(col => !['id', 'created_at'].includes(col.Field));
        } else {
            const [rows] = await db.query(`SHOW COLUMNS FROM \`${tableName}\``);
            return rows.filter(col => !['id', 'created_at'].includes(col.Field));
        }
    }
}

module.exports = EntityModel;

