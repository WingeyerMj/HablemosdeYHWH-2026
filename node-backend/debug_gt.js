async function debugTranslate() {
    const text = "Le despertaron a celos con los dioses ajenos";
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=es&tl=he&dt=t&q=${encodeURIComponent(text)}`;
    console.log('Fetching:', url);
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    console.log('Status:', res.status);
    const textRes = await res.text();
    console.log('Response text:', textRes);
}
debugTranslate();
