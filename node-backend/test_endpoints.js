async function testEndpoints() {
    // Test 1: Bolls Bible API (direct verse fetch)
    try {
        const url = 'https://bolls.life/get-chapter/HEB/5/32/';
        const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        console.log('Bolls HEB Status:', res.status);
        if (res.ok) {
            const data = await res.json();
            console.log('Bolls HEB verse 16:', data.find(v => v.verse === 16));
        }
    } catch(e) {
        console.log('Bolls error:', e.message);
    }

    // Test 2: Sefaria Texts API
    try {
        const url = 'https://www.sefaria.org/api/texts/Deuteronomy.32.16-18?context=0';
        const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        console.log('Sefaria Status:', res.status);
        if (res.ok) {
            const data = await res.json();
            console.log('Sefaria HE:', data.he);
        }
    } catch(e) {
        console.log('Sefaria error:', e.message);
    }

    // Test 3: DuckDuckGo translate or Google Translate mobile endpoint
    try {
        const text = 'Le despertaron a celos con los dioses ajenos';
        // Google client=dict-chrome-ex or client=gtx with post
        const url = 'https://translate.googleapis.com/translate_a/single?client=dict-chrome-ex&sl=es&tl=he&dt=t&q=' + encodeURIComponent(text);
        const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        console.log('Google dict-chrome-ex Status:', res.status);
        if (res.ok) {
            const data = await res.json();
            console.log('Google dict translation:', data[0]?.[0]?.[0]);
        }
    } catch(e) {
        console.log('Google dict error:', e.message);
    }

    // Test 4: Google client=webapp
    try {
        const text = 'Le despertaron a celos con los dioses ajenos';
        const url = 'https://clients5.google.com/translate_a/t?client=dict-chrome-ex&sl=es&tl=he&q=' + encodeURIComponent(text);
        const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        console.log('clients5 Status:', res.status);
        if (res.ok) {
            const data = await res.json();
            console.log('clients5 translation:', data);
        }
    } catch(e) {
        console.log('clients5 error:', e.message);
    }
}

testEndpoints();
