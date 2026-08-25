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

// ------------------------------------------------------------
// 1. Cargar año lunisolar
// ------------------------------------------------------------

export function generateLunisolarYear(year) {
  if (yearsMap[year]) return yearsMap[year];
  throw new Error("Año no precalculado todavía: " + year);
}

// ------------------------------------------------------------
// 2. Obtener vista del mes lunisolar
// ------------------------------------------------------------

export function getLunisolarMonthView(year, baseMonthIndex, monthOffset) {
  let yearData = generateLunisolarYear(year);

  // Índice real del mes
  let index = baseMonthIndex + monthOffset;

  // Si se pasa del último mes → avanzar de año
  while (index >= yearData.months.length) {
    index -= yearData.months.length;
    year++;
    yearData = generateLunisolarYear(year);
  }

  // Si se pasa del primer mes → retroceder de año
  while (index < 0) {
    year--;
    yearData = generateLunisolarYear(year);
    index += yearData.months.length;
  }

  const month = yearData.months[index];

  // ------------------------------------------------------------
  // Generar días del mes en UTC puro
  // Regla: Los meses comienzan con la conjunción / Luna Nueva (0% de luminosidad)
  // ------------------------------------------------------------

  const rj = new Date(month.roshJodes);
  const start = new Date(Date.UTC(rj.getUTCFullYear(), rj.getUTCMonth(), rj.getUTCDate()));

  const nxt = new Date(month.next);
  const end = new Date(Date.UTC(nxt.getUTCFullYear(), nxt.getUTCMonth(), nxt.getUTCDate()));

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