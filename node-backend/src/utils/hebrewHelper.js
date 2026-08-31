/**
 * Helper para conversión, fonética en español y obtención de textos hebreos bíblicos
 */

// Mapeo de vocales hebreas (Niqqud) y signos
const NIQQUD = {
    '\u05B0': 'e',  // Sheva (ְ)
    '\u05B1': 'e',  // Hataf Segol (ֱ)
    '\u05B2': 'a',  // Hataf Patach (ֲ)
    '\u05B3': 'o',  // Hataf Qamats (ֳ)
    '\u05B4': 'i',  // Hiriq (ִ)
    '\u05B5': 'e',  // Tsere (ֵ)
    '\u05B6': 'e',  // Segol (ֶ)
    '\u05B7': 'a',  // Patach (ַ)
    '\u05B8': 'a',  // Qamats (ָ)
    '\u05B9': 'o',  // Holam (ֹ)
    '\u05BA': 'o',  // Holam Haser (ֺ)
    '\u05BB': 'u',  // Qubuts (ֻ)
    '\u05BC': '',   // Dagesh o Mapiq (ּ)
    '\u05BD': '',   // Meteg (ֽ)
    '\u05BE': '-',  // Maqaf (־)
    '\u05BF': '',   // Rafe (ֿ)
    '\u05C0': ' ',  // Paseq (׀)
    '\u05C1': '',   // Shin Dot (ׁ)
    '\u05C2': '',   // Sin Dot (ׂ)
    '\u05C3': ':',  // Sof Pasuq (׃)
};

// Mapeo de consonantes
const CONSONANTS = {
    'א': '',
    'ב': 'v',
    'ג': 'g',
    'ד': 'd',
    'ה': 'h',
    'ו': 'v',
    'ז': 'z',
    'ח': 'j',
    'ט': 't',
    'י': 'y',
    'כ': 'j',
    'ך': 'j',
    'ל': 'l',
    'מ': 'm',
    'ם': 'm',
    'נ': 'n',
    'ן': 'n',
    'ס': 's',
    'ע': "'",
    'פ': 'f',
    'ף': 'f',
    'צ': 'tz',
    'ץ': 'tz',
    'ק': 'k',
    'ר': 'r',
    'ש': 'sh',
    'ת': 't'
};

// Libros bíblicos de la Torá
const TORA_BOOKS_NUM = {
    'genesis': 1, 'génesis': 1, 'gen': 1, 'gn': 1, 'bereshit': 1,
    'exodo': 2, 'éxodo': 2, 'exo': 2, 'ex': 2, 'shemot': 2,
    'levitico': 3, 'levítico': 3, 'lev': 3, 'lv': 3, 'vayikra': 3, 'vayikrá': 3,
    'numeros': 4, 'números': 4, 'num': 4, 'nm': 4, 'bemidbar': 4,
    'deuteronomio': 5, 'deut': 5, 'dt': 5, 'devarim': 5
};

const TORA_BOOKS_SEFARIA = {
    'genesis': 'Genesis', 'génesis': 'Genesis', 'gen': 'Genesis', 'bereshit': 'Genesis',
    'exodo': 'Exodus', 'éxodo': 'Exodus', 'exo': 'Exodus', 'shemot': 'Exodus',
    'levitico': 'Leviticus', 'levítico': 'Leviticus', 'lev': 'Leviticus', 'vayikra': 'Leviticus', 'vayikrá': 'Leviticus',
    'numeros': 'Numbers', 'números': 'Numbers', 'num': 'Numbers', 'bemidbar': 'Numbers',
    'deuteronomio': 'Deuteronomy', 'deut': 'Deuteronomy', 'dt': 'Deuteronomy', 'devarim': 'Deuteronomy'
};

/**
 * Verificar si el texto hebreo contiene vocales Niqqud
 */
function hasNiqqud(text) {
    if (!text) return false;
    return /[\u05B0-\u05BD]/.test(text);
}

/**
 * Para hebreo sin Niqqud (ej: de Google Translate), insertar vocales por defecto
 * entre consonantes para que la transliteración sea legible en español.
 * Esto es una aproximación fonética, no perfecta, pero mucho más legible que solo consonantes.
 */
