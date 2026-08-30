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
 * Transliterar texto en hebreo (con o sin Niqqud) a fonética en español
 */
function transliterateHebrewToSpanish(text) {
    if (!text || typeof text !== 'string') return '';

    const lines = text.split('\n');
    const translatedLines = lines.map(line => {
        const clean = line.replace(/<[^>]*>/g, ' ');
        let result = '';
        let i = 0;

        while (i < clean.length) {
            const char = clean[i];
            const nextChar = clean[i + 1] || '';
            const nextNextChar = clean[i + 2] || '';

            // Signos de cantilación hebreos (U+0591 a U+05AF): ignorar
            if (char >= '\u0591' && char <= '\u05AF') {
                i++;
                continue;
            }

            // Espacios y puntuaciones
            if (/[\s\.,;:\-\(\)\[\]]/.test(char)) {
                result += char;
                i++;
                continue;
            }

            // Detección de Shin vs Sin
            if (char === 'ש') {
                if (nextChar === '\u05C1' || nextNextChar === '\u05C1') {
                    result += 'sh';
                } else if (nextChar === '\u05C2' || nextNextChar === '\u05C2') {
                    result += 's';
                } else {
                    result += 'sh';
                }
                i++;
                continue;
            }

            // Bet / Vet con dagesh
            if (char === 'ב') {
                if (nextChar === '\u05BC' || nextNextChar === '\u05BC') {
                    result += 'b';
                } else {
                    result += 'v';
                }
                i++;
                continue;
            }

            // Kaf / Jaf con dagesh
            if (char === 'כ' || char === 'ך') {
                if (nextChar === '\u05BC' || nextNextChar === '\u05BC') {
                    result += 'k';
                } else {
                    result += 'j';
                }
                i++;
                continue;
            }

            // Pe / Fe con dagesh
            if (char === 'פ' || char === 'ף') {
                if (nextChar === '\u05BC' || nextNextChar === '\u05BC') {
                    result += 'p';
                } else {
                    result += 'f';
                }
                i++;
                continue;
            }

            // Vav
            if (char === 'ו') {
                if (nextChar === '\u05BC') {
                    result += 'u';
                    i += 2;
                    continue;
                } else if (nextChar === '\u05B9') {
                    result += 'o';
                    i += 2;
                    continue;
                } else {
                    result += 'v';
                    i++;
                    continue;
                }
            }

            // Consonante estándar
            if (CONSONANTS[char] !== undefined) {
                result += CONSONANTS[char];
                i++;
                continue;
            }

            // Niqqud / Vocal
            if (NIQQUD[char] !== undefined) {
                result += NIQQUD[char];
                i++;
                continue;
            }

            // Cualquier otro carácter (números, letras latinas)
            result += char;
            i++;
        }

        return result
            .replace(/aa+/g, 'a')
            .replace(/ee+/g, 'e')
            .replace(/ii+/g, 'i')
            .replace(/oo+/g, 'o')
            .replace(/uu+/g, 'u')
            .replace(/\s+/g, ' ')
            .trim();
    });

    return translatedLines.join('\n');
}

/**
 * Normalizar cita bíblica
 */
function parseTorahReference(refString) {
    if (!refString) return null;
    const clean = refString.toLowerCase().replace(/[\t\r\n]/g, ' ').trim();

    const match = clean.match(/^([a-záéíóú]+)[\s\.]*(\d+)[\s:\.,]+(\d+)(?:\s*[\-–—]\s*(\d+))?/i);
    if (!match) return null;

    const bookKey = match[1].replace(/[^a-záéíóú]/g, '');
    const bookNum = TORA_BOOKS_NUM[bookKey];
    if (!bookNum) return null;

    const chapter = parseInt(match[2], 10);
    const startVerse = parseInt(match[3], 10);
    const endVerse = match[4] ? parseInt(match[4], 10) : startVerse;

    return {
        bookNum,
        sefariaBook: TORA_BOOKS_SEFARIA[bookKey] || 'Genesis',
        chapter,
        startVerse,
        endVerse
    };
}

/**
 * Consultar texto en Hebreo y Traducción al Español (Westminster Leningrad Codex Masorético + RV1960)
 */
