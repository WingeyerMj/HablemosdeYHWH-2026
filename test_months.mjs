import { lunisolar2026 } from './Calendar/js/data/year2026.js';
import { getMoonPhaseInfo } from './Calendar/js/moonPhase.js';

lunisolar2026.months.forEach((m, idx) => {
  const rjRaw = new Date(m.roshJodes);
  const start = new Date(Date.UTC(rjRaw.getUTCFullYear(), rjRaw.getUTCMonth(), rjRaw.getUTCDate()));
  const nextRaw = new Date(m.next);
  const end = new Date(Date.UTC(nextRaw.getUTCFullYear(), nextRaw.getUTCMonth(), nextRaw.getUTCDate()));

  const days = [];
  let cursor = new Date(start);
  while (cursor < end) {
    days.push(new Date(cursor));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  const firstDay = days[0];
  const lastDay = days[days.length - 1];
  const firstMoon = getMoonPhaseInfo(firstDay);
  const lastMoon = getMoonPhaseInfo(lastDay);

  console.log(`Month ${m.name} (${days.length} days):`);
  console.log(`  First day (Rosh Jodesh): ${firstDay.toISOString().slice(0,10)} -> Illum: ${firstMoon.illumination}%`);
  console.log(`  Last day (End of month): ${lastDay.toISOString().slice(0,10)} -> Illum: ${lastMoon.illumination}%`);
});
