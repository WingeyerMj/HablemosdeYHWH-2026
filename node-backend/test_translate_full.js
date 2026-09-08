const { transliterateHebrewToSpanish } = require('./src/utils/hebrewHelper');

async function translateText(text, from = 'es', to = 'he') {
    if (!text || !text.trim()) return '';
    
    // Method 1: Google clients5 dict-chrome-ex (super fast, no rate limit)
    try {
        const url = `https://clients5.google.com/translate_a/t?client=dict-chrome-ex&sl=${from}&tl=${to}&q=${encodeURIComponent(text.trim())}`;
        const res = await fetch(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
        });
        if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data) && data[0]) {
                return data[0];
            }
        }
    } catch(e) {
        console.warn('clients5 error:', e.message);
    }

    // Method 2: Google single dict-chrome-ex
    try {
        const url = `https://translate.googleapis.com/translate_a/single?client=dict-chrome-ex&sl=${from}&tl=${to}&dt=t&q=${encodeURIComponent(text.trim())}`;
        const res = await fetch(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
        });
        if (res.ok) {
            const data = await res.json();
            if (data && data[0] && Array.isArray(data[0])) {
                return data[0].map(item => item[0]).join('');
            }
        }
    } catch(e) {
        console.warn('single error:', e.message);
    }

    return text;
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
    const t0 = Date.now();
    const result = await translateText(testText, 'es', 'he');
    console.log(`Translation completed in ${Date.now() - t0}ms:`);
    console.log(result);
    console.log('\nPhonetics:\n' + transliterateHebrewToSpanish(result));
})();
