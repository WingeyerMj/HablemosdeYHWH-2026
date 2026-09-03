const db = require('../config/db');

async function fix() {
    try {
        console.log('--- Consultando Haftarot actuales ---');
        const [hafs] = await db.query('SELECT id, title, image_url, author_img, parasha_id FROM haftarot');
        console.log('Haftarot encontradas:', hafs.length);

        console.log('--- Consultando Parashot para vincular portadas ---');
        const [paras] = await db.query('SELECT id, title, image_url FROM parashot');
        console.log('Parashot encontradas:', paras.length);

        for (const h of hafs) {
            let matchedParasha = null;
            if (h.parasha_id) {
                matchedParasha = paras.find(p => p.id === h.parasha_id);
            }
            if (!matchedParasha) {
                matchedParasha = paras.find(p => {
                    const cleanH = h.title.toLowerCase().replace(/haftará|haftara|parashá|parasha/g, '').trim();
                    const cleanP = p.title.toLowerCase().replace(/parashá|parasha/g, '').trim();
                    return cleanH.includes(cleanP) || cleanP.includes(cleanH);
                });
            }

            console.log(`Haftará ID ${h.id} (${h.title}): portada actual = ${h.image_url} | parashá = ${matchedParasha ? matchedParasha.title + ' (' + matchedParasha.image_url + ')' : 'ninguna'}`);

            if (matchedParasha && matchedParasha.image_url && (!h.image_url || h.image_url.includes('kaleb.jpg') || h.image_url.includes('/team/'))) {
                await db.query('UPDATE haftarot SET image_url = ?, parasha_id = COALESCE(parasha_id, ?) WHERE id = ?', [
                    matchedParasha.image_url,
                    matchedParasha.id,
                    h.id
                ]);
                console.log(`✅ Actualizada portada de Haftará ID ${h.id} a portada de Parashá: ${matchedParasha.image_url}`);
            } else if (h.image_url && (h.image_url.includes('kaleb.jpg') || h.image_url.includes('/team/'))) {
                await db.query('UPDATE haftarot SET image_url = NULL WHERE id = ?', [h.id]);
                console.log(`✅ Limpiada foto de expositor de portada en Haftará ID ${h.id}`);
            }
        }

        const [updatedHafs] = await db.query('SELECT id, title, image_url, parasha_id FROM haftarot');
        console.log('Haftarot actualizadas con éxito:', updatedHafs);
        process.exit(0);
    } catch(e) {
        console.error('Error:', e);
        process.exit(1);
    }
}

fix();
