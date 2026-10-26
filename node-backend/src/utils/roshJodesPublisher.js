const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ORDINALS = ['', 'Primero', 'Segundo', 'Tercero', 'Cuarto', 'Quinto', 'Sexto', 'Séptimo', 'Octavo', 'Noveno', 'Décimo', 'Undécimo', 'Duodécimo', 'Decimotercero'];
const DAY = 86400000;

function loadMonths(directory) {
    const months = [];
    for (const file of fs.readdirSync(directory).filter(name => /^year\d{4}\.js$/.test(name)).sort()) {
        const source = fs.readFileSync(path.join(directory, file), 'utf8');
        const context = { module: { exports: {} } };
        vm.runInNewContext(source.replace(/export\s+const\s+\w+\s*=/, 'module.exports ='), context, { timeout: 1000 });
        const data = context.module.exports;
        for (const month of data.months) {
            const date = new Date(month.roshJodes);
            const number = month.index + 1;
            if (!Number.isFinite(date.getTime()) || !ORDINALS[number]) throw new Error('Fecha o mes inválido en ' + file);
            months.push({ year: data.year, number, date: date.toISOString(), dateOnly: date.toISOString().slice(0, 10) });
        }
    }
    if (!months.length) throw new Error('No hay fechas en el calendario del sitio');
    return months;
}

function dueEvents(months, now = new Date()) {
    const timestamp = new Date(now).getTime();
    if (!Number.isFinite(timestamp)) throw new Error('Fecha actual inválida');
    return months.filter(month => {
        const date = Date.parse(month.date);
        return timestamp >= date - 2 * DAY && timestamp <= date;
    }).map(month => ({
        ...month,
        key: `rosh-jodes:${month.year}:${month.number}`,
        title: `Rosh Jodes · Mes ${ORDINALS[month.number].toLowerCase()}`,
        subtitle: `Inicio del mes ${ORDINALS[month.number].toLowerCase()} · Calendario lunisolar`,
        image: `/assets/img/rosh-jodes/salmos81.png`,
        publishAt: new Date(Date.parse(month.date) - 2 * DAY).toISOString()
    }));
}

function createPublisher(db, options = {}) {
    const directory = options.calendarDirectory || path.resolve(__dirname, '../../../Calendar/js/data');
    let running = false;
    let schemaReady = false;
    return async function publish(now = new Date()) {
        if (running) return { skipped: true };
        running = true;
        try {
            if (!schemaReady) {
                try {
                    await db.query('ALTER TABLE portfolio ADD COLUMN automation_key VARCHAR(100) UNIQUE');
                } catch (error) {
                    if (error.code !== 'ER_DUP_FIELDNAME' && error.code !== '42701') throw error;
                }
                schemaReady = true;
            }
            const months = loadMonths(directory);
            if (Date.parse(months[months.length - 1].date) < new Date(now).getTime()) {
                throw new Error('Actualizar los años precalculados del calendario: se agotaron las fechas de Rosh Jodes');
            }
            const events = dueEvents(months, now);
            let created = 0;
            for (const event of events) {
                const [existing] = await db.query('SELECT id FROM portfolio WHERE automation_key = ? OR (event_date = ? AND (LOWER(title) LIKE ? OR LOWER(title) LIKE ?)) LIMIT 1', [event.key, event.dateOnly, '%rosh jodes%', '%rosh chodes%']);
                if (existing.length) continue;
                const description = `Rosh Jodes: inicio del mes ${ORDINALS[event.number].toLowerCase()}. Fecha según el calendario lunisolar de Hablemos de YHWH: ${event.dateOnly.split('-').reverse().join('/')}.`;
                const content = `<p>${description}</p><p>Consulta los detalles de esta fecha en <a href="/calendar/">nuestro calendario</a>.</p>`;
                try {
                    await db.query('INSERT INTO portfolio (title, subtitle, category, description, content, event_date, image_url, img, is_published, automation_key) VALUES (?, ?, ?, ?, ?, ?, ?, ?, TRUE, ?)', [event.title, event.subtitle, 'Moedim', description, content, event.dateOnly, event.image, event.image, event.key]);
                    created++;
                    console.log('[Rosh Jodes] Publicado: ' + event.title + ' (' + event.dateOnly + ')');
                } catch (error) {
                    if (error.code !== 'ER_DUP_ENTRY' && error.code !== '23505') throw error;
                }
            }
            return { created, due: events.length };
        } finally { running = false; }
    };
}

function start(db) {
    const publish = createPublisher(db);
    const run = () => publish().catch(error => console.error('[Rosh Jodes] ' + error.message));
    run();
    const timer = setInterval(run, 60 * 1000);
    timer.unref();
    return timer;
}

module.exports = { ORDINALS, loadMonths, dueEvents, createPublisher, start };

