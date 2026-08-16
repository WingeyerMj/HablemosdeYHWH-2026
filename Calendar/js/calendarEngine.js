// js/calendarEngine.js

import { lunisolar2025 } from "./data/year2025.js";
import { lunisolar2026 } from "./data/year2026.js";
import { lunisolar2027 } from "./data/year2027.js";
import { lunisolar2028 } from "./data/year2028.js";
import { getMoonPhaseInfo } from "./moonPhase.js";

// ------------------------------------------------------------
// 1. Cargar año lunisolar
// ------------------------------------------------------------

export function generateLunisolarYear(year) {
  if (year === 2025) return lunisolar2025;
  if (year === 2026) return lunisolar2026;
  if (year === 2027) return lunisolar2027;
  if (year === 2028) return lunisolar2028;

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