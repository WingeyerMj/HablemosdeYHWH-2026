// js/astronomicalEngine.js
// Motor astronómico real para navegador usando astronomia desde CDN

import * as astronomia from "https://cdn.jsdelivr.net/npm/astronomia/+esm";

const { julian, solar, moonposition, moonphase } = astronomia;

// ------------------------------------------------------------
// 1. Equinoccio de primavera en Israel
// ------------------------------------------------------------

// Fórmula de Meeus para equinoccio de marzo (aproximación de alta precisión)
export function getSpringEquinoxUTC(year) {
  const Y = (year - 2000) / 1000;

  const JDE =
    2451623.80984 +
    365242.37404 * Y +
    0.05169 * Y * Y -
    0.00411 * Y * Y * Y -
    0.00057 * Y * Y * Y * Y;

  return julian.JDToDate(JDE);
}

// Israel = UTC+2 (suficiente para cálculo astronómico)
export function getSpringEquinoxIsrael(year) {
  const utc = getSpringEquinoxUTC(year);
  return new Date(utc.getTime() + 2 * 3600 * 1000);
}

// ------------------------------------------------------------
// 2. Luna nueva real (elongación = 0°)
// ------------------------------------------------------------

export function getNewMoonNear(date, rangeDays = 5) {
  const jd = julian.DateToJD(date);

  // Fecha juliana de la luna nueva más cercana
  const nmJD = moonphase.new(jd);

  const nmDate = julian.JDToDate(nmJD);

  const diffDays = Math.abs((nmDate - date) / (1000 * 60 * 60 * 24));

  if (diffDays <= rangeDays) {
    return nmDate;
  }

  return null;
}

// ------------------------------------------------------------
// 3. Generar lunas nuevas posteriores
// ------------------------------------------------------------

export function getNextNewMoonAfter(date) {
  const jd = julian.DateToJD(date);
  const nextJD = moonphase.new(jd + 1); // +1 día para evitar repetir
  return julian.JDToDate(nextJD);
}

export function getAllNewMoonsFrom(startDate, count = 14) {
  const moons = [];
  let current = getNextNewMoonAfter(startDate);

  for (let i = 0; i < count; i++) {
    moons.push(current);
    current = getNextNewMoonAfter(current);
  }

  return moons;
}

// ------------------------------------------------------------
// 4. Construcción del año lunisolar real
// ------------------------------------------------------------

export function buildLunisolarYear(year) {
  // 1. Equinoccio en Israel
  const equinox = getSpringEquinoxIsrael(year);

  // 2. Nueva Regla: Luna nueva debe estar dentro de un rango de 8 días del equinoccio.
  // Si la luna nueva más cercana es más de 8 días antes, se pospone a la siguiente (posterior al equinoccio).
  let roshHashana = getNewMoonNear(equinox, 15);
  const diffToEquinox = (equinox - roshHashana) / (1000 * 60 * 60 * 24);

  if (diffToEquinox > 8) {
    roshHashana = getNextNewMoonAfter(equinox);
  }

  if (!roshHashana) {
    throw new Error(
      "No se encontró luna nueva válida para Rosh Hashaná."
    );
  }

  // 3. Generar lunas nuevas para los meses
  const newMoons = getAllNewMoonsFrom(roshHashana, 14);

  // 4. Determinar si hay mes 13 calculando el Rosh Hashaná del siguiente año
  const nextEquinox = getSpringEquinoxIsrael(year + 1);
  let nextRosh = getNewMoonNear(nextEquinox, 15);
  const diffNext = (nextEquinox - nextRosh) / (1000 * 60 * 60 * 24);

  if (diffNext > 8) {
    nextRosh = getNextNewMoonAfter(nextEquinox);
  }

  const diffDays = (nextRosh - roshHashana) / (1000 * 60 * 60 * 24);
  const hasLeapMonth = diffDays > 365;

  const monthCount = hasLeapMonth ? 13 : 12;

  // 5. Construir meses reales
  const months = [];

  for (let i = 0; i < monthCount; i++) {
    const start = newMoons[i];
    const end = newMoons[i + 1];

    const days = [];
    let cursor = new Date(start);

    while (cursor < end) {
      days.push(new Date(cursor));
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }

    months.push({
      index: i,
      name: i === 0 ? "Abib" : `Mes ${i}`,
      roshJodes: start,
      days
    });
  }

  return {
    year,
    roshHashana,
    months,
    hasLeapMonth
  };
}