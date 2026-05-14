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

function findZeroIllumination(year, jsMonth) {
    console.log(`Checking for Month ${jsMonth + 1} of ${year}...`);
    for (let day = 13; day <= 17; day++) {
        const date = new Date(Date.UTC(year, jsMonth, day, 18, 0, 0));
        const info = getMoonPhaseInfo(date);
        console.log(`Date: ${date.toISOString()} - Illumination: ${info.illumination}%`);
    }
}

findZeroIllumination(2026, 5); // June is index 5
