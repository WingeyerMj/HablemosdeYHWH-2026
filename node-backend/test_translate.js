const { translateSpanishToHebrewAndPhonetics, fetchVersesFromSefaria, parseBibleReference } = require('./src/utils/hebrewHelper');

const testText = `16
Le despertaron a celos con los dioses ajenos;
Lo provocaron a ira con abominaciones.
17
Sacrificaron a los demonios, y no a Dios;
A dioses que no habían conocido,
A nuevos dioses venidos de cerca,
Que no habían temido vuestros padres.
18
De la Roca que te creó te olvidaste;
Te has olvidado de Dios tu creador.`;

async function run() {
    console.log('1. Test parseBibleReference:');
    console.log(parseBibleReference('Deuteronomio 32:16-18'));
    console.log(parseBibleReference('deut 32:16-18'));

    console.log('\n2. Test fetchVersesFromSefaria:');
    try {
        const t0 = Date.now();
        const res1 = await fetchVersesFromSefaria('Deuteronomio 32:16-18');
        console.log(`fetchVersesFromSefaria took ${Date.now() - t0}ms:`, res1 ? 'Got result' : 'null');
        if (res1) {
            console.log('Hebrew preview:', res1.hebrewRaw ? res1.hebrewRaw.slice(0, 100) : 'none');
        }
    } catch(e) {
        console.error('fetchVersesFromSefaria error:', e);
    }

    console.log('\n3. Test translateSpanishToHebrewAndPhonetics (with reference):');
    try {
        const t0 = Date.now();
        const res2 = await translateSpanishToHebrewAndPhonetics(testText, 'Deuteronomio 32:16-18');
        console.log(`translateSpanishToHebrewAndPhonetics took ${Date.now() - t0}ms:`, res2 ? 'Got result' : 'null');
        if (res2) {
            console.log('Hebrew preview:', res2.hebrew ? res2.hebrew.slice(0, 100) : 'none');
        }
    } catch(e) {
        console.error('translate error:', e);
    }

    console.log('\n4. Test translateSpanishToHebrewAndPhonetics (WITHOUT reference, line by line):');
    try {
        const t0 = Date.now();
        const res3 = await translateSpanishToHebrewAndPhonetics(testText, '');
        console.log(`line by line took ${Date.now() - t0}ms:`, res3 ? 'Got result' : 'null');
        if (res3) {
            console.log('Hebrew preview:', res3.hebrew ? res3.hebrew.slice(0, 100) : 'none');
        }
    } catch(e) {
        console.error('line by line error:', e);
    }
}

run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