function addDefaultVowels(hebrewText) {
    if (!hebrewText) return '';
    
    const consonants = new Set('אבגדהוזחטיכךלמםנןסעפףצץקרשת');
    const result = [];
    const chars = [...hebrewText];
    
    for (let i = 0; i < chars.length; i++) {
        const ch = chars[i];
        result.push(ch);
        
        // Si es consonante y la siguiente también es consonante (sin vocal entre ellas)
        if (consonants.has(ch)) {
            const next = chars[i + 1];
            if (next && consonants.has(next)) {
                // No insertar vocal antes de letra final (ם, ן, ך, ף, ץ)
                const finals = new Set('םןךףץ');
                if (finals.has(next)) continue;
                
                // Insertar Sheva (ְ) como vocal por defecto entre consonantes
                result.push('\u05B0'); // Sheva → se transliterará como 'e'
            }
        }
    }
    
    return result.join('');
}

/**
 * Transliterar texto en hebreo (con o sin Niqqud) a fonética natural y vocalizada en español
 */
function transliterateHebrewToSpanish(text) {
    if (!text || typeof text !== 'string') return '';

    const sacredMap = {
        'יְהוָה': 'Yehováh',
        'יְהוָ֣ה': 'Yehováh',
        'יְהוָ֛ה': 'Yehováh',
        'יְהוָ֥ה': 'Yehováh',
        'יְהֹוָה': 'Yehováh',
        'יהוה': 'Yehováh',
        'אֱלֹהֶיךָ': 'Eloheyja',
        'אֱלֹהֵינוּ': 'Eloheynu',
        'אֱלֹהִים': 'Elohim',
        'יִשְׂרָאֵל': 'Yisrael',
        'בְּרֵאשִׁית': 'Bereshit',
        'שַׂר': 'sar',
        'שָׂרָה': 'Sarah',
        'אַבְרָהָם': 'Avraham'
    };

    const lines = text.split('\n');
    const translatedLines = lines.map(line => {
        const clean = line
            .replace(/<[^>]*>/g, ' ')
            .replace(/[\u0591-\u05AF]/g, '')
            .replace(/\s+[ספ]\s*$/gm, '')
            .replace(/׃/g, '.');

        const tokens = clean.split(/([\s\-\–\—\.,:\(\)\[\]]+)/);

        const resultTokens = tokens.map(w => {
            if (!w || /^[0-9\s\-\–\—\.,:\(\)\[\]]+$/.test(w)) return w;

            const bare = w.replace(/[.,:;!\?]/g, '');
            if (sacredMap[bare]) {
                return sacredMap[bare];
            }

            let out = '';
            let i = 0;
            const len = w.length;

            while (i < len) {
                const ch = w[i];
                const n1 = w[i+1] || '';
                const n2 = w[i+2] || '';

                // Holam Male: Vav + Holam (וֹ) o Holam + Vav (ֹו)
                if (ch === 'ו' && (n1 === '\u05B9' || n1 === '\u05BA')) {
                    out += 'o';
                    i += 2;
                    continue;
                }
                if ((ch === '\u05B9' || ch === '\u05BA') && n1 === 'ו') {
                    out += 'o';
                    i += 2;
                    continue;
                }

                // Shuruk: Vav + Dagesh (וּ)
                if (ch === 'ו' && n1 === '\u05BC') {
                    out += 'u';
                    i += 2;
                    continue;
                }

                // Hiriq Yod: Hiriq + Yod (ִ + י)
                if (ch === '\u05B4' && n1 === 'י') {
                    out += 'i';
                    i += 2;
                    continue;
                }

                // Tsere Yod: Tsere + Yod (ֵ + י)
                if (ch === '\u05B5' && n1 === 'י') {
                    out += 'ei';
                    i += 2;
                    continue;
                }

                // Segol Yod: Segol + Yod (ֶ + י)
                if (ch === '\u05B6' && n1 === 'י') {
                    out += 'ei';
                    i += 2;
                    continue;
                }

                // Patach / Qamats Yod: (ַ / ָ + י)
                if ((ch === '\u05B7' || ch === '\u05B8') && n1 === 'י') {
                    out += 'ai';
                    i += 2;
                    continue;
                }

                // Shin / Sin con punto
                if (ch === 'ש') {
                    if (n1 === '\u05C1' || n2 === '\u05C1') {
                        out += 'sh';
                        i += (n1 === '\u05C1' ? 2 : (n2 === '\u05C1' ? 3 : 1));
                        continue;
                    } else if (n1 === '\u05C2' || n2 === '\u05C2') {
                        out += 's';
                        i += (n1 === '\u05C2' ? 2 : (n2 === '\u05C2' ? 3 : 1));
                        continue;
                    } else {
                        out += 'sh';
                        i++;
                        continue;
                    }
                }

                // Bet (b / v)
                if (ch === 'ב') {
                    if (n1 === '\u05BC') { out += 'b'; i += 2; }
                    else { out += 'v'; i++; }
                    continue;
                }

                // Kaf / Jaf (k / j)
                if (ch === 'כ' || ch === 'ך') {
                    if (n1 === '\u05BC') { out += 'k'; i += 2; }
                    else { out += 'j'; i += (n1 === '\u05B0' && (i + 2 >= len) ? 2 : 1); }
                    continue;
                }

                // Pe / Fe (p / f)
                if (ch === 'פ' || ch === 'ף') {
                    if (n1 === '\u05BC') { out += 'p'; i += 2; }
                    else { out += 'f'; i++; }
                    continue;
                }

                // Sheva Naj (mudo) al final de palabra o antes de sufijo -ta
                if (ch === '\u05B0') {
                    const restOfWord = w.substring(i + 1);
                    if (/^[ת]\u05BC?[ַָ]/.test(restOfWord) || i + 1 >= len) {
                        i++;
                        continue;
                    }
                    out += 'e';
                    i++;
                    continue;
                }

                // Consonantes
                const consMap = {
                    'א': '', 'ג': 'g', 'ד': 'd', 'ה': 'h', 'ו': 'v', 'ז': 'z',
                    'ח': 'j', 'ט': 't', 'י': 'y', 'ל': 'l', 'מ': 'm', 'ם': 'm',
                    'נ': 'n', 'ן': 'n', 'ס': 's', 'ע': '', 'צ': 'tz', 'ץ': 'tz',
                    'ק': 'k', 'ר': 'r', 'ת': 't'
                };

                if (consMap[ch] !== undefined) {
                    out += consMap[ch];
                    i++;
                    continue;
                }

                // Vocales Niqqud (a, e, i, o, u)
                const vMap = {
                    '\u05B1': 'e', '\u05B2': 'a', '\u05B3': 'o',
                    '\u05B4': 'i', '\u05B5': 'e', '\u05B6': 'e', '\u05B7': 'a',
                    '\u05B8': 'a', '\u05B9': 'o', '\u05BA': 'o', '\u05BB': 'u',
                    '\u05BE': '-'
                };

                if (vMap[ch] !== undefined) {
                    out += vMap[ch];
                    i++;
                    continue;
                }

                if (!/[\u05BC\u05BD\u05BF\u05C0\u05C3]/.test(ch)) {
                    out += ch;
                }
                i++;
            }

            return out
                .replace(/aa+/g, 'a')
                .replace(/ee+/g, 'e')
                .replace(/ii+/g, 'i')
                .replace(/oo+/g, 'o')
                .replace(/uu+/g, 'u')
                .replace(/j+/g, 'j');
        });

        return resultTokens.join('')
            .replace(/\s+\./g, '.')
            .replace(/\s+/g, ' ')
            .trim();
    });

    return translatedLines.join('\n');
}

