async function testBollsAndSefaria() {
    // 1. Bolls HEB
    try {
        const url = 'https://bolls.life/get-chapter/HEB/5/32/';
        const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' } });
        if (res.ok) {
            const data = await res.json();
            console.log('Bolls count:', data.length);
            console.log('Sample item:', data[15]);
        }
    } catch(e) {
        console.log('Bolls err:', e.message);
    }

    // 2. Sefaria with full headers
    try {
        const url = 'https://www.sefaria.org/api/texts/Deuteronomy.32.16-18?context=0';
        const res = await fetch(url, { 
            headers: { 
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'application/json'
            } 
        });
        console.log('Sefaria Status with full headers:', res.status);
        if (res.ok) {
            const data = await res.json();
            console.log('Sefaria he:', data.he);
        }
    } catch(e) {
        console.log('Sefaria err:', e.message);
    }
}
testBollsAndSefaria();
