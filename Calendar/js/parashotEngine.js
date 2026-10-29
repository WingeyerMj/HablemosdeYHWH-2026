// js/parashotEngine.js
// Cálculo y Mapeo Canónico del Ciclo Anual de Parashot y Festividades (100% Offline)

import { lunisolar2025 } from "./data/year2025.js";
import { lunisolar2026 } from "./data/year2026.js";
import { lunisolar2027 } from "./data/year2027.js";
import { lunisolar2028 } from "./data/year2028.js";
import { lunisolar2029 } from "./data/year2029.js";
import { lunisolar2030 } from "./data/year2030.js";
import { lunisolar2031 } from "./data/year2031.js";
import { lunisolar2032 } from "./data/year2032.js";
import { lunisolar2033 } from "./data/year2033.js";
import { lunisolar2034 } from "./data/year2034.js";
import { lunisolar2035 } from "./data/year2035.js";
import { lunisolar2036 } from "./data/year2036.js";
import { lunisolar2037 } from "./data/year2037.js";
import { lunisolar2038 } from "./data/year2038.js";
import { lunisolar2039 } from "./data/year2039.js";
import { lunisolar2040 } from "./data/year2040.js";

export const ALL_YEARS_MAP = {
  2025: lunisolar2025, 2026: lunisolar2026, 2027: lunisolar2027, 2028: lunisolar2028,
  2029: lunisolar2029, 2030: lunisolar2030, 2031: lunisolar2031, 2032: lunisolar2032,
  2033: lunisolar2033, 2034: lunisolar2034, 2035: lunisolar2035, 2036: lunisolar2036,
  2037: lunisolar2037, 2038: lunisolar2038, 2039: lunisolar2039, 2040: lunisolar2040
};