/**
 * Normalizar cita bíblica (soporta rangos de un solo capítulo y multi-capítulo)
 * Ej: "Deuteronomio 27:11-28:5", "Deuteronomio 27:11 al 28:5", "Deut 27:11-26"
 */
function parseTorahReference(refString) {
    if (!refString) return null;
    const clean = refString.toLowerCase().replace(/[\t\r\n]/g, ' ').trim();

    // 1. Caso multi-capítulo:
    // Ej: "Deuteronomio 27:11 - 28:5", "Deuteronomio 27:11 al Deuteronomio 28:5", "Deut 27:11 a 28:5"
    const multiChapterRegex = /^([a-záéíóú]+)[\s\.]*(\d+)[\s:\.,]+(\d+)\s*(?:[\-–—]|al?|hasta)\s*(?:[a-záéíóú]+[\s\.]*)?(\d+)[\s:\.,]+(\d+)/i;
    const multiMatch = clean.match(multiChapterRegex);

    if (multiMatch) {
        const bookKey = multiMatch[1].replace(/[^a-záéíóú]/g, '');
        const bookNum = TORA_BOOKS_NUM[bookKey];
        if (bookNum) {
            return {
                bookNum,
                sefariaBook: TORA_BOOKS_SEFARIA[bookKey] || 'Genesis',
                startChapter: parseInt(multiMatch[2], 10),
                startVerse: parseInt(multiMatch[3], 10),
                endChapter: parseInt(multiMatch[4], 10),
                endVerse: parseInt(multiMatch[5], 10)
            };
        }
    }

    // 2. Caso de un solo capítulo:
    // Ej: "Deuteronomio 27:11-26", "Deut 27:11"
    const singleChapterRegex = /^([a-záéíóú]+)[\s\.]*(\d+)[\s:\.,]+(\d+)(?:\s*(?:[\-–—]|al?|hasta)\s*(\d+))?/i;
    const singleMatch = clean.match(singleChapterRegex);
    if (singleMatch) {
        const bookKey = singleMatch[1].replace(/[^a-záéíóú]/g, '');
        const bookNum = TORA_BOOKS_NUM[bookKey];
        if (bookNum) {
            const chapter = parseInt(singleMatch[2], 10);
            const startVerse = parseInt(singleMatch[3], 10);
            const endVerse = singleMatch[4] ? parseInt(singleMatch[4], 10) : startVerse;
            return {
                bookNum,
                sefariaBook: TORA_BOOKS_SEFARIA[bookKey] || 'Genesis',
                startChapter: chapter,
                startVerse,
                endChapter: chapter,
                endVerse
            };
        }
    }

    return null;
}

