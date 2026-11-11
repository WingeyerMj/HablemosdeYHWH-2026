// js/calendarEngine.js

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
import { getMoonPhaseInfo } from "./moonPhase.js";

const yearsMap = {
  2025: lunisolar2025,
  2026: lunisolar2026,
  2027: lunisolar2027,
  2028: lunisolar2028,
  2029: lunisolar2029,
  2030: lunisolar2030,
  2031: lunisolar2031,
  2032: lunisolar2032,
  2033: lunisolar2033,
  2034: lunisolar2034,
  2035: lunisolar2035,
  2036: lunisolar2036,
  2037: lunisolar2037,
  2038: lunisolar2038,
  2039: lunisolar2039,
  2040: lunisolar2040
};

export function createLunisolarEngine(yearsMap) {
  const D2R = Math.PI / 180;
  const ck = 1 / 1236.85;
  const { sin, cos, floor, round, abs } = Math;

  function horner(x, ...coeffs) {
  let res = 0;
  for (let i = coeffs.length - 1; i >= 0; i--) {
    res = res * x + coeffs[i];
  }
  return res;
}

function getSpringEquinoxJDE(year) {
  if (year >= 1000) {
    const Y = (year - 2000) / 1000;
    return 2451623.80984 + 365242.37404 * Y + 0.05169 * Y * Y - 0.00411 * Y * Y * Y - 0.00057 * Y * Y * Y * Y;
  } else {
    const Y = year / 1000;
    return 1721139.29189 + 365242.13740 * Y + 0.06134 * Y * Y + 0.00111 * Y * Y * Y - 0.00071 * Y * Y * Y * Y;
  }
}

function jdeToDate(jde) {
  const jd = jde + 0.5;
  const z = floor(jd);
  const f = jd - z;

  const alpha = floor((z * 100 - 186721625) / 3652425);
  const a = z + 1 + alpha - floor(alpha / 4);

  const b = a + 1524;
  const c = floor((b * 100 - 12210) / 36525);
  const d = floor(36525 * c / 100);
  const e = floor((b - d) * 1e4 / 306001);

  let month;
  let year;
  const dayWithFrac = (floor(b - d) - floor(306001 * e / 1e4)) + f;
  const day = floor(dayWithFrac);
  const dayFrac = dayWithFrac - day;

  if (e === 14 || e === 15) {
    month = e - 13;
  } else {
    month = e - 1;
  }
  if (month < 3) {
    year = floor(c) - 4715;
  } else {
    year = floor(c) - 4716;
  }

  const totalSeconds = round(dayFrac * 86400);
  const hours = floor(totalSeconds / 3600);
  const minutes = floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const dObj = new Date(Date.UTC(2000, month - 1, day, hours, minutes, seconds));
  dObj.setUTCFullYear(year);
  return dObj;
}

const nc = [
  -0.4072, 0.17241, 0.01608, 0.01039, 0.00739,
  -0.00514, 0.00208, -0.00111, -0.00057, 0.00056,
  -0.00042, 0.00042, 0.00038, -0.00024, -0.00017,
  -0.00007, 0.00004, 0.00004, 0.00003, 0.00003,
  -0.00003, 0.00003, -0.00002, -0.00002, 0.00002
];

const ac = [
  0.000325, 0.000165, 0.000164, 0.000126, 0.00011,
  0.000062, 0.00006, 0.000056, 0.000047, 0.000042,
  0.00004, 0.000037, 0.000035, 0.000023
];

function newMoonJDEByK(k) {
  const T = k * ck;
  const E = horner(T, 1, -0.002516, -0.0000074);
  const M = horner(T, 2.5534 * D2R, 29.1053567 * D2R / ck, -0.0000014 * D2R, -0.00000011 * D2R);
  const M_ = horner(T, 201.5643 * D2R, 385.81693528 * D2R / ck, 0.0107582 * D2R, 0.00001238 * D2R, -0.000000058 * D2R);
  const F = horner(T, 160.7108 * D2R, 390.67050284 * D2R / ck, -0.0016118 * D2R, -0.00000227 * D2R, 0.000000011 * D2R);
  const Ω = horner(T, 124.7746 * D2R, -1.56375588 * D2R / ck, 0.0020672 * D2R, 0.00000215 * D2R);

  const A = [
    299.7 * D2R + 0.107408 * D2R * k - 0.009173 * T * T,
    251.88 * D2R + 0.016321 * D2R * k,
    251.83 * D2R + 26.651886 * D2R * k,
    349.42 * D2R + 36.412478 * D2R * k,
    84.66 * D2R + 18.206239 * D2R * k,
    141.74 * D2R + 53.303771 * D2R * k,
    207.17 * D2R + 2.453732 * D2R * k,
    154.84 * D2R + 7.30686 * D2R * k,
    34.52 * D2R + 27.261239 * D2R * k,
    207.19 * D2R + 0.121824 * D2R * k,
    291.34 * D2R + 1.844379 * D2R * k,
    161.72 * D2R + 24.198154 * D2R * k,
    239.56 * D2R + 25.513099 * D2R * k,
    331.55 * D2R + 3.592518 * D2R * k
  ];

  const corr =
    nc[0] * sin(M_) +
    nc[1] * sin(M) * E +
    nc[2] * sin(2 * M_) +
    nc[3] * sin(2 * F) +
    nc[4] * sin(M_ - M) * E +
    nc[5] * sin(M_ + M) * E +
    nc[6] * sin(2 * M) * E * E +
    nc[7] * sin(M_ - 2 * F) +
    nc[8] * sin(M_ + 2 * F) +
    nc[9] * sin(2 * M_ + M) * E +
    nc[10] * sin(3 * M_) +
    nc[11] * sin(M + 2 * F) * E +
    nc[12] * sin(M - 2 * F) * E +
    nc[13] * sin(2 * M_ - M) * E +
    nc[14] * sin(Ω) +
    nc[15] * sin(M_ + 2 * M) +
    nc[16] * sin(2 * (M_ - F)) +
    nc[17] * sin(3 * M) +
    nc[18] * sin(M_ + M - 2 * F) +
    nc[19] * sin(2 * (M_ + F)) +
    nc[20] * sin(M_ + M + 2 * F) +
    nc[21] * sin(M_ - M + 2 * F) +
    nc[22] * sin(M_ - M - 2 * F) +
    nc[23] * sin(3 * M_ + M) +
    nc[24] * sin(4 * M_);

  let additional = 0;
  for (let i = 0; i < ac.length; i++) {
    additional += ac[i] * sin(A[i]);
  }

  const meanNM = horner(T, 2451550.09766, 29.530588861 / ck, 0.00015437, -0.00000015, 0.00000000073);
  return meanNM + corr + additional;
}

function formatDateISO(d) {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  const h = String(d.getUTCHours()).padStart(2, '0');
  const min = String(d.getUTCMinutes()).padStart(2, '0');
  const s = String(d.getUTCSeconds()).padStart(2, '0');
  const yStr = y < 0 ? '-' + String(abs(y)).padStart(4, '0') : String(y).padStart(4, '0');
  return `${yStr}-${m}-${day}T${h}:${min}:${s}Z`;
}

function makeDate(year, monthIndex, day, hours = 0, minutes = 0, seconds = 0) {
  const d = new Date(Date.UTC(2000, monthIndex, day, hours, minutes, seconds));
  d.setUTCFullYear(year);
  return d;
}

function getYearStartInfo(year) {
  const eqJDE = getSpringEquinoxJDE(year);
  const eqDate = jdeToDate(eqJDE);
  const eqIsrael = new Date(eqDate.getTime() + 2 * 3600 * 1000);

  const kApprox = floor((year + 0.22 - 2000) * 12.3685 + 0.5);
  const candidates = [kApprox - 1, kApprox, kApprox + 1].map(k => {
    const jde = newMoonJDEByK(k);
    const d = jdeToDate(jde);
    return { k, jde, d, diffDays: (eqIsrael.getTime() - d.getTime()) / 86400000 };
  });

  candidates.sort((a, b) => abs(a.diffDays) - abs(b.diffDays));
  let chosen = candidates[0];

  let postponed = false;
  if (chosen.diffDays > 8) {
    const nextCand = candidates.find(c => c.k === chosen.k + 1) || candidates[1];
    chosen = nextCand;
    postponed = true;
  }

  const nmDate = chosen.d;
  let rhDate;
  if (nmDate.getUTCHours() < 18) {
    rhDate = makeDate(nmDate.getUTCFullYear(), nmDate.getUTCMonth(), nmDate.getUTCDate() - 1, 18, 0, 0);
  } else {
    rhDate = makeDate(nmDate.getUTCFullYear(), nmDate.getUTCMonth(), nmDate.getUTCDate(), 18, 0, 0);
  }

  return {
    year,
    equinoxIsrael: eqIsrael,
    newMoon: chosen.d,
    kStart: chosen.k,
    diffDaysToEquinox: chosen.diffDays,
    postponed,
    roshHashana: rhDate
  };
}

function buildDynamicLunisolarYear(year) {
  const current = getYearStartInfo(year);
  const next = getYearStartInfo(year + 1);

  const diffDaysYear = (next.roshHashana.getTime() - current.roshHashana.getTime()) / 86400000;
  const hasLeapMonth = diffDaysYear > 365;
  const monthCount = hasLeapMonth ? 13 : 12;

  const months = [];
  const rjDates = [];
  for (let i = 0; i <= monthCount; i++) {
    const k = current.kStart + i;
    const nm = jdeToDate(newMoonJDEByK(k));
    let rj;
    if (nm.getUTCHours() < 18) {
      rj = makeDate(nm.getUTCFullYear(), nm.getUTCMonth(), nm.getUTCDate() - 1, 18, 0, 0);
    } else {
      rj = makeDate(nm.getUTCFullYear(), nm.getUTCMonth(), nm.getUTCDate(), 18, 0, 0);
    }
    rjDates.push({ rj, nm });
  }

  for (let i = 0; i < monthCount; i++) {
    months.push({
      index: i,
      name: i === 0 ? "Abib" : `Mes ${i + 1}`,
      roshJodes: formatDateISO(rjDates[i].rj),
      next: formatDateISO(rjDates[i + 1].rj),
      conjunction: formatDateISO(rjDates[i].nm)
    });
  }

  return {
    year,
    roshHashana: formatDateISO(current.roshHashana),
    hasLeapMonth,
    monthsCount: monthCount,
    daysInYear: round(diffDaysYear),
    equinoxIsrael: formatDateISO(current.equinoxIsrael),
    conjunction: formatDateISO(current.newMoon),
    postponed: current.postponed,
    months
  };
}

// ------------------------------------------------------------
// 1. Cargar año lunisolar (con cálculo dinámico retrospectivo)
// ------------------------------------------------------------

function generateLunisolarYear(year) {
  const y = parseInt(year, 10);
  if (yearsMap[y]) return yearsMap[y];
  if (isNaN(y) || y < 1 || y > 3500) {
    throw new Error("Año lunisolar fuera de rango válido: " + year);
  }
  const dynamicYear = buildDynamicLunisolarYear(y);
  yearsMap[y] = dynamicYear;
  return dynamicYear;
}

// ------------------------------------------------------------
// 2. Obtener vista del mes lunisolar
// ------------------------------------------------------------

function getLunisolarMonthView(year, baseMonthIndex, monthOffset) {
  let yearData = generateLunisolarYear(year);

  // Índice real del mes
  let index = baseMonthIndex + monthOffset;

  // Si se pasa del último mes → avanzar de año
  while (index >= yearData.months.length) {
    index -= yearData.months.length;
    year++;
    yearData = generateLunisolarYear(year);
  }

  // Si se pasa del primer mes → retroceder de año (hasta año 1)
  while (index < 0) {
    if (year <= 1) {
      index = 0;
      break;
    }
    year--;
    yearData = generateLunisolarYear(year);
    index += yearData.months.length;
  }

  const month = yearData.months[index];

  // ------------------------------------------------------------
  // Generar días del mes en UTC puro (compatible año 1 al 2040+)
  // Regla: Los meses comienzan con la conjunción / Luna Nueva (0% de luminosidad)
  // ------------------------------------------------------------

  const rj = new Date(month.roshJodes);
  const start = new Date(Date.UTC(2000, rj.getUTCMonth(), rj.getUTCDate()));
  start.setUTCFullYear(rj.getUTCFullYear());

  const nxt = new Date(month.next);
  const end = new Date(Date.UTC(2000, nxt.getUTCMonth(), nxt.getUTCDate()));
  end.setUTCFullYear(nxt.getUTCFullYear());

  const days = [];
  let cursor = new Date(start);

  while (cursor <= end) {
    days.push(new Date(cursor));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return {
    yearData,
    month: {
      ...month,
      days
    },
    monthIndex: index
  };
}

  return { generateLunisolarYear, getLunisolarMonthView };
}

const defaultEngine = createLunisolarEngine(yearsMap);
export const { generateLunisolarYear, getLunisolarMonthView } = defaultEngine;