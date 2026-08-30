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
    '\u05C0': '|',  // Paseq (׀)
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

// Libros bíblicos de la Torá (español a Sefaria / Hebreo)
const TORA_BOOKS = {
    'genesis': 'Genesis',
    'génesis': 'Genesis',
    'gen': 'Genesis',
    'bereshit': 'Genesis',
    'exodo': 'Exodus',
    'éxodo': 'Exodus',
    'exo': 'Exodus',
    'shemot': 'Exodus',
    'levitico': 'Leviticus',
    'levítico': 'Leviticus',
    'lev': 'Leviticus',
    'vayikra': 'Leviticus',
    'vayikrá': 'Leviticus',
    'numeros': 'Numbers',
    'números': 'Numbers',
    'num': 'Numbers',
    'bemidbar': 'Numbers',
    'deuteronomio': 'Deuteronomy',
    'deut': 'Deuteronomy',
    'dt': 'Deuteronomy',
    'devarim': 'Deuteronomy'
};

/**
 * Transliterar texto en hebreo (con o sin Niqqud) a fonética en español
 */
function transliterateHebrewToSpanish(text) {
    if (!text || typeof text !== 'string') return '';

    // Si el texto tiene HTML, procesar línea por línea o preservar etiquetas
    const lines = text.split('\n');
    const translatedLines = lines.map(line => {
        // Remover etiquetas HTML temporales si las hay para transliterar
        const clean = line.replace(/<[^>]*>/g, ' ');
        let result = '';
        let i = 0;

        while (i < clean.length) {
            const char = clean[i];
            const nextChar = clean[i + 1] || '';
            const nextNextChar = clean[i + 2] || '';

            // Revisar si es espacio o puntuación
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

            // Vav como consonante o vocal
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

        // Limpieza fonética para español
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
 * Normalizar cita bíblica para consulta a Sefaria
 * Ej: "Génesis 1:1 - 2:3" -> "Genesis.1.1-2.3"
 */
function parseBibleReference(refString) {
    if (!refString) return null;
    const clean = refString.toLowerCase().trim();
    const parts = clean.split(/[\s]+/);
    if (parts.length < 2) return null;

    const bookKey = parts[0].replace(/[^a-záéíóú]/g, '');
    const sefariaBook = TORA_BOOKS[bookKey];
    if (!sefariaBook) return null;

    const chapterVerse = parts.slice(1).join('').replace(/\s+/g, '');
    return `${sefariaBook}.${chapterVerse.replace(':', '.')}`;
}

/**
 * Consultar texto en Hebreo y Traducción al Español desde Sefaria API
 */
async function fetchVersesFromSefaria(refString) {
    try {
        const sefariaRef = parseBibleReference(refString);
        if (!sefariaRef) return null;

        const url = `https://www.sefaria.org/api/texts/${encodeURIComponent(sefariaRef)}?context=0&commentary=0`;
        const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        if (!res.ok) return null;

        const data = await res.json();
        if (!data || !data.he) return null;

        const cleanHebrew = (text) => {
            if (!text) return '';
            return text
                .replace(/<sup[^>]*>.*?<\/sup>/gi, '')
                .replace(/<i\s+class="footnote"[^>]*>.*?<\/i>/gi, '')
                .replace(/<span\s+class="mam-spi-samekh"[^>]*>.*?<\/span>/gi, '')
                .replace(/<[^>]*>/g, '')
                .replace(/&thinsp;/g, ' ')
                .replace(/&nbsp;/g, ' ')
                .replace(/\s+/g, ' ')
                .trim();
        };

        let hebrewArray = [];
        if (Array.isArray(data.he)) {
            hebrewArray = data.he.map(v => cleanHebrew(v));
        } else {
            hebrewArray = [cleanHebrew(data.he)];
        }

        const hebrewFormatted = hebrewArray
            .map((v, i) => `<p><strong class="verse-num">(${i + 1})</strong> ${v}</p>`)
            .join('\n');

        // Generar fonética
        const phoneticText = transliterateHebrewToSpanish(hebrewArray.join('\n'));

        // Obtener texto en inglés / original de Sefaria y traducirlo al Español
        let rawTexts = [];
        if (Array.isArray(data.text)) {
            rawTexts = data.text.map(t => cleanHebrew(t));
        } else if (data.text) {
            rawTexts = [cleanHebrew(data.text)];
        }

        let spanishVerses = [];
        if (rawTexts.length > 0) {
            const combinedText = rawTexts.map((t, idx) => `(${idx + 1}) ${t}`).join(' ');
            try {
                const trUrl = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=es&dt=t&q=' + encodeURIComponent(combinedText);
                const trRes = await fetch(trUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
                if (trRes.ok) {
                    const trData = await trRes.json();
                    if (trData && trData[0]) {
                        const fullTranslated = trData[0].map(item => item[0]).join('');
                        spanishVerses = fullTranslated.split(/(?=\(\d+\))/g).filter(s => s.trim().length > 0);
                    }
                }
            } catch(e) {
                console.warn('Error al traducir versículos a español:', e.message);
            }
        }

        let spanishFormatted = '';
        if (spanishVerses.length > 0) {
            spanishFormatted = spanishVerses
                .map(v => `<p>${v.replace(/\((\d+)\)/, '<strong class="verse-num">($1)</strong>')}</p>`)
                .join('\n');
        } else if (rawTexts.length > 0) {
            spanishFormatted = rawTexts
                .map((v, i) => `<p><strong class="verse-num">(${i + 1})</strong> ${v}</p>`)
                .join('\n');
        }

        return {
            hebrew: hebrewFormatted,
            phonetic: phoneticText,
            englishOrSpanish: spanishFormatted,
            hebrewRaw: hebrewArray.join('\n')
        };
    } catch (e) {
        console.warn('Error fetchVersesFromSefaria:', e.message);
        return null;
    }
}

/**
 * Traducir texto de Español a Hebreo y generar Fonética en español automáticamente
 */
async function translateSpanishToHebrewAndPhonetics(spanishText) {
    if (!spanishText || typeof spanishText !== 'string' || spanishText.trim() === '') {
        return { hebrew: '', phonetic: '' };
    }

    // Remover tags HTML temporales para traducir el texto limpio
    const cleanText = spanishText
        .replace(/<p>/gi, '\n')
        .replace(/<\/p>/gi, '')
        .replace(/<br\s*[\/]?>/gi, '\n')
        .replace(/<[^>]*>/g, '')
        .trim();

    if (!cleanText) {
        return { hebrew: '', phonetic: '' };
    }

    let hebrewResult = '';

    try {
        // Intentar con Google Translate API público
        const url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=es&tl=he&dt=t&q=' + encodeURIComponent(cleanText);
        const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        if (res.ok) {
            const data = await res.json();
            if (data && data[0] && Array.isArray(data[0])) {
                hebrewResult = data[0].map(item => item[0]).join('');
            }
        }
    } catch(e) {
        console.warn('Error en Google translate API:', e.message);
    }

    // Fallback a MyMemory si falló
    if (!hebrewResult) {
        try {
            const myMemoryUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(cleanText.substring(0, 500))}&langpair=es|he`;
            const mmRes = await fetch(myMemoryUrl);
            if (mmRes.ok) {
                const mmData = await mmRes.json();
                if (mmData && mmData.responseData && mmData.responseData.translatedText) {
                    hebrewResult = mmData.responseData.translatedText;
                }
            }
        } catch(e) {
            console.warn('Error en MyMemory translation:', e.message);
        }
    }

    if (!hebrewResult) {
        throw new Error('No se pudo completar la traducción automática al hebreo.');
    }

    // Generar la pronunciación fonética en español
    const phoneticResult = transliterateHebrewToSpanish(hebrewResult);

    return {
        hebrew: hebrewResult,
        phonetic: phoneticResult
    };
}

module.exports = {
    transliterateHebrewToSpanish,
    fetchVersesFromSefaria,
    parseBibleReference,
    translateSpanishToHebrewAndPhonetics
};
