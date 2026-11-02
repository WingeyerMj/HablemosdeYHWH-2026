// js/moonPhase.js

export function getMoonPhaseInfo(date) {
  const synodicMonth = 29.53058867;
  const ref = new Date(Date.UTC(2000, 0, 6, 18, 14));
  // Evaluar al atardecer (18:00 UTC) asegurando compatibilidad con años 1 al 99 (evitar offset 1900 de Date.UTC)
  const d = new Date(Date.UTC(2000, date.getUTCMonth(), date.getUTCDate(), 18, 0, 0));
  d.setUTCFullYear(date.getUTCFullYear());

  const diff = (d.getTime() - ref.getTime()) / (1000 * 60 * 60 * 24);
  const phase = ((diff % synodicMonth) + synodicMonth) % synodicMonth;

  const illumination = Math.round(
    (1 - Math.cos((2 * Math.PI * phase) / synodicMonth)) * 50
  );

  return { illumination };
}