const db = require('../config/db');
const Noticia = require('../models/Noticia');

async function migrate() {
    console.log('🔄 Iniciando migración de Noticias y Shorts...');
    try {
        await Noticia.ensureTable();
        console.log('✅ Tablas verificadas o creadas.');

        // Verificar si hay noticias
        const [newsCount] = await db.query('SELECT COUNT(*) as total FROM noticias');
        if (newsCount[0].total === 0) {
            console.log('📰 Insertando noticias de ejemplo...');
            const sampleNews = [
                {
                    title: 'Acontecimientos en Medio Oriente y el Reloj Profético',
                    subtitle: 'Análisis geopolítico y perspectivas de los eventos actuales en Jerusalén y la región',
                    category: 'Israel & Medio Oriente',
                    author: 'Redacción YHWH',
                    summary: 'Un resumen conciso de los recientes acontecimientos en Medio Oriente y su resonancia con las profecías bíblicas de los últimos tiempos.',
                    content: `<h3>Panorama actual y relevancia bíblica</h3>
<p>Los sucesos recientes en Medio Oriente continúan captando la atención mundial. Desde una perspectiva bíblica, observar los movimientos y alianzas en la región no es solo cuestión de política internacional, sino de discernimiento de los tiempos señalados.</p>
<p>El profeta Zacarías y los textos de la Tanaj nos instan a velar y orar por la paz de Jerusalén, recordando que cada evento converge en el plan redentor del Creador.</p>
<blockquote>"Pedid por la paz de Jerusalén; sean prosperados los que te aman." — Salmo 122:6</blockquote>
<p>Mantengámonos atentos, firmes en la oración y profundizando en el estudio de las Escrituras para comprender el momento histórico que atravesamos.</p>`,
                    image_url: 'https://images.unsplash.com/photo-1544928147-79a2dbc1f389?auto=format&fit=crop&w=1200&q=80',
                    source_url: 'https://hablemosdeyhwh.com',
                    tags: 'Israel, Medio Oriente, Profecía, Actualidad',
                    is_breaking: true,
                    is_published: true,
                    published_at: new Date()
                },
                {
                    title: 'Descubrimientos Arqueológicos Recientes en la Ciudad de David',
                    subtitle: 'Hallazgos sellan la autenticidad histórica de los relatos de los Reyes de Judá',
                    category: 'Arqueología Bíblica',
                    author: 'Equipo Editorial',
                    summary: 'Arqueólogos desentierran nuevas inscripciones y sellos del periodo del Primer Templo que confirman nombres mencionados en las Escrituras.',
                    content: `<h3>La tierra continúa dando testimonio</h3>
<p>Excavaciones recientes en la Ciudad de David en Jerusalén han revelado sellos de arcilla (bullas) con inscripciones en paleohebreo que datan de hace más de 2.600 años.</p>
<p>Estos descubrimientos corroboran la precisión histórica de los libros de Reyes y Crónicas, demostrando una vez más que la arqueología sigue respaldando el relato bíblico con evidencia tangible.</p>`,
                    image_url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1200&q=80',
                    source_url: 'https://hablemosdeyhwh.com',
                    tags: 'Arqueología, Jerusalén, Ciudad de David, Historia',
                    is_breaking: false,
                    is_published: true,
                    published_at: new Date(Date.now() - 86400000)
                },
                {
                    title: 'Cambios Globales en la Economía y la Importancia de la Autosuficiencia',
                    subtitle: 'Principios bíblicos de mayordomía y previsión ante la volatilidad mundial',
                    category: 'Mundial',
                    author: 'Redacción YHWH',
                    summary: 'Cómo los principios de la Torah sobre provisiones, descanso de la tierra y mayordomía nos guían en tiempos de incertidumbre económica global.',
                    content: `<h3>Mayordomía sabia en tiempos cambiantes</h3>
<p>La inestabilidad de los mercados globales nos recuerda la sabiduría milenaria de las Escrituras. El ejemplo de José en Egipto y los principios sabáticos nos enseñan la prudencia del ahorro, el trabajo productivo y la confianza en la provisión del Eterno.</p>`,
                    image_url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80',
                    source_url: 'https://hablemosdeyhwh.com',
                    tags: 'Economía, Mayordomía, Mundo, Sabiduría',
                    is_breaking: false,
                    is_published: true,
                    published_at: new Date(Date.now() - 172800000)
                },
                {
                    title: 'Crecimiento de Comunidades que Retoman las Raíces Hebreas en Latinoamérica',
                    subtitle: 'Un despertar espiritual en diversas naciones de habla hispana',
                    category: 'Comunidad',
                    author: 'Hablemos de YHWH',
                    summary: 'Miles de familias en el continente redescubren el Shabat, las Fiestas del Eterno y el estudio contextual de las Escrituras.',
                    content: `<h3>Un retorno a las sendas antiguas</h3>
<p>En toda América Latina y el mundo de habla hispana, se observa un notable despertar: creyentes de diversas trayectorias buscan volver a las raíces hebreas de la fe, redescubriendo el valor de la Torah, los mandamientos y la identidad en el Mesías.</p>`,
                    image_url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80',
                    source_url: 'https://hablemosdeyhwh.com',
                    tags: 'Raíces Hebreas, Despertar, Comunidad, Fe',
                    is_breaking: false,
                    is_published: true,
                    published_at: new Date(Date.now() - 259200000)
                }
            ];

            for (const news of sampleNews) {
                await Noticia.create(news);
            }
            console.log('✅ Noticias de ejemplo insertadas.');
        }

        // Verificar si hay shorts de noticias
        const [shortsCount] = await db.query('SELECT COUNT(*) as total FROM noticias_shorts');
        if (shortsCount[0].total === 0) {
            console.log('🎥 Insertando shorts de noticias de ejemplo...');
            const sampleShorts = [
                {
                    title: '¿Qué está pasando en Jerusalén hoy? Resumen en 60 segundos',
                    category: 'Actualidad',
                    youtube_short_url: 'https://www.youtube.com/shorts/dQw4w9WgXcQ',
                    youtube_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                    thumbnail_url: 'https://images.unsplash.com/photo-1544928147-79a2dbc1f389?auto=format&fit=crop&w=600&q=80',
                    description: 'Cápsula informativa rápida sobre los eventos más recientes en Tierra Santa.',
                    source_name: 'Hablemos de YHWH',
                    is_highlight: true,
                    is_published: true
                },
                {
                    title: 'Increíble hallazgo bíblico en el Mar Muerto 📜',
                    category: 'Arqueología',
                    youtube_short_url: 'https://www.youtube.com/shorts/dQw4w9WgXcQ',
                    youtube_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                    thumbnail_url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=600&q=80',
                    description: 'Nuevos fragmentos de pergamino confirman textos milenarios.',
                    source_name: 'Arqueología Bíblica',
                    is_highlight: false,
                    is_published: true
                },
                {
                    title: 'El Reloj Profético y las Naciones: ¿Hacia dónde vamos?',
                    category: 'Profecía',
                    youtube_short_url: 'https://www.youtube.com/shorts/dQw4w9WgXcQ',
                    youtube_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                    thumbnail_url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80',
                    description: 'Reflexión en video vertical sobre las señales de los tiempos.',
                    source_name: 'Redacción YHWH',
                    is_highlight: true,
                    is_published: true
                },
                {
                    title: 'Señales astronómicas y los Moedim del Eterno 🌕☀️',
                    category: 'Calendario',
                    youtube_short_url: 'https://www.youtube.com/shorts/dQw4w9WgXcQ',
                    youtube_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                    thumbnail_url: 'https://images.unsplash.com/photo-1532693322450-2cb5c511067d?auto=format&fit=crop&w=600&q=80',
                    description: 'Cómo el sol y la luna marcan las fiestas ordenadas.',
                    source_name: 'Hablemos de YHWH',
                    is_highlight: false,
                    is_published: true
                }
            ];

            for (const short of sampleShorts) {
                await Noticia.createShort(short);
            }
            console.log('✅ Shorts de noticias de ejemplo insertados.');
        }

        console.log('🎉 Migración completada exitosamente.');
    } catch (error) {
        console.error('❌ Error en migración:', error);
    } finally {
        process.exit(0);
    }
}

migrate();
