const { transliterateHebrewToSpanish, fetchVersesFromSefaria, parseBibleReference } = require('./src/utils/hebrewHelper');

// Let's implement and test the new batch translate function
async function translateTextBatch(text, from = 'es', to = 'he') {
    if (!text || !text.trim()) return '';
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${from}&tl=${to}&dt=t&q=${encodeURIComponent(text.trim())}`;
        const res = await fetch(url, { 
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        if (res.ok) {
            const data = await res.json();
            if (data && data[0] && Array.isArray(data[0])) {
                return data[0].map(item => item[0]).join('');
            }
        }
    } catch(e) {}

    return '';
}

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

(async () => {
    console.log('Testing fast translation:');
    const t0 = Date.now();
    const tr = await translateTextBatch(testText, 'es', 'he');
    console.log(`Finished in ${Date.now() - t0}ms`);
    console.log('Hebrew translation preview:\n' + tr);

    const phonetic = transliterateHebrewToSpanish(tr);
    console.log('\nPhonetic preview:\n' + phonetic);
})();