async function fetchVersesFromSefaria(refString) {
    try {
        const parsed = parseTorahReference(refString);
        if (!parsed) return null;

        const { bookNum, chapter, startVerse, endVerse, sefariaBook } = parsed;

        // 1. Intentar con Bolls Bible API (WLC = Texto Masorético Hebreo con Niqqud completo, RV1960 = Español)
        try {
            const [resHe, resEs] = await Promise.all([
                fetch(`https://bolls.life/get-chapter/WLC/${bookNum}/${chapter}/`),
                fetch(`https://bolls.life/get-chapter/RV1960/${bookNum}/${chapter}/`)
            ]);

            if (resHe.ok) {
                const heData = await resHe.json();
                const esData = resEs.ok ? await resEs.json() : [];

                if (Array.isArray(heData) && heData.length > 0) {
                    const heFiltered = heData.filter(v => v.verse >= startVerse && v.verse <= endVerse);
                    const esFiltered = Array.isArray(esData) ? esData.filter(v => v.verse >= startVerse && v.verse <= endVerse) : [];

                    if (heFiltered.length > 0) {
                        const cleanHe = (t) => t.replace(/<[^>]*>/g, '').replace(/[\u0591-\u05AF]/g, '').trim();

                        const hebrewFormatted = heFiltered
                            .map(v => `<p><strong class="verse-num">(${v.verse})</strong> ${cleanHe(v.text)}</p>`)
                            .join('\n');

                        const phoneticLines = heFiltered
                            .map(v => `(${v.verse}) ${transliterateHebrewToSpanish(cleanHe(v.text))}`)
                            .join('\n');

                        let spanishFormatted = '';
                        if (esFiltered.length > 0) {
                            spanishFormatted = esFiltered
                                .map(v => `<p><strong class="verse-num">(${v.verse})</strong> ${v.text.replace(/<[^>]*>/g, '').trim()}</p>`)
                                .join('\n');
                        } else {
                            // Si no vino español directo, traducir versículo a versículo
                            const translatedVerses = [];
                            for (const v of heFiltered) {
                                const trText = await translateSingleSpanishLine(v.text);
                                translatedVerses.push(`<p><strong class="verse-num">(${v.verse})</strong> ${trText}</p>`);
                            }
                            spanishFormatted = translatedVerses.join('\n');
                        }

                        return {
                            hebrew: hebrewFormatted,
                            phonetic: phoneticLines,
                            englishOrSpanish: spanishFormatted,
                            hebrewRaw: heFiltered.map(v => `(${v.verse}) ${cleanHe(v.text)}`).join('\n')
                        };
                    }
                }
            }
        } catch(e) {
            console.warn('Fallo en Bolls API, intentando con Sefaria API:', e.message);
        }

        // 2. Fallback a Sefaria API
        const sefariaRef = `${sefariaBook}.${chapter}.${startVerse}-${endVerse}`;
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
 * Traducir TODO el texto de Español a Hebreo y generar Fonética completa (sin límite de versículos)
 */
async function translateSpanishToHebrewAndPhonetics(spanishText) {
    if (!spanishText || typeof spanishText !== 'string' || spanishText.trim() === '') {
        return { hebrew: '', phonetic: '' };
    }

    // Dividir el texto pegado en párrafos o versículos individuales
    const rawLines = spanishText
        .replace(/<p>/gi, '\n')
        .replace(/<\/p>/gi, '\n')
        .replace(/<br\s*[\/]?>/gi, '\n')
        .split('\n')
        .map(l => l.replace(/<[^>]*>/g, '').trim())
        .filter(l => l.length > 0);

    if (rawLines.length === 0) {
        return { hebrew: '', phonetic: '' };
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
            const cleanHe = translatedHebrew.trim();
            
            const fullHeLine = prefix ? `${prefix}${cleanHe}` : cleanHe;
            hebrewLines.push(fullHeLine);

            const linePhonetic = transliterateHebrewToSpanish(cleanHe);
            const fullPhoneticLine = prefix ? `${prefix}${linePhonetic}` : linePhonetic;
            phoneticLines.push(fullPhoneticLine);
        }
    }

    const hebrewResult = hebrewLines.join('\n\n');
    const phoneticResult = phoneticLines.join('\n\n');

    return {
        hebrew: hebrewResult,
        phonetic: phoneticResult
    };
}

module.exports = {
    transliterateHebrewToSpanish,
    fetchVersesFromSefaria,
    parseBibleReference: parseTorahReference,
    translateSpanishToHebrewAndPhonetics
};