/**
 * Consultar texto en Hebreo y Traducción al Español (Westminster Leningrad Codex Masorético + RV1960)
 * Soporta rangos que abarcan uno o múltiples capítulos.
 */
async function fetchVersesFromSefaria(refString) {
    try {
        const parsed = parseTorahReference(refString);
        if (!parsed) return null;

        const { bookNum, startChapter, startVerse, endChapter, endVerse, sefariaBook } = parsed;
        const isMulti = startChapter !== endChapter;

        // 1. Intentar con Bolls Bible API (WLC = Texto Masorético Hebreo con Niqqud completo, RV1960 = Español)
        try {
            const allHeVerses = [];
            const allEsVerses = [];

            for (let chap = startChapter; chap <= endChapter; chap++) {
                const [resHe, resEs] = await Promise.all([
                    fetch(`https://bolls.life/get-chapter/WLC/${bookNum}/${chap}/`),
                    fetch(`https://bolls.life/get-chapter/RV1960/${bookNum}/${chap}/`)
                ]);

                if (resHe.ok) {
                    const heData = await resHe.json();
                    const esData = resEs.ok ? await resEs.json() : [];

                    if (Array.isArray(heData) && heData.length > 0) {
                        const fromV = (chap === startChapter) ? startVerse : 1;
                        const toV = (chap === endChapter) ? endVerse : 999;

                        const heFiltered = heData.filter(v => v.verse >= fromV && v.verse <= toV).map(v => ({ ...v, chapter: chap }));
                        const esFiltered = (Array.isArray(esData) ? esData : []).filter(v => v.verse >= fromV && v.verse <= toV).map(v => ({ ...v, chapter: chap }));

                        allHeVerses.push(...heFiltered);
                        allEsVerses.push(...esFiltered);
                    }
                }
            }

            if (allHeVerses.length > 0) {
                const cleanHe = (t) => t.replace(/<[^>]*>/g, '').replace(/[\u0591-\u05AF]/g, '').trim();

                const hebrewFormatted = allHeVerses
                    .map(v => {
                        const numLabel = isMulti ? `${v.chapter}:${v.verse}` : `${v.verse}`;
                        return `<p><strong class="verse-num">(${numLabel})</strong> ${cleanHe(v.text)}</p>`;
                    })
                    .join('\n');

                const phoneticLines = allHeVerses
                    .map(v => {
                        const numLabel = isMulti ? `${v.chapter}:${v.verse}` : `${v.verse}`;
                        return `(${numLabel}) ${transliterateHebrewToSpanish(cleanHe(v.text))}`;
                    })
                    .join('\n');

                let spanishFormatted = '';
                if (allEsVerses.length > 0) {
                    spanishFormatted = allEsVerses
                        .map(v => {
                            const numLabel = isMulti ? `${v.chapter}:${v.verse}` : `${v.verse}`;
                            return `<p><strong class="verse-num">(${numLabel})</strong> ${v.text.replace(/<[^>]*>/g, '').trim()}</p>`;
                        })
                        .join('\n');
                } else {
                    const translatedVerses = [];
                    for (const v of allHeVerses) {
                        const trText = await translateSingleSpanishLine(v.text);
                        const numLabel = isMulti ? `${v.chapter}:${v.verse}` : `${v.verse}`;
                        translatedVerses.push(`<p><strong class="verse-num">(${numLabel})</strong> ${trText}</p>`);
                    }
                    spanishFormatted = translatedVerses.join('\n');
                }

                return {
                    hebrew: hebrewFormatted,
                    phonetic: phoneticLines,
                    englishOrSpanish: spanishFormatted,
                    hebrewRaw: allHeVerses.map(v => {
                        const numLabel = isMulti ? `${v.chapter}:${v.verse}` : `${v.verse}`;
                        return `(${numLabel}) ${cleanHe(v.text)}`;
                    }).join('\n')
                };
            }
        } catch(e) {
            console.warn('Fallo en Bolls API, intentando con Sefaria API:', e.message);
        }

        // 2. Fallback a Sefaria API
        const sefariaRef = isMulti 
            ? `${sefariaBook}.${startChapter}.${startVerse}-${endChapter}.${endVerse}`
            : `${sefariaBook}.${startChapter}.${startVerse}-${endVerse}`;
        const url = `https://www.sefaria.org/api/texts/${encodeURIComponent(sefariaRef)}?context=0&commentary=0`;
        const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        if (res.ok) {
            const data = await res.json();
            if (data && data.he) {
                const cleanHebrew = (text) => (text || '').replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
                const heArray = Array.isArray(data.he) ? data.he.map(v => cleanHebrew(v)) : [cleanHebrew(data.he)];
                
                const hebrewFormatted = heArray
                    .map((v, i) => `<p><strong class="verse-num">(${startVerse + i})</strong> ${v}</p>`)
                    .join('\n');

                const phoneticText = heArray
                    .map((v, i) => `(${startVerse + i}) ${transliterateHebrewToSpanish(v)}`)
                    .join('\n');

                let rawTexts = Array.isArray(data.text) ? data.text.map(t => cleanHebrew(t)) : [cleanHebrew(data.text || '')];
                const spanishLines = [];
                for (let i = 0; i < rawTexts.length; i++) {
                    const tr = await translateSingleSpanishLine(rawTexts[i]);
                    spanishLines.push(`<p><strong class="verse-num">(${startVerse + i})</strong> ${tr || rawTexts[i]}</p>`);
                }

                return {
                    hebrew: hebrewFormatted,
                    phonetic: phoneticText,
                    englishOrSpanish: spanishLines.join('\n'),
                    hebrewRaw: heArray.join('\n')
                };
            }
        }

        return null;
    } catch (e) {
        console.warn('Error fetchVersesFromSefaria:', e.message);
        return null;
    }
}

