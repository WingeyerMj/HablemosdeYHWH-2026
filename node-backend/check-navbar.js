const db = require('./src/config/db');
const DynamicSection = require('./src/models/DynamicSection');

async function test() {
    try {
        const sections = await DynamicSection.getNavbarSections();
        console.log('--- SECCIONES EN NAVBAR ---');
        console.log(JSON.stringify(sections, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}

test();
