// js/moonPhase.js

export function getMoonPhaseInfo(date) {
  const synodicMonth = 29.53058867;
  const ref = new Date(Date.UTC(2000, 0, 6, 18, 14));
  // Evaluar al atardecer (18:00 UTC) que es cuando se observa el inicio del día lunisolar
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 18, 0, 0));
  const diff = (d - ref) / (1000 * 60 * 60 * 24);
  const phase = ((diff % synodicMonth) + synodicMonth) % synodicMonth;

  const illumination = Math.round(
    (1 - Math.cos((2 * Math.PI * phase) / synodicMonth)) * 50
  );

  return { illumination };
}