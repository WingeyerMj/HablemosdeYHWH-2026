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

    // Asegurar que la columna 'views' exista en la tabla dinámica
    static async ensureViewsColumn(tableName) {
        if (!tableName) return;
        try {
            const sanitizedTable = tableName.replace(/[^a-z0-9_]/gi, '').toLowerCase();
            const isPostgres = !!process.env.DATABASE_URL;
            if (isPostgres) {
                const [cols] = await db.query(
                    "SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = ? AND column_name = 'views'",
                    [sanitizedTable]
                );
                if (!cols || cols.length === 0) {
                    await db.query(`ALTER TABLE "${sanitizedTable}" ADD COLUMN IF NOT EXISTS "views" INTEGER DEFAULT 0`);
                }
            } else {
                const [cols] = await db.query(`SHOW COLUMNS FROM \`${sanitizedTable}\` LIKE 'views'`);
                if (!cols || cols.length === 0) {
                    await db.query(`ALTER TABLE \`${sanitizedTable}\` ADD COLUMN \`views\` INT DEFAULT 0`);
                }
            }
        } catch (e) {
            // Ignorar errores silenciosos si la tabla aún no existe
        }
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
                const type = field.type === 'text' ? 'TEXT' : (field.type === 'int' ? 'INTEGER DEFAULT 0' : 'VARCHAR(255)');
                sql += ` "${name}" ${type},`;
            });
            
            sql += ` "views" INTEGER DEFAULT 0, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP )`;
        } else {
            // MySQL syntax
            sql = `CREATE TABLE IF NOT EXISTS \`${sanitizedTable}\` (
                id INT AUTO_INCREMENT PRIMARY KEY,`;

            fields.forEach(field => {
                const name = field.name.replace(/[^a-z0-9_]/gi, '').toLowerCase();
                const type = field.type === 'text' ? 'TEXT' : (field.type === 'int' ? 'INT DEFAULT 0' : 'VARCHAR(255)');
                sql += ` \`${name}\` ${type},`;
            });

            sql += ` \`views\` INT DEFAULT 0, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP )`;
        }

        await db.query(sql);
        return sanitizedTable;
    }

    // Obtener todos los registros de una tabla
    static async getAll(tableName) {
        await EntityModel.ensureViewsColumn(tableName);
        const sanitizedTable = tableName.replace(/[^a-z0-9_]/gi, '').toLowerCase();
        const quote = process.env.DATABASE_URL ? '"' : '`';
        const [rows] = await db.query(`SELECT * FROM ${quote}${sanitizedTable}${quote} ORDER BY id DESC`);
        return rows;
    }

    // Insertar registro
    static async insert(tableName, data) {
        await EntityModel.ensureViewsColumn(tableName);
        const sanitizedTable = tableName.replace(/[^a-z0-9_]/gi, '').toLowerCase();
        const isPostgres = !!process.env.DATABASE_URL;
        const quote = isPostgres ? '"' : '`';
        
        if (isPostgres) {
            const keys = Object.keys(data);
            const values = Object.values(data);
            const columns = keys.map(k => `"${k}"`).join(', ');
            const placeholders = keys.map((_, i) => `?`).join(', ');
            
            const sql = `INSERT INTO ${quote}${sanitizedTable}${quote} (${columns}) VALUES (${placeholders})`;
            const [result] = await db.query(sql, values);
            return result;
        } else {
            // MySQL supports SET ?
            const [result] = await db.query(`INSERT INTO ${quote}${sanitizedTable}${quote} SET ?`, [data]);
            return result;
        }
    }

    // Obtener un registro por ID
    static async getById(tableName, id) {
        await EntityModel.ensureViewsColumn(tableName);
        const sanitizedTable = tableName.replace(/[^a-z0-9_]/gi, '').toLowerCase();
        const quote = process.env.DATABASE_URL ? '"' : '`';
        const [rows] = await db.query(`SELECT * FROM ${quote}${sanitizedTable}${quote} WHERE id = ?`, [id]);
        return rows[0];
    }

    // Actualizar registro
    static async update(tableName, id, data) {
        await EntityModel.ensureViewsColumn(tableName);
        const sanitizedTable = tableName.replace(/[^a-z0-9_]/gi, '').toLowerCase();
        const isPostgres = !!process.env.DATABASE_URL;
        const quote = isPostgres ? '"' : '`';
        
        if (isPostgres) {
            const keys = Object.keys(data);
            const values = Object.values(data);
            const setClause = keys.map(k => `"${k}" = ?`).join(', ');
            
            const sql = `UPDATE ${quote}${sanitizedTable}${quote} SET ${setClause} WHERE id = ?`;
            const [result] = await db.query(sql, [...values, id]);
            return result;
        } else {
            const [result] = await db.query(`UPDATE ${quote}${sanitizedTable}${quote} SET ? WHERE id = ?`, [data, id]);
            return result;
        }
    }

    // Incrementar vistas
    static async incrementViews(tableName, id) {
        if (!tableName || !id) return;
        try {
            await EntityModel.ensureViewsColumn(tableName);
            const sanitizedTable = tableName.replace(/[^a-z0-9_]/gi, '').toLowerCase();
            const isPostgres = !!process.env.DATABASE_URL;
            const quote = isPostgres ? '"' : '`';
            await db.query(`UPDATE ${quote}${sanitizedTable}${quote} SET views = COALESCE(views, 0) + 1 WHERE id = ?`, [id]);
        } catch (e) {
            console.warn(`Aviso incrementViews ${tableName}:`, e.message);
        }
    }

    // Eliminar registro
    static async delete(tableName, id) {
        const sanitizedTable = tableName.replace(/[^a-z0-9_]/gi, '').toLowerCase();
        const quote = process.env.DATABASE_URL ? '"' : '`';
        return await db.query(`DELETE FROM ${quote}${sanitizedTable}${quote} WHERE id = ?`, [id]);
    }

    // Obtener columnas de una tabla para conocer su estructura
    static async getColumns(tableName) {
        await EntityModel.ensureViewsColumn(tableName);
        const sanitizedTable = tableName.replace(/[^a-z0-9_]/gi, '').toLowerCase();
        const isPostgres = !!process.env.DATABASE_URL;
        
        if (isPostgres) {
            const [rows] = await db.query(
                "SELECT column_name as \"Field\", data_type as \"Type\" FROM information_schema.columns WHERE table_schema = 'public' AND table_name = ?",
                [sanitizedTable]
            );
            return rows.filter(col => !['id', 'created_at'].includes(col.Field));
        } else {
            const [rows] = await db.query(`SHOW COLUMNS FROM \`${sanitizedTable}\``);
            return rows.filter(col => !['id', 'created_at'].includes(col.Field));
        }
    }
}

module.exports = EntityModel;

