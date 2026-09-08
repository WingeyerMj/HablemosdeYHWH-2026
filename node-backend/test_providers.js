async function testProviders() {
    const text = "Le despertaron a celos con los dioses ajenos";

    // Provider 1: MyMemory
    try {
        const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=es|he`;
        const t0 = Date.now();
        const res = await fetch(url);
        const data = await res.json();
        console.log(`MyMemory (${Date.now() - t0}ms):`, data?.responseData?.translatedText);
    } catch(e) {
        console.log('MyMemory error:', e.message);
    }

    // Provider 2: Lingva instances
    const lingvaHosts = [
        'https://lingva.ml',
        'https://translate.plausibility.cloud',
        'https://lingva.lunar.icu',
        'https://lingva.garudalinux.org'
    ];
    for (const host of lingvaHosts) {
        try {
            const url = `${host}/api/v1/es/he/${encodeURIComponent(text)}`;
            const t0 = Date.now();
            const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
            if (res.ok) {
                const data = await res.json();
                console.log(`Lingva [${host}] (${Date.now() - t0}ms):`, data.translation);
                break;
            }
        } catch(e) {
            console.log(`Lingva [${host}] failed:`, e.message);
        }
    }

    // Provider 3: Sefaria search for verse
    try {
        const searchUrl = `https://www.sefaria.org/api/search/text?q=${encodeURIComponent(text)}&size=1`;
        const t0 = Date.now();
        const res = await fetch(searchUrl);
        const data = await res.json();
        console.log(`Sefaria Search (${Date.now() - t0}ms):`, data?.hits?.hits?.[0]?._source?.ref);
    } catch(e) {
        console.log('Sefaria search error:', e.message);
    }
}

testProviders();
