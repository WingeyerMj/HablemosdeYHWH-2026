/**
 * Orden manual (arrastrar y soltar) genérico para las secciones del panel.
 * Cada clave pública se mapea a una tabla permitida (lista blanca).
 */
const db = require('../config/db');

const SORTABLE_TABLES = {
    parashot: 'parashot',
    haftarot: 'haftarot',
    ensenanzas: 'ensenanzas',
    seder: 'seder',
    portfolio: 'portfolio',
    blog: 'blog_posts',
    noticias: 'noticias',
    'noticias-shorts': 'noticias_shorts',
    team: 'team',
    testimonials: 'testimonials',
    semillas: 'semillas_torah',
    'semillas-articulos': 'semillas_articulos',
    'semillas-shorts': 'semillas_shorts',
    'semillas-manualidades': 'semillas_manualidades',
    'parashot-infantiles': 'parashot_infantiles',
    'reuniones-shabat-ninos': 'reuniones_shabat_ninos',
    musica: 'music_tracks'
};

const ensured = new Set();

function isMissingTable(err) {
    const code = err && (err.code || err.errno);
    return code === 'ER_NO_SUCH_TABLE' || code === 1146 || code === '42P01';
}

async function ensureSortOrderColumn(table) {
    if (ensured.has(table)) return true;
    try {
        await db.query(`SELECT sort_order FROM ${table} LIMIT 1`);
        ensured.add(table);
        return true;
    } catch (err) {
        if (isMissingTable(err)) return false;
        try {
            await db.query(`ALTER TABLE ${table} ADD COLUMN sort_order INT DEFAULT 0`);
            ensured.add(table);
            console.log(`✅ Columna sort_order agregada a ${table}`);
            return true;
        } catch (alterErr) {
            console.warn(`⚠️ No se pudo agregar sort_order a ${table}:`, alterErr.message);
            return false;
        }
    }
}

async function ensureAllSortOrderColumns() {
    for (const table of new Set(Object.values(SORTABLE_TABLES))) {
        await ensureSortOrderColumn(table);
    }
}

async function saveOrder(key, ids) {
    const table = SORTABLE_TABLES[key];
    if (!table) throw new Error('Sección no permitida para ordenar.');
    const cleanIds = (ids || []).map(id => parseInt(id, 10)).filter(n => Number.isInteger(n) && n > 0);
    if (cleanIds.length === 0) throw new Error('Lista de IDs vacía.');
    const ok = await ensureSortOrderColumn(table);
    if (!ok) throw new Error('La tabla no está disponible.');
    for (let i = 0; i < cleanIds.length; i++) {
        await db.query(`UPDATE ${table} SET sort_order = ? WHERE id = ?`, [i + 1, cleanIds[i]]);
    }
    return cleanIds.length;
}

module.exports = { SORTABLE_TABLES, ensureSortOrderColumn, ensureAllSortOrderColumns, saveOrder };