export const HOLIDAYS_CANONICAL = {
  roshHashana: {
    key: "roshHashana",
    title: "Rosh Hashaná Bíblico (Inicio del Año — 1 de Abib)",
    badge: "Rosh Hashaná",
    hebrew: "רֹאשׁ הַשָּׁנָה (Abib)",
    torahRef: "Éxodo 12:1-2; Deuteronomio 16:1",
    prophetsRef: "Ezequiel 45:18; Salmos 81:1-5",
    summary: "El Eterno estableció el mes de Abib como el principio de los meses y el primer mes del año bíblico. Marca el inicio del ciclo de redención y de las Santas Convocaciones (Moedim) de YHWH."
  },
  roshJodesh: {
    key: "roshJodesh",
    title: "Rosh Jódesh (Principio de Mes Lunar)",
    badge: "Rosh Jódesh",
    hebrew: "רֹאשׁ חֹדֶשׁ",
    torahRef: "Números 10:10; Números 28:11-15",
    prophetsRef: "Salmos 81:3; Isaías 66:23; Ezequiel 46:1-3",
    summary: "Declaración de renovación del mes lunisolar al inicio de la conjunción lunar (0% de luminosidad). Tiempo de gratitud, toque de trompeta y consagración del nuevo mes ante YHWH."
  },
  pesaj: {
    key: "pesaj",
    title: "Pésaj (Pascua de YHWH — Día 14 de Abib)",
    badge: "Pésaj",
    hebrew: "פֶּסַח",
    torahRef: "Éxodo 12:1-14; Levítico 23:4-5; Números 28:16",
    prophetsRef: "Isaías 53:1-12; 1 Corintios 5:7-8",
    summary: "Memorial perpetuo de la liberación de Israel de la esclavitud en Egipto mediante la sangre del cordero, cumplido proféticamente en Yeshúa como el Cordero de Elohim que quita el pecado."
  },
  hamatzo: {
    key: "hamatzo",
    title: "Jag Hamatzot (Fiesta de los Panes sin Levadura)",
    badge: "Hamatzo",
    hebrew: "חַג הַמַּצּוֹת",
    torahRef: "Levítico 23:6-8; Éxodo 12:15-20; Deuteronomio 16:3-8",
    prophetsRef: "Josué 5:10-12; 1 Corintios 5:6-8",
    summary: "Siete días comiendo pan sin levadura (del 15 al 21 de Abib). El primer y el séptimo día son Santa Convocación. Representa el caminar en sinceridad, santidad y verdad, desechando la vieja levadura."
  },
  bikurim: {
    key: "bikurim",
    title: "Yom HaBikurim (Primicias de la Cosecha)",
    badge: "Bikurim",
    hebrew: "בִּכּוּרִים",
    torahRef: "Levítico 23:9-14",
    prophetsRef: "1 Corintios 15:20-23; Romanos 11:16",
    summary: "Al día siguiente del Shabat durante la semana de Panes sin Levadura, se mece la gavilla de las primicias ante YHWH. Desde este día comienza la cuenta de 7 semanas completas (49 días del Omer) hacia Shavuot."
  },
  shavuot: {
    key: "shavuot",
    title: "Shavuot (Fiesta de las Semanas / Pentecostés)",
    badge: "Shavuot",
    hebrew: "שָׁבוּעוֹת",
    torahRef: "Levítico 23:15-21; Éxodo 19:1-20:17; Deuteronomio 16:9-12",
    prophetsRef: "Ezequiel 1:1-28; Hechos 2:1-21",
    summary: "Celebrada al cumplirse el día 50 después de Bikurim. Conmemora la entrega de la Torá en el Monte Sinaí y el derramamiento del Rúaj HaKódesh (Espíritu de Santidad) escribiendo la Torá en los corazones."
  },
  yomTeruah: {
    key: "yomTeruah",
    title: "Yom Teruáh (Día de Aclamación y Toque de Shofar)",
    badge: "Yom Teruáh",
    hebrew: "יוֹם תְּרוּעָה",
    torahRef: "Levítico 23:23-25; Números 29:1-6",
    prophetsRef: "Salmos 47:1-9; 1 Tesalonicenses 4:16-17",
    summary: "Santa Convocación en el primer día del séptimo mes lunar. Día de reposo, memoria al son de trompetas (Shofar), despertar espiritual, arrepentimiento (Teshuvá) y anuncio profético del regreso del Rey."
  },
  yomKippur: {
    key: "yomKippur",
    title: "Yom Kipur (Día de la Expiación)",
    badge: "Yom Kipur",
    hebrew: "יוֹם כִּפּוּר",
    torahRef: "Levítico 23:26-32; Levítico 16:1-34; Números 29:7-11",
    prophetsRef: "Isaías 58:1-14; Hebreos 9:11-28",
    summary: "El día décimo del séptimo mes es el Shabat Shabatón (reposo solemne) y día de aflicción del alma (ayuno), purificación y reconciliación delante de YHWH mediante la intercesión del Sumo Sacerdote."
  },
  sukkot: {
    key: "sukkot",
    title: "Sukkot (Fiesta de los Tabernáculos / Cabañas)",
    badge: "Sukkot",
    hebrew: "סֻכּוֹת",
    torahRef: "Levítico 23:33-43; Números 29:12-34; Deuteronomio 16:13-15",
    prophetsRef: "Zacarías 14:16-19; Juan 7:37-39",
    summary: "Siete días de regocijo delante de YHWH (del 15 al 21 del Mes 7), recordando que el Eterno hizo habitar a Su pueblo en cabañas en el desierto y anticipando el Reino Mesiánico donde Él habitará con Su pueblo."
  },
  sheminiAtzeret: {
    key: "sheminiAtzeret",
    title: "Sheminí Atzéret y Simjat Torá (Octavo Día de Asamblea Solemne)",
    badge: "Sheminí Atzéret",
    hebrew: "שְׁמִינִי עֲצֶרֶת",
    torahRef: "Levítico 23:36, 39; Números 29:35-38; Deuteronomio 33:1-34:12",
    prophetsRef: "1 Reyes 8:54-66; Apocalipsis 21:1-7",
    summary: "Al octavo día desde el inicio de Sukkot (día 22 del Mes 7) se celebra Santa Convocación y reposo solemne. Concluye el ciclo anual de lectura de la Torá con Vezot Haberajáh (#54) y se regocija el pueblo en la Palabra."
  }
};

