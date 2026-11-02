import * as astronomia from 'astronomia';
import fs from 'fs';

const { julian, solstice, moonphase } = astronomia;

console.log("Calculando desde el año 2026 hacia atrás hasta el año 1...");
console.time("Tiempo de cálculo");

function makeDate(year, monthIndex, day, hours = 0, minutes = 0, seconds = 0) {
  const d = new Date(Date.UTC(2000, monthIndex, day, hours, minutes, seconds));
  d.setUTCFullYear(year);
  return d;
}

function formatDateISO(d) {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  const h = String(d.getUTCHours()).padStart(2, '0');
  const min = String(d.getUTCMinutes()).padStart(2, '0');
  const s = String(d.getUTCSeconds()).padStart(2, '0');
  const yStr = y < 0 ? '-' + String(Math.abs(y)).padStart(4, '0') : String(y).padStart(4, '0');
  return `${yStr}-${m}-${day}T${h}:${min}:${s}Z`;
}

function formatDayOnly(d) {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  const yStr = y < 0 ? '-' + String(Math.abs(y)).padStart(4, '0') : String(y).padStart(4, '0');
  return `${yStr}-${m}-${day}`;
}

// Cálculo del inicio del año para cualquier año y
function getYearStartInfo(y) {
  // 1. Equinoccio en Israel (+2h respecto a UTC)
  const eqJDE = solstice.march(y);
  const eqDate = julian.JDToDate(eqJDE);
  const eqIsrael = new Date(eqDate.getTime() + 2 * 3600 * 1000);

  // 2. Conjunción más cercana al equinoccio
  // Aproximación del número de lunación k (k=0 en 2000 Jan 6)
  const kApprox = Math.round((y + 0.22 - 2000) * 12.3685);

  const candidates = [kApprox - 1, kApprox, kApprox + 1].map(k => {
    const jde = moonphase.new(2000 + k / 12.3685);
    const d = julian.JDToDate(jde);
    return { k, jde, d, diffDays: (eqIsrael.getTime() - d.getTime()) / 86400000 };
  });

  candidates.sort((a, b) => Math.abs(a.diffDays) - Math.abs(b.diffDays));
  let chosen = candidates[0];

  let postponed = false;
  // Regla: si la luna nueva más cercana es más de 8 días antes del equinoccio, se pospone a la siguiente
  if (chosen.diffDays > 8) {
    const nextCand = candidates.find(c => c.k === chosen.k + 1) || candidates[1];
    chosen = nextCand;
    postponed = true;
  }

  // 3. Inicio bíblico del día al atardecer (18:00 UTC en las estructuras del proyecto)
  const nmDate = chosen.d;
  let rhDate;
  if (nmDate.getUTCHours() < 18) {
    // Si la conjunción ocurre de madrugada/día antes de las 18:00 UTC,
    // el atardecer que inició esa jornada fue el de la víspera a las 18:00 UTC
    rhDate = makeDate(nmDate.getUTCFullYear(), nmDate.getUTCMonth(), nmDate.getUTCDate() - 1, 18, 0, 0);
  } else {
    // Si la conjunción ocurre a las 18:00 o después, inicia en el atardecer de ese mismo día civil
    rhDate = makeDate(nmDate.getUTCFullYear(), nmDate.getUTCMonth(), nmDate.getUTCDate(), 18, 0, 0);
  }

  return {
    year: y,
    equinoxIsrael: eqIsrael,
    newMoon: chosen.d,
    k: chosen.k,
    diffDaysToEquinox: chosen.diffDays,
    postponed,
    roshHashana: rhDate
  };
}

const allYears = [];
for (let y = 1; y <= 2027; y++) {
  allYears[y] = getYearStartInfo(y);
}

// Determinar número de meses de cada año (12 o 13)
const calendarData = [];
let leapCount = 0;
let regularCount = 0;

for (let y = 2026; y >= 1; y--) {
  const current = allYears[y];
  const next = allYears[y + 1];

  const diffDays = (next.roshHashana.getTime() - current.roshHashana.getTime()) / 86400000;
  const hasLeapMonth = diffDays > 365;

  if (hasLeapMonth) leapCount++;
  else regularCount++;

  calendarData.push({
    year: y,
    roshHashana: formatDateISO(current.roshHashana),
    conjunction: formatDateISO(current.newMoon),
    equinox: formatDateISO(current.equinoxIsrael),
    daysInYear: Math.round(diffDays),
    monthsCount: hasLeapMonth ? 13 : 12,
    hasLeapMonth,
    postponed: current.postponed,
    kStart: current.k
  });
}

console.timeEnd("Tiempo de cálculo");
console.log(`Calculados ${calendarData.length} años (desde el 2026 hasta el año 1).`);
console.log(`Años regulares (12 meses): ${regularCount}`);
console.log(`Años embolismales (13 meses): ${leapCount}`);
console.log(`Frecuencia de años embolismales: ${(leapCount / calendarData.length * 100).toFixed(2)}%`);

console.log("\n========================================================");
console.log("HITOS Y FECHAS CLAVE (Cálculo Retroactivo hasta el Año 1):");
console.log("========================================================");

const milestones = [
  2026, 2000, 1582, 1000, 500, 70, 33, 30, 4, 1
];

milestones.forEach(y => {
  const item = calendarData.find(d => d.year === y);
  console.log(`Año ${String(item.year).padStart(4, ' ')}: Rosh Hashaná: ${item.roshHashana.slice(0, 10)} | Conjunción: ${item.conjunction.slice(0, 16)}Z | Equin. Israel: ${item.equinox.slice(0, 10)} | ${item.monthsCount} meses (${item.daysInYear} d) ${item.postponed ? '[Abib pospuesto >8d]' : ''}`);
});

// Guardar archivo JSON con el resumen completo de los 2026 años calculados
fs.writeFileSync(
  './calendario_retro_anos_1_a_2026.json',
  JSON.stringify(calendarData, null, 2),
  'utf8'
);
console.log("\nArchivo guardado: calendario_retro_anos_1_a_2026.json (con los 2026 años completos)");