/**
 * Traducir una línea individual de texto
 */
async function translateSingleLine(text, from = 'es', to = 'he') {
    if (!text || text.trim() === '') return '';
    try {
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${from}&tl=${to}&dt=t&q=${encodeURIComponent(text.trim())}`;
        const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        if (res.ok) {
            const data = await res.json();
            if (data && data[0] && Array.isArray(data[0])) {
                return data[0].map(item => item[0]).join('');
            }
        }
    } catch(e) {}

    // Fallback a MyMemory
    try {
        const mmUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text.substring(0, 450))}&langpair=${from}|${to}`;
        const mmRes = await fetch(mmUrl);
        if (mmRes.ok) {
            const mmData = await mmRes.json();
            if (mmData?.responseData?.translatedText) {
                return mmData.responseData.translatedText;
            }
        }
    } catch(e) {}

    return text;
}

async function translateSingleSpanishLine(text) {
    return translateSingleLine(text, 'en', 'es');
}

/**
 * Traducir texto de Español a Hebreo y generar Fonética completa.
 * Si se ingresa una cita bíblica (ej: Deuteronomio 26:1-11), obtiene automáticamente todos los versículos en Hebreo con Niqqud, Español y Fonética.
 */
async function translateSpanishToHebrewAndPhonetics(spanishText, referenceHint = '') {
    if ((!spanishText || typeof spanishText !== 'string' || spanishText.trim() === '') && !referenceHint) {
        return { hebrew: '', phonetic: '', spanish: '' };
    }

    const cleanInput = (spanishText || '').replace(/<[^>]*>/g, ' ').trim();
    const candidateRef = referenceHint || cleanInput;

    // 1. Verificar si el texto ingresado es una cita bíblica de la Torá (ej: "Deuteronomio 26:1-11")
    const parsedRef = parseTorahReference(candidateRef) || parseTorahReference(cleanInput.split('\n')[0]);
    
    // Si se detecta una referencia bíblica válida, siempre usar la API bíblica
    // (prioridad: referenceHint, luego primera línea del texto)
    if (parsedRef) {
        try {
            const bibleResult = await fetchVersesFromSefaria(candidateRef || cleanInput);
            if (bibleResult && bibleResult.hebrewRaw) {
                return {
                    hebrew: bibleResult.hebrewRaw,
                    phonetic: bibleResult.phonetic,
                    spanish: bibleResult.englishOrSpanish || spanishText
                };
            }
        } catch(e) {
            console.warn('Fallo auto-fetch por cita bíblica:', e.message);
        }
    }

    // 2. Si es texto o versículos completos en español pegados, traducir línea a línea / versículo a versículo
    const rawLines = (spanishText || '')
        .replace(/<p>/gi, '\n')
        .replace(/<\/p>/gi, '\n')
        .replace(/<br\s*[\/]?>/gi, '\n')
        .split('\n')
        .map(l => l.replace(/<[^>]*>/g, '').trim())
        .filter(l => l.length > 0);

    if (rawLines.length === 0) {
        return { hebrew: '', phonetic: '', spanish: '' };
    }

    const hebrewLines = [];
    const phoneticLines = [];

    for (const line of rawLines) {
        // Extraer número de versículo si lo tiene (ej: "(1)", "1.", "1 ")
        const verseMatch = line.match(/^(\(?\d+\)?[\.:\-]?\s*)(.*)$/);
        let prefix = '';
        let contentToTranslate = line;

        if (verseMatch) {
            prefix = verseMatch[1].trim() + ' ';
            contentToTranslate = verseMatch[2].trim();
        }

        if (contentToTranslate.length > 0) {
            const translatedHebrew = await translateSingleLine(contentToTranslate, 'es', 'he');
            const cleanHe = (translatedHebrew || contentToTranslate).trim();
            
            const fullHeLine = prefix ? `${prefix}${cleanHe}` : cleanHe;
            hebrewLines.push(fullHeLine);

            // Si el hebreo no tiene Niqqud (ej: Google Translate), insertar vocales por defecto
            // para que la fonética sea legible en español
            const heForPhonetic = hasNiqqud(cleanHe) ? cleanHe : addDefaultVowels(cleanHe);
            const linePhonetic = transliterateHebrewToSpanish(heForPhonetic);
            const fullPhoneticLine = prefix ? `${prefix}${linePhonetic}` : linePhonetic;
            phoneticLines.push(fullPhoneticLine);
        }
    }

    const hebrewResult = hebrewLines.join('\n\n');
    const phoneticResult = phoneticLines.join('\n\n');

    return {
        hebrew: hebrewResult,
        phonetic: phoneticResult,
        spanish: spanishText
    };
}

module.exports = {
    transliterateHebrewToSpanish,
    fetchVersesFromSefaria,
    parseBibleReference: parseTorahReference,
    translateSpanishToHebrewAndPhonetics
};