export const PARASHOT_CANONICAL = [
  { num: 1, title: "Bereshit", ref: "Génesis 1:1 - 6:8", haftara: "Isaías 42:5 - 43:10", brit: "Juan 1:1-18; Colosenses 1:15-20", book: "Génesis", summary: "La creación de los cielos y la tierra, el jardín del Edén, el primer Shabat y las primeras generaciones de la humanidad." },
  { num: 2, title: "Noaj", ref: "Génesis 6:9 - 11:32", haftara: "Isaías 54:1 - 55:5", brit: "Mateo 24:36-44; 1 Pedro 3:18-22", book: "Génesis", summary: "La justicia de Noaj, el arca y el diluvio universal, el pacto del arco iris y la dispersión en la torre de Babel." },
  { num: 3, title: "Lej Lejá", ref: "Génesis 12:1 - 17:27", haftara: "Isaías 40:27 - 41:16", brit: "Romanos 4:1-25; Hebreos 11:8-12", book: "Génesis", summary: "El llamado de Avram a salir hacia la tierra prometida, la promesa de descendencia y el pacto de la circuncisión." },
  { num: 4, title: "Vayerá", ref: "Génesis 18:1 - 22:24", haftara: "2 Reyes 4:1-37", brit: "Santiago 2:21-24; Hebreos 11:17-19", book: "Génesis", summary: "La visita a Abraham en Mamré, el nacimiento de Yitzjak y la prueba de fe en el Monte Moriáh (Akedát Yitzjak)." },
  { num: 5, title: "Jayei Sarah", ref: "Génesis 23:1 - 25:18", haftara: "1 Reyes 1:1-31", brit: "1 Corintios 15:50-57", book: "Génesis", summary: "La compra de la cueva de Majpelá en Hebrón y la búsqueda de Rivká como esposa para Yitzjak." },
  { num: 6, title: "Toldot", ref: "Génesis 25:19 - 28:9", haftara: "Malaquías 1:1 - 2:7", brit: "Romanos 9:6-16; Hebreos 12:14-17", book: "Génesis", summary: "El nacimiento de Yaakov y Esav, la primogenitura y la bendición patriarcal transmitida a Yaakov." },
  { num: 7, title: "Vayetze", ref: "Génesis 28:10 - 32:3", haftara: "Oseas 12:12 - 14:9", brit: "Juan 1:43-51", book: "Génesis", summary: "El sueño de la escalera de Yaakov en Bet-El, sus años en Jarán y el nacimiento de las tribus de Israel." },
  { num: 8, title: "Vayishlaj", ref: "Génesis 32:4 - 36:43", haftara: "Abdías 1:1-21", brit: "1 Corintios 5:1-13", book: "Génesis", summary: "El encuentro de Yaakov con el mensajero en Peniel, su nuevo nombre 'Israel' y el reencuentro con Esav." },
  { num: 9, title: "Vayeshev", ref: "Génesis 37:1 - 40:23", haftara: "Amós 2:6 - 3:8", brit: "Hechos 7:9-10", book: "Génesis", summary: "Los sueños de Yosef, su venta a Egipto, su fidelidad en casa de Potifar y la interpretación de los sueños en prisión." },
  { num: 10, title: "Miketz", ref: "Génesis 41:1 - 44:17", haftara: "1 Reyes 3:15 - 4:1", brit: "Hechos 7:11-12", book: "Génesis", summary: "Yosef interpreta los sueños de Faraón, es exaltado como gobernador de Egipto y recibe a sus hermanos durante la hambruna." },
  { num: 11, title: "Vayigash", ref: "Génesis 44:18 - 47:27", haftara: "Ezequiel 37:15-28", brit: "Hechos 7:13-15", book: "Génesis", summary: "La intercesión de Yehudá por Binyamín, Yosef se revela a sus hermanos y toda la familia de Yaakov desciende a Goshen." },
  { num: 12, title: "Vayeji", ref: "Génesis 47:28 - 50:26", haftara: "1 Reyes 2:1-12", brit: "Hebreos 11:21-22; 1 Pedro 1:3-9", book: "Génesis", summary: "Las bendiciones proféticas de Yaakov sobre Efraím, Menashé y sus doce hijos antes de partir." },
  { num: 13, title: "Shemot", ref: "Éxodo 1:1 - 6:1", haftara: "Isaías 27:6 - 28:13; 29:22-23", brit: "Hechos 7:17-36", book: "Éxodo", summary: "La aflicción de Israel en Egipto, el nacimiento de Moshé y la revelación del Nombre YHWH en la zarza ardiente." },
  { num: 14, title: "Vaerá", ref: "Éxodo 6:2 - 9:35", haftara: "Ezequiel 28:25 - 29:21", brit: "Romanos 9:14-24", book: "Éxodo", summary: "Las cuatro promesas de redención y los primeros siete juicios del Eterno sobre los dioses de Egipto." },
  { num: 15, title: "Bo", ref: "Éxodo 10:1 - 13:16", haftara: "Jeremías 46:13-28", brit: "Juan 19:31-37; 1 Corintios 11:23-26", book: "Éxodo", summary: "Los últimos tres juicios, el establecimiento del mes de Abib, el sacrificio de Pésaj y la salida triunfante de Egipto." },
  { num: 16, title: "Beshalaj", ref: "Éxodo 13:17 - 17:16", haftara: "Jueces 4:4 - 5:31", brit: "Juan 6:25-59; 1 Corintios 10:1-13", book: "Éxodo", summary: "La apertura del Mar de los Juncos, el cántico de redención, la provisión del Maná, el agua de la roca y el Shabat." },
  { num: 17, title: "Yitró", ref: "Éxodo 18:1 - 20:23", haftara: "Isaías 6:1 - 7:6; 9:5-6", brit: "Mateo 5:17-32; Hebreos 12:18-29", book: "Éxodo", summary: "El consejo de Yitró, el pacto en el Monte Sinaí y la proclamación de las Diez Palabras (Mandamientos)." },
  { num: 18, title: "Mishpatim", ref: "Éxodo 21:1 - 24:18", haftara: "Jeremías 34:8-22; 33:25-26", brit: "Mateo 26:26-30; Hebreos 9:15-22", book: "Éxodo", summary: "Leyes de justicia civil, compasión, restitución, las fiestas anuales y la ratificación del Pacto en el Sinaí." },
  { num: 19, title: "Terumah", ref: "Éxodo 25:1 - 27:19", haftara: "1 Reyes 5:26 - 6:13", brit: "Hebreos 8:1-6; 9:1-5", book: "Éxodo", summary: "La ofrenda voluntaria de corazón para construir el Mishkán (Tabernáculo), el Arca, la Mesa y la Menoráh." },
  { num: 20, title: "Tetzaveh", ref: "Éxodo 27:20 - 30:10", haftara: "Ezequiel 43:10-27", brit: "Filipenses 4:10-20; Hebreos 13:10-16", book: "Éxodo", summary: "El aceite puro de olivas para la Menoráh, las vestiduras sagradas del sacerdocio y el altar del incienso." },
  { num: 21, title: "Ki Tisá", ref: "Éxodo 30:11 - 34:35", haftara: "1 Reyes 18:1-39", brit: "2 Corintios 3:1-18", book: "Éxodo", summary: "El medio siclo, el Shabat como señal perpetua, la intercesión de Moshé y la revelación de los trece atributos de misericordia de YHWH." },
  { num: 22, title: "Vayakhel", ref: "Éxodo 35:1 - 38:20", haftara: "1 Reyes 7:40-50", brit: "2 Corintios 9:1-15", book: "Éxodo", summary: "Moshé congrega a Israel para guardar el Shabat y edificar el Mishkán con generosidad y sabiduría del Espíritu." },
  { num: 23, title: "Pekudei", ref: "Éxodo 38:21 - 40:38", haftara: "1 Reyes 7:51 - 8:21", brit: "Apocalipsis 21:1-8", book: "Éxodo", summary: "La contabilidad fiel del Mishkán, su erección en el primer día del mes de Abib y la gloria (Kavod) de YHWH llenando el Santuario." },
  { num: 24, title: "Vayikrá", ref: "Levítico 1:1 - 5:26", haftara: "Isaías 43:21 - 44:23", brit: "Romanos 12:1-2; Hebreos 10:1-18", book: "Levítico", summary: "El llamado de YHWH desde el Tabernáculo y las leyes de los Korbanot (ofrendas de acercamiento y comunión)." },
  { num: 25, title: "Tzav", ref: "Levítico 6:1 - 8:36", haftara: "Jeremías 7:21 - 8:3; 9:22-23", brit: "Marcos 12:28-34", book: "Levítico", summary: "El fuego continuo sobre el altar que nunca debe apagarse y la consagración de Aharón y sus hijos." },
  { num: 26, title: "Sheminí", ref: "Levítico 9:1 - 11:47", haftara: "2 Samuel 6:1 - 7:17", brit: "Hechos 10:1-35; 1 Pedro 1:14-16", book: "Levítico", summary: "La inauguración del servicio en el octavo día, la santidad ante YHWH y las leyes de alimentación pura (Kashrut Bíblico)." },
  { num: 27, title: "Tazria", ref: "Levítico 12:1 - 13:59", haftara: "2 Reyes 4:42 - 5:19", brit: "Lucas 2:21-24; Mateo 8:1-4", book: "Levítico", summary: "Leyes de pureza tras el nacimiento y el discernimiento espiritual de las afecciones de Tzaráat." },
  { num: 28, title: "Metzorá", ref: "Levítico 14:1 - 15:33", haftara: "2 Reyes 7:3-20", brit: "Marcos 1:40-45; Hebreos 9:13-14", book: "Levítico", summary: "El proceso de purificación y restauración del Metzorá (con madera de cedro, hisopo y grana) y la pureza del campamento." },
  { num: 29, title: "Ajarei Mot", ref: "Levítico 16:1 - 18:30", haftara: "Ezequiel 22:1-19", brit: "Hebreos 9:6-14; 1 Corintios 6:9-20", book: "Levítico", summary: "El servicio sagrado de Yom Kipur en el Lugar Santísimo, el respeto por la vida en la sangre y la pureza familiar." },
  { num: 30, title: "Kedoshim", ref: "Levítico 19:1 - 20:27", haftara: "Amós 9:7-15", brit: "Mateo 19:16-22; Santiago 2:1-9", book: "Levítico", summary: "'Santos seréis porque santo soy Yo YHWH vuestro Elohim': mandamientos de ética, justicia social y 'amarás a tu prójimo como a ti mismo'." },
  { num: 31, title: "Emor", ref: "Levítico 21:1 - 24:23", haftara: "Ezequiel 44:15-31", brit: "1 Pedro 2:4-10", book: "Levítico", summary: "La santidad de los sacerdotes y el calendario completo de las Santas Convocaciones (Moedim) de YHWH en Levítico 23." },
  { num: 32, title: "Behar", ref: "Levítico 25:1 - 26:2", haftara: "Jeremías 32:6-27", brit: "Lucas 4:16-21", book: "Levítico", summary: "El año sabático de la tierra (Shemitá), el año de Jubileo (Yovel), la redención de la heredad y la ayuda al hermano empobrecido." },
  { num: 33, title: "Bejukotai", ref: "Levítico 26:3 - 27:34", haftara: "Jeremías 16:19 - 17:14", brit: "2 Corintios 6:14-18", book: "Levítico", summary: "Las bendiciones de caminar en los estatutos y mandamientos de YHWH, la promesa de restauración y los votos de consagración." },
  { num: 34, title: "Bemidbar", ref: "Números 1:1 - 4:20", haftara: "Oseas 2:1-22", brit: "1 Corintios 12:12-31", book: "Números", summary: "El censo de las tribus de Israel en el desierto del Sinaí y el orden del campamento alrededor del Mishkán." },
  { num: 35, title: "Nasó", ref: "Números 4:21 - 7:89", haftara: "Jueces 13:2-25", brit: "Hechos 21:17-26", book: "Números", summary: "El voto del Nazareo, la Bendición Sacerdotal (Birkat Kohanim: 'YHWH te bendiga y te guarde...') y las ofrendas de los príncipes." },
  { num: 36, title: "Behaalotjá", ref: "Números 8:1 - 12:16", haftara: "Zacarías 2:14 - 4:7", brit: "1 Corintios 10:6-11; Apocalipsis 1:12-20", book: "Números", summary: "El encendido de la Menoráh, el Segundo Pésaj, las dos trompetas de plata y la humildad de Moshé." },
  { num: 37, title: "Shelaj Lejá", ref: "Números 13:1 - 15:41", haftara: "Josué 2:1-24", brit: "Hebreos 3:7 - 4:11", book: "Números", summary: "El envío de los doce exploradores, la fe firme de Kalev y Yehoshúa, y el mandamiento de los Tzitzit con cordón azul (Tejélet)." },
  { num: 38, title: "Kóraj", ref: "Números 16:1 - 18:32", haftara: "1 Samuel 11:14 - 12:22", brit: "2 Timoteo 2:14-26; Judas 1:11", book: "Números", summary: "La rebelión de Kóraj, la confirmación del sacerdocio mediante la vara de Aharón que reverdeció y el sostén de los levitas." },
  { num: 39, title: "Jukat", ref: "Números 19:1 - 22:1", haftara: "Jueces 11:1-33", brit: "Juan 3:14-15; Hebreos 9:13-14", book: "Números", summary: "El estatuto de la vaca alazana para purificación, las aguas de Merivá y la serpiente de bronce levantada en el desierto." },
  { num: 40, title: "Balak", ref: "Números 22:2 - 25:9", haftara: "Miqueas 5:6 - 6:8", brit: "2 Pedro 2:15-16; Apocalipsis 2:14", book: "Números", summary: "El rey Balak contrata a Bilam para maldecir a Israel, pero YHWH transforma la maldición en profecías mesiánicas de bendición." },
  { num: 41, title: "Pinjás", ref: "Números 25:10 - 30:1", haftara: "1 Reyes 18:46 - 19:21", brit: "Juan 2:13-22", book: "Números", summary: "El pacto de paz con Pinjás por su celo por YHWH, la heredad de las hijas de Tzelofjad, el liderazgo de Yehoshúa y las ofrendas de las fiestas." },
  { num: 42, title: "Matot", ref: "Números 30:2 - 32:42", haftara: "Jeremías 1:1 - 2:3", brit: "Mateo 5:33-37", book: "Números", summary: "La integridad de la palabra y los votos ante YHWH, y el compromiso de las tribus de Rubén, Gad y media tribu de Menashé." },
  { num: 43, title: "Masei", ref: "Números 33:1 - 36:13", haftara: "Jeremías 2:4-28; 3:4", brit: "Santiago 4:1-12", book: "Números", summary: "El registro de las 42 jornadas en el desierto, las fronteras de la Tierra Prometida y las ciudades de refugio." },
  { num: 44, title: "Devarim", ref: "Deuteronomio 1:1 - 3:22", haftara: "Isaías 1:1-27", brit: "Juan 15:1-11; Hechos 7:37-40", book: "Deuteronomio", summary: "Discurso inicial de Moshé repasando el camino por el desierto, el nombramiento de jueces justos y el llamado a no temer." },
  { num: 45, title: "Vaetjanán", ref: "Deuteronomio 3:23 - 7:11", haftara: "Isaías 40:1-26", brit: "Marcos 12:28-34; Mateo 4:1-11", book: "Deuteronomio", summary: "La súplica de Moshé, la repetición de las Diez Palabras y la proclamación del Shemá Israel ('Oye Israel, YHWH nuestro Elohim, YHWH uno es')." },
  { num: 46, title: "Ekev", ref: "Deuteronomio 7:12 - 11:25", haftara: "Isaías 49:14 - 51:3", brit: "Mateo 4:1-11; Santiago 5:7-11", book: "Deuteronomio", summary: "'No sólo de pan vivirá el hombre, sino de todo lo que sale de la boca de YHWH'; las segundas tablas y el amor a YHWH de todo corazón." },
  { num: 47, title: "Reeh", ref: "Deuteronomio 11:26 - 16:17", haftara: "Isaías 54:11 - 55:5", brit: "1 Juan 4:1-6", book: "Deuteronomio", summary: "'Mira, yo pongo hoy delante de vosotros la bendición y la maldición', el discernimiento ante falsos profetas y las tres fiestas de peregrinación." },
  { num: 48, title: "Shofetim", ref: "Deuteronomio 16:18 - 21:9", haftara: "Isaías 51:12 - 52:12", brit: "Juan 1:19-27; Hechos 3:19-26", book: "Deuteronomio", summary: "'Justicia, sólo justicia perseguirás', leyes para jueces y reyes que escriben la Torá, y la promesa del Profeta como Moshé." },
  { num: 49, title: "Ki Tetzé", ref: "Deuteronomio 21:10 - 25:19", haftara: "Isaías 54:1-10", brit: "1 Corintios 9:4-14; Gálatas 3:10-14", book: "Deuteronomio", summary: "Setenta y cuatro mandamientos de compasión, ética laboral, cuidado del prójimo, pesas justas y santidad cotidiana." },
  { num: 50, title: "Ki Tavó", ref: "Deuteronomio 26:1 - 29:8", haftara: "Isaías 60:1-22", brit: "Lucas 21:1-4; Romanos 11:1-15", book: "Deuteronomio", summary: "La presentación agradecida de las primicias (Bikurim), la renovación del pacto entre los montes Gerizim y Ebal y las bendiciones de la obediencia." },
  { num: 51, title: "Nitzavim", ref: "Deuteronomio 29:9 - 30:20", haftara: "Isaías 61:10 - 63:9", brit: "Romanos 10:1-13", book: "Deuteronomio", summary: "Todos de pie en pacto ante YHWH, la promesa profética de retorno (Teshuvá), la circuncisión del corazón y 'Escoge, pues, la vida'." },
  { num: 52, title: "Vayélej", ref: "Deuteronomio 31:1 - 31:30", haftara: "Oseas 14:2-10; Miqueas 7:18-20", brit: "Hebreos 13:5-8", book: "Deuteronomio", summary: "Moshé anima a Israel y a Yehoshúa ('Esfuérzate y sé valiente'), entrega la Torá escrita y ordena la lectura pública de Hakhel cada siete años en Sukkot." },
  { num: 53, title: "Haazinu", ref: "Deuteronomio 32:1 - 32:52", haftara: "2 Samuel 22:1-51", brit: "Romanos 10:14-21; Apocalipsis 15:1-4", book: "Deuteronomio", summary: "El Cántico profético de Moshé llamando a los cielos y a la tierra como testigos de la fidelidad y justicia perfecta de la Roca, YHWH." },
  { num: 54, title: "Vezot Haberajáh", ref: "Deuteronomio 33:1 - 34:12", haftara: "Josué 1:1-18", brit: "Apocalipsis 22:1-21", book: "Deuteronomio", summary: "La bendición final de Moshé sobre cada una de las tribus de Israel y la conclusión gloriosa de los cinco libros de la Torá." }
];

