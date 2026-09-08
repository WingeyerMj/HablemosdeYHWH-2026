const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const db = require('../config/db');

async function updateAbout() {
    try {
        const newAboutContent = `Somos una comunidad de buscadores, aprendices y servidores que anhelan conocer más al Eterno y caminar conforme a Su voluntad.
Con profunda gratitud y gozo, nos encontramos forjando una nueva congregación mesiánica: "El Redil de Yeshua", un espacio vivo de comunión, discipulado y estudio profundo de la Torah y las Sagradas Escrituras.
No somos una institución ni una denominación: somos un espacio de estudio, reflexión y encuentro, donde cada persona puede acercarse a la Escritura desde la autenticidad y el respeto.

Creemos en una fe viva, consciente y fundamentada.
Creemos en la importancia de volver a las raíces, al significado profundo del Nombre y a la esencia del mensaje divino.
Y creemos que cada conversación sincera sobre YHWH tiene el poder de despertar, sanar y transformar.`;

        try {
            await db.query('UPDATE home_section_about SET content = ? WHERE id = 1', [newAboutContent]);
            console.log('✅ Actualizado home_section_about en la BD exitosamente');
        } catch(e) {
            console.warn('⚠️ No se pudo actualizar home_section_about:', e.message);
        }

        try {
            await db.query('UPDATE sections SET content = ? WHERE section_name = "About" OR section_name = "about" OR name = "About" OR name = "about"', [newAboutContent]);
            console.log('✅ Actualizado sections en la BD exitosamente');
        } catch(e) {}

    } catch (e) {
        console.error('Error general actualizando about:', e.message);
    }
    process.exit(0);
}

updateAbout();
