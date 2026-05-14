function getMoonPhaseInfo(date) {
  const synodicMonth = 29.53058867;
  const ref = new Date(Date.UTC(2000, 0, 6, 18, 14));
  const diff = (date - ref) / (1000 * 60 * 60 * 24);
  const phase = diff % synodicMonth;
  return Math.round((1 - Math.cos((2 * Math.PI * phase) / synodicMonth)) * 50);
}

console.log("June 14, 2026:");
for (let h = 0; h <= 21; h += 3) {
    const d = new Date(Date.UTC(2026, 5, 14, h, 0, 0));
    console.log(`${d.toISOString()} - ${getMoonPhaseInfo(d)}%`);
}
console.log("\nJune 15, 2026:");
for (let h = 0; h <= 21; h += 3) {
    const d = new Date(Date.UTC(2026, 5, 15, h, 0, 0));
    console.log(`${d.toISOString()} - ${getMoonPhaseInfo(d)}%`);
}