export const PAIRS_COMBINABLE = [
  { num1: 51, num2: 52, title: "Nitzavim - Vayélej", ref: "Deuteronomio 29:9 - 31:30" },
  { num1: 42, num2: 43, title: "Matot - Masei", ref: "Números 30:2 - 36:13" },
  { num1: 22, num2: 23, title: "Vayakhel - Pekudei", ref: "Éxodo 35:1 - 40:38" },
  { num1: 27, num2: 28, title: "Tazria - Metzorá", ref: "Levítico 12:1 - 15:33" },
  { num1: 29, num2: 30, title: "Ajarei Mot - Kedoshim", ref: "Levítico 16:1 - 20:27" },
  { num1: 32, num2: 33, title: "Behar - Bejukotai", ref: "Levítico 25:1 - 27:34" },
  { num1: 39, num2: 40, title: "Jukat - Balak", ref: "Números 19:1 - 25:9" }
];

function toDateKey(d) {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

let cachedSchedule = null;

export function buildCompleteParashotSchedule() {
  if (cachedSchedule) return cachedSchedule;

  const schedule = new Map();

  // 1. Recopilar todos los días en UTC puro de 2025 a 2040
  const allDays = [];
  for (let y = 2025; y <= 2040; y++) {
    const yData = ALL_YEARS_MAP[y];
    if (!yData) continue;
    yData.months.forEach(m => {
      const rj = new Date(m.roshJodes);
      const nxt = new Date(m.next);
      let cur = new Date(Date.UTC(rj.getUTCFullYear(), rj.getUTCMonth(), rj.getUTCDate()));
      const end = new Date(Date.UTC(nxt.getUTCFullYear(), nxt.getUTCMonth(), nxt.getUTCDate()));
      let dayIdx = 0;
      while (cur < end) {
        allDays.push({
          date: new Date(cur),
          dateKey: toDateKey(cur),
          year: yData.year,
          monthIndex: m.index,
          monthName: m.name,
          dayIndex: dayIdx,
          isSaturday: cur.getUTCDay() === 6
        });
        cur.setUTCDate(cur.getUTCDate() + 1);
        dayIdx++;
      }
    });
  }

  // 2. Identificar Shemini Atzeret de cada año (Mes 7, índice 6, día 22)
  const sheminis = allDays.filter(d => d.monthIndex === 6 && d.dayIndex === 22);
  const p54 = PARASHOT_CANONICAL[53];

  // Marcar Vezot Haberajáh en Shemini Atzeret / Simjat Torá (Conclusión de la Torá)
  sheminis.forEach(s => {
    schedule.set(s.dateKey, {
      title: "Vezot Haberajáh",
      numbers: [54],
      numberDisplay: "54",
      ref: p54.ref,
      haftara: p54.haftara,
      brit: p54.brit,
      book: p54.book,
      summary: p54.summary,
      isDouble: false,
      isSpecial: true,
      isFestival: true,
      note: "Simjat Torá • Conclusión de la Torá"
    });
  });

  // 3. Procesar cada ciclo anual de lectura entre dos fiestas consecutivas de Sucot / Simjat Torá
  for (let c = 0; c < sheminis.length - 1; c++) {
    const sStart = sheminis[c];
    const sEnd = sheminis[c + 1];

    const cycleDays = allDays.filter(d => d.date > sStart.date && d.date <= sEnd.date);
    const shabbats = cycleDays.filter(d => d.isSaturday);

    // ¿El ciclo cuenta con mes 13 (año embolismal / bisiesto lunar)?
    const isLeapCycle = cycleDays.some(d => d.monthIndex === 12);

    const regularShabbats = [];
    shabbats.forEach(sh => {
      // Shabat durante Pésaj (Mes 1 / Abib, días 14 a 21)
      if (sh.monthIndex === 0 && sh.dayIndex >= 14 && sh.dayIndex <= 21) {
        schedule.set(sh.dateKey, {
          title: "Shabat Pésaj",
          subtitle: "Lectura Especial de Pésaj",
          numbers: [],
          numberDisplay: "Festividad",
          ref: "Éxodo 33:12 - 34:26; Números 28:19-25",
          haftara: "Ezequiel 37:1-14 (El valle de los huesos secos)",
          brit: "1 Corintios 15:1-23",
          book: "Éxodo / Números",
          summary: "Lectura especial de Shabat durante la fiesta de Pésaj y Panes sin Levadura (Jol HaMoed Pésaj), celebrando la redención, la presencia del Eterno con Su pueblo y la resurrección.",
          isDouble: false,
          isSpecial: true,
          isFestival: true,
          note: "Shabat Jol Hamoed Pésaj"
        });
      }
      // Shabat durante Sucot (Mes 7, días 14 a 21)
      else if (sh.monthIndex === 6 && sh.dayIndex >= 14 && sh.dayIndex <= 21) {
        if (!sEnd.isSaturday) {
          schedule.set(sh.dateKey, {
            title: "Vezot Haberajáh",
            numbers: [54],
            numberDisplay: "54",
            ref: p54.ref,
            haftara: p54.haftara,
            brit: p54.brit,
            book: p54.book,
            summary: p54.summary,
            isDouble: false,
            isSpecial: true,
            isFestival: false,
            note: "Parashá de la semana de Sucot • Conclusión de la Torá"
          });
        }
      }
      // Si coincide exactamente con el día de Shemini Atzeret
      else if (sh.dateKey === sEnd.dateKey) {
        // Ya marcado como Vezot Haberajáh
      }
      else {
        regularShabbats.push(sh);
      }
    });

    const portions = [];
    if (isLeapCycle) {
      for (let p = 1; p <= 53; p++) {
        const item = PARASHOT_CANONICAL[p - 1];
        portions.push({
          title: item.title,
          numbers: [item.num],
          numberDisplay: String(item.num),
          ref: item.ref,
          haftara: item.haftara,
          brit: item.brit,
          book: item.book,
          summary: item.summary,
          isDouble: false,
          isSpecial: false,
          isFestival: false,
          note: "Lectura Individual (Año de 13 meses)"
        });
      }

      if (regularShabbats.length < portions.length) {
        const diff = portions.length - regularShabbats.length;
        if (diff === 1) {
          const idx51 = portions.findIndex(p => p.numbers[0] === 51);
          if (idx51 !== -1) {
            const p51 = PARASHOT_CANONICAL[50];
            const p52 = PARASHOT_CANONICAL[51];
            portions.splice(idx51, 2, {
              title: "Nitzavim - Vayélej",
              numbers: [51, 52],
              numberDisplay: "51-52",
              ref: "Deuteronomio 29:9 - 31:30",
              haftara: p52.haftara,
              brit: `${p51.brit}; ${p52.brit}`,
              book: "Deuteronomio",
              summary: `${p51.summary} • ${p52.summary}`,
              isDouble: true,
              isSpecial: false,
              isFestival: false,
              note: "Lectura Conjunta"
            });
          }
        }
      }
    } else {
      const neededReductions = Math.max(0, 53 - regularShabbats.length);
      const activePairs = PAIRS_COMBINABLE.slice(0, neededReductions);

      let pIdx = 1;
      while (pIdx <= 53) {
        const pair = activePairs.find(pr => pr.num1 === pIdx);
        if (pair) {
          const item1 = PARASHOT_CANONICAL[pair.num1 - 1];
          const item2 = PARASHOT_CANONICAL[pair.num2 - 1];
          portions.push({
            title: pair.title,
            numbers: [pair.num1, pair.num2],
            numberDisplay: `${pair.num1}-${pair.num2}`,
            ref: pair.ref,
            haftara: item2.haftara,
            brit: `${item1.brit}; ${item2.brit}`,
            book: item1.book,
            summary: `${item1.title}: ${item1.summary} | ${item2.title}: ${item2.summary}`,
            isDouble: true,
            isSpecial: false,
            isFestival: false,
            note: "Lectura Doble en Shabat (Año regular de 12 meses)"
          });
          pIdx += 2;
        } else {
          const item = PARASHOT_CANONICAL[pIdx - 1];
          portions.push({
            title: item.title,
            numbers: [item.num],
            numberDisplay: String(item.num),
            ref: item.ref,
            haftara: item.haftara,
            brit: item.brit,
            book: item.book,
            summary: item.summary,
            isDouble: false,
            isSpecial: false,
            isFestival: false,
            note: ""
          });
          pIdx += 1;
        }
      }
    }

    const p53 = PARASHOT_CANONICAL[52];
    for (let s = 0; s < regularShabbats.length; s++) {
      const sh = regularShabbats[s];
      if (s < portions.length) {
        schedule.set(sh.dateKey, portions[s]);
      } else {
        schedule.set(sh.dateKey, {
          title: "Haazinu",
          numbers: [53],
          numberDisplay: "53",
          ref: p53.ref,
          haftara: p53.haftara,
          brit: p53.brit,
          book: p53.book,
          summary: p53.summary,
          isDouble: false,
          isSpecial: false,
          isFestival: false,
          note: "Cántico de Moisés"
        });
      }
    }
  }

  cachedSchedule = schedule;
  return schedule;
}

/**
 * Obtener la Parashá para una fecha dada (Date object o string YYYY-MM-DD)
 */
export function getParashaForDate(date) {
  const sched = buildCompleteParashotSchedule();
  let dateKey = "";
  if (typeof date === "string") {
    dateKey = date.split("T")[0];
  } else if (date instanceof Date) {
    dateKey = toDateKey(date);
  }
  return sched.get(dateKey) || null;
}
