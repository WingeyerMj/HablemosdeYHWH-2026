function getMoonPhaseInfo(date) {
  const synodicMonth = 29.53058867;
  const ref = new Date(Date.UTC(2000, 0, 6, 18, 14));
  const diff = (date - ref) / (1000 * 60 * 60 * 24);
  const phase = diff % synodicMonth;

  const illumination = Math.round(
    (1 - Math.cos((2 * Math.PI * phase) / synodicMonth)) * 50
  );

  return { illumination };
}

console.log("Check for April 16, 2026:");
for (let h = 0; h <= 23; h += 3) {
    const date = new Date(Date.UTC(2026, 3, 16, h, 0, 0));
    const info = getMoonPhaseInfo(date);
    console.log(`Time: ${date.toISOString()} - Illumination: ${info.illumination}%`);
}
