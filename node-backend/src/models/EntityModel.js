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

        // El primer campo siempre es id (PK)
        let sql = `CREATE TABLE IF NOT EXISTS \`${sanitizedTable}\` (
            id INT AUTO_INCREMENT PRIMARY KEY,`;

        // Procesar campos definidos por el usuario
        fields.forEach(field => {
            const name = field.name.replace(/[^a-z0-9_]/gi, '').toLowerCase();
            const type = field.type === 'text' ? 'TEXT' : 'VARCHAR(255)';
            sql += ` \`${name}\` ${type},`;
        });

        sql += ` created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP )`;

        await db.query(sql);
        return sanitizedTable;
    }

    // Obtener todos los registros de una tabla
    static async getAll(tableName) {
        const [rows] = await db.query(`SELECT * FROM \`${tableName}\` ORDER BY id DESC`);
        return rows;
    }

    // Insertar registro
    static async insert(tableName, data) {
        const [result] = await db.query(`INSERT INTO \`${tableName}\` SET ?`, [data]);
        return result;
    }

    // Eliminar registro
    static async delete(tableName, id) {
        return await db.query(`DELETE FROM \`${tableName}\` WHERE id = ?`, [id]);
    }

    // Obtener columnas de una tabla para conocer su estructura
    static async getColumns(tableName) {
        const [rows] = await db.query(`SHOW COLUMNS FROM \`${tableName}\``);
        // Filtramos id y created_at para no mostrarlos en el formulario de carga
        return rows.filter(col => !['id', 'created_at'].includes(col.Field));
    }
}

module.exports = EntityModel;
