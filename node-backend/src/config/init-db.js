const fs = require('fs');
const path = require('path');

/**
 * Divide un script SQL en sentencias individuales, respetando bloques DO $$ ... END $$;
 */
function splitSQLStatements(sql) {
    const statements = [];
    let current = '';
    let inDollarBlock = false;
    const lines = sql.split('\n');

    for (const line of lines) {
        const trimmed = line.trim();

        // Ignorar líneas de solo comentarios
        if (trimmed.startsWith('--') && !inDollarBlock) {
            continue;
        }

        // Detectar inicio de bloque DO $$
        if (!inDollarBlock && (trimmed.startsWith('DO $$') || trimmed.startsWith('DO $'))) {
            inDollarBlock = true;
            current += line + '\n';
            continue;
        }

        // Detectar fin de bloque DO $$ (END $$;)
        if (inDollarBlock && trimmed.match(/^END\s*\$\$\s*;?\s*$/i)) {
            current += line + '\n';
            inDollarBlock = false;
            // Agregar el bloque completo como una sentencia
            const stmt = current.trim();
            if (stmt.length > 0) {
                statements.push(stmt);
            }
            current = '';
            continue;
        }

        if (inDollarBlock) {
            current += line + '\n';
            continue;
        }

        // Fuera de bloques DO: dividir por ;
        current += line + '\n';
        if (trimmed.endsWith(';')) {
            const stmt = current.trim();
            if (stmt.length > 0 && !stmt.startsWith('--')) {
                // Quitar el ; final para pg si es necesario (pg.query no lo necesita)
                statements.push(stmt);
            }
            current = '';
        }
    }

    // Si queda algo pendiente
    const remaining = current.trim();
    if (remaining.length > 0 && !remaining.startsWith('--')) {
        statements.push(remaining);
    }

    return statements;
}

async function initDB(db) {
    try {
        console.log('--- Comprobando tablas en la base de datos ---');

        // Elegir el archivo SQL según el entorno
        const sqlFile = process.env.DATABASE_URL ? 'database_pg.sql' : 'database.sql';
        const sqlPath = path.join(__dirname, '../../../', sqlFile);
        const sql = fs.readFileSync(sqlPath, 'utf8');

        let statements;
        if (process.env.DATABASE_URL) {
            // PostgreSQL: usar parser inteligente que respeta bloques DO $$
            statements = splitSQLStatements(sql);
        } else {
            // MySQL: simple split por ;
            statements = sql
                .split(';')
                .map(s => s.trim())
                .filter(s => s.length > 0 && !s.startsWith('--'));
        }

        console.log(`--- Ejecutando ${statements.length} sentencias SQL (${sqlFile}) ---`);

        let errors = 0;
        for (let i = 0; i < statements.length; i++) {
            const stmt = statements[i];
            try {
                await db.query(stmt);
                console.log(`  [OK] Sentencia ${i + 1}/${statements.length} ejecutada`);
            } catch (err) {
                // Errores no críticos: columna duplicada, dato ya existente, etc.
                const ignorable = [
                    'ER_DUP_FIELDNAME',   // Duplicate column name
                    'ER_DUP_ENTRY',       // Duplicate entry
                    'ER_TABLE_EXISTS',    // Table already exists
                    'ER_DUP_KEYNAME',     // Duplicate key name
                    '42P07',              // PostgreSQL: relation already exists
                    '42701',              // PostgreSQL: column already exists
                    '23505',              // PostgreSQL: unique_violation (duplicate key)
                ];
                if (ignorable.includes(err.code)) {
                    console.warn(`  [WARN] Ignorando error no crítico: ${err.message ? err.message.split('\n')[0] : err}`);
                    errors++;
                } else {
                    console.error(`  [ERROR] Sentencia ${i + 1} fallida: ${stmt.substring(0, 100)}...`);
                    console.error(`          Error: ${err.message}`);
                    errors++;
                }
            }
        }
        console.log(`--- Esquema de base de datos verificado/actualizado (${sqlFile}) ${errors > 0 ? `con ${errors} advertencia(s)` : ''} ---`);

        // Verificar si las tablas existen ahora
        const [tables] = await db.query(process.env.DATABASE_URL ?
            "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'" :
            "SHOW TABLES");
        console.log('--- Tablas detectadas en la DB:', tables.map(t => t.table_name || Object.values(t)[0]).join(', '));

        // Asegurar que las contraseñas estén correctamente hasheadas
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash('admin123', 10);

        console.log('--- Verificando credenciales... ---');
        await db.query('UPDATE users SET password = ? WHERE username IN (?, ?)', [hashedPassword, 'admin', 'editor']);
        console.log('--- Credenciales actualizadas exitosamente ---');
    } catch (error) {
        console.error('--- ERROR CRÍTICO AL INICIALIZAR LA BASE DE DATOS ---');
        console.error(error);
        throw error;
    }
}

module.exports = initDB;
