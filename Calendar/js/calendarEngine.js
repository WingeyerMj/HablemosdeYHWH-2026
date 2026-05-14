// js/calendarEngine.js

import { lunisolar2025 } from "./data/year2025.js";
import { lunisolar2026 } from "./data/year2026.js";
import { lunisolar2027 } from "./data/year2027.js";

// ------------------------------------------------------------
// 1. Cargar año lunisolar
// ------------------------------------------------------------

export function generateLunisolarYear(year) {
  if (year === 2025) return lunisolar2025;
  if (year === 2026) return lunisolar2026;
  if (year === 2027) return lunisolar2027;

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
  // ------------------------------------------------------------

  const start = new Date(month.roshJodes); // UTC
  const end = new Date(month.next);        // UTC

  const days = [];
  let cursor = new Date(start);

  while (cursor < end) {
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