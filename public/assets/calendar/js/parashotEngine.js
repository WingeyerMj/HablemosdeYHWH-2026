// js/parashotEngine.js
// Cálculo y Mapeo Canónico del Ciclo Anual de Parashot en el Calendario Lunisolar

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

export const ALL_YEARS_MAP = {
  2025: lunisolar2025, 2026: lunisolar2026, 2027: lunisolar2027, 2028: lunisolar2028,
  2029: lunisolar2029, 2030: lunisolar2030, 2031: lunisolar2031, 2032: lunisolar2032,
  2033: lunisolar2033, 2034: lunisolar2034, 2035: lunisolar2035, 2036: lunisolar2036,
  2037: lunisolar2037, 2038: lunisolar2038, 2039: lunisolar2039, 2040: lunisolar2040
};

export const PARASHOT_CANONICAL = [
  { num: 1, title: "Bereshit", ref: "Génesis 1:1 - 6:8", book: "Génesis" },
  { num: 2, title: "Noaj", ref: "Génesis 6:9 - 11:32", book: "Génesis" },
  { num: 3, title: "Lej Lejá", ref: "Génesis 12:1 - 17:27", book: "Génesis" },
  { num: 4, title: "Vayerá", ref: "Génesis 18:1 - 22:24", book: "Génesis" },
  { num: 5, title: "Jayei Sarah", ref: "Génesis 23:1 - 25:18", book: "Génesis" },
  { num: 6, title: "Toldot", ref: "Génesis 25:19 - 28:9", book: "Génesis" },
  { num: 7, title: "Vayetze", ref: "Génesis 28:10 - 32:3", book: "Génesis" },
  { num: 8, title: "Vayishlaj", ref: "Génesis 32:4 - 36:43", book: "Génesis" },
  { num: 9, title: "Vayeshev", ref: "Génesis 37:1 - 40:23", book: "Génesis" },
  { num: 10, title: "Miketz", ref: "Génesis 41:1 - 44:17", book: "Génesis" },
  { num: 11, title: "Vayigash", ref: "Génesis 44:18 - 47:27", book: "Génesis" },
  { num: 12, title: "Vayeji", ref: "Génesis 47:28 - 50:26", book: "Génesis" },
  { num: 13, title: "Shemot", ref: "Éxodo 1:1 - 6:1", book: "Éxodo" },
  { num: 14, title: "Vaerá", ref: "Éxodo 6:2 - 9:35", book: "Éxodo" },
  { num: 15, title: "Bo", ref: "Éxodo 10:1 - 13:16", book: "Éxodo" },
  { num: 16, title: "Beshalaj", ref: "Éxodo 13:17 - 17:16", book: "Éxodo" },
  { num: 17, title: "Yitró", ref: "Éxodo 18:1 - 20:23", book: "Éxodo" },
  { num: 18, title: "Mishpatim", ref: "Éxodo 21:1 - 24:18", book: "Éxodo" },
  { num: 19, title: "Terumah", ref: "Éxodo 25:1 - 27:19", book: "Éxodo" },
  { num: 20, title: "Tetzaveh", ref: "Éxodo 27:20 - 30:10", book: "Éxodo" },
  { num: 21, title: "Ki Tisá", ref: "Éxodo 30:11 - 34:35", book: "Éxodo" },
  { num: 22, title: "Vayakhel", ref: "Éxodo 35:1 - 38:20", book: "Éxodo" },
  { num: 23, title: "Pekudei", ref: "Éxodo 38:21 - 40:38", book: "Éxodo" },
  { num: 24, title: "Vayikrá", ref: "Levítico 1:1 - 5:26", book: "Levítico" },
  { num: 25, title: "Tzav", ref: "Levítico 6:1 - 8:36", book: "Levítico" },
  { num: 26, title: "Sheminí", ref: "Levítico 9:1 - 11:47", book: "Levítico" },
  { num: 27, title: "Tazria", ref: "Levítico 12:1 - 13:59", book: "Levítico" },
  { num: 28, title: "Metzorá", ref: "Levítico 14:1 - 15:33", book: "Levítico" },
  { num: 29, title: "Ajarei Mot", ref: "Levítico 16:1 - 18:30", book: "Levítico" },
  { num: 30, title: "Kedoshim", ref: "Levítico 19:1 - 20:27", book: "Levítico" },
  { num: 31, title: "Emor", ref: "Levítico 21:1 - 24:23", book: "Levítico" },
  { num: 32, title: "Behar", ref: "Levítico 25:1 - 26:2", book: "Levítico" },
  { num: 33, title: "Bejukotai", ref: "Levítico 26:3 - 27:34", book: "Levítico" },
  { num: 34, title: "Bemidbar", ref: "Números 1:1 - 4:20", book: "Números" },
  { num: 35, title: "Nasó", ref: "Números 4:21 - 7:89", book: "Números" },
  { num: 36, title: "Behaalotjá", ref: "Números 8:1 - 12:16", book: "Números" },
  { num: 37, title: "Shelaj Lejá", ref: "Números 13:1 - 15:41", book: "Números" },
  { num: 38, title: "Kóraj", ref: "Números 16:1 - 18:32", book: "Números" },
  { num: 39, title: "Jukat", ref: "Números 19:1 - 22:1", book: "Números" },
  { num: 40, title: "Balak", ref: "Números 22:2 - 25:9", book: "Números" },
  { num: 41, title: "Pinjás", ref: "Números 25:10 - 30:1", book: "Números" },
  { num: 42, title: "Matot", ref: "Números 30:2 - 32:42", book: "Números" },
  { num: 43, title: "Masei", ref: "Números 33:1 - 36:13", book: "Números" },
  { num: 44, title: "Devarim", ref: "Deuteronomio 1:1 - 3:22", book: "Deuteronomio" },
  { num: 45, title: "Vaetjanán", ref: "Deuteronomio 3:23 - 7:11", book: "Deuteronomio" },
  { num: 46, title: "Ekev", ref: "Deuteronomio 7:12 - 11:25", book: "Deuteronomio" },
  { num: 47, title: "Reeh", ref: "Deuteronomio 11:26 - 16:17", book: "Deuteronomio" },
  { num: 48, title: "Shofetim", ref: "Deuteronomio 16:18 - 21:9", book: "Deuteronomio" },
  { num: 49, title: "Ki Tetzé", ref: "Deuteronomio 21:10 - 25:19", book: "Deuteronomio" },
  { num: 50, title: "Ki Tavó", ref: "Deuteronomio 26:1 - 29:8", book: "Deuteronomio" },
  { num: 51, title: "Nitzavim", ref: "Deuteronomio 29:9 - 30:20", book: "Deuteronomio" },
  { num: 52, title: "Vayélej", ref: "Deuteronomio 31:1 - 31:30", book: "Deuteronomio" },
  { num: 53, title: "Haazinu", ref: "Deuteronomio 32:1 - 32:52", book: "Deuteronomio" },
  { num: 54, title: "Vezot Haberajáh", ref: "Deuteronomio 33:1 - 34:12", book: "Deuteronomio" }
];

export const PAIRS_COMBINABLE = [
  { num1: 51, num2: 52, title: "Nitzavim - Vayélej", ref: "Deuteronomio 29:9 - 31:30" },
  { num1: 42, num2: 43, title: "Matot - Masei", ref: "Números 30:2 - 36:13" },
  { num1: 22, num2: 23, title: "Vayakhel - Pekudei", ref: "Éxodo 35:1 - 40:38" },
  { num1: 27, num2: 28, title: "Tazria - Metzorá", ref: "Levítico 12:1 - 15:33" },
  { num1: 29, num2: 30, title: "Ajarei Mot - Kedoshim", ref: "Levítico 16:1 - 20:27" },
  { num1: 32, num2: 33, title: "Behar - Bejukotai", ref: "Levítico 25:1 - 27:34" },
  { num1: 39, num2: 40, title: "Jukat - Balak", ref: "Números 19:1 - 25:9" }
];

function toDateKey(d) {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

let cachedSchedule = null;

export function buildCompleteParashotSchedule() {
  if (cachedSchedule) return cachedSchedule;

  const schedule = new Map();

  // 1. Recopilar todos los días en UTC puro de 2025 a 2040
  const allDays = [];
  for (let y = 2025; y <= 2040; y++) {
    const yData = ALL_YEARS_MAP[y];
    if (!yData) continue;
    yData.months.forEach(m => {
      const rj = new Date(m.roshJodes);
      const nxt = new Date(m.next);
      let cur = new Date(Date.UTC(rj.getUTCFullYear(), rj.getUTCMonth(), rj.getUTCDate()));
      const end = new Date(Date.UTC(nxt.getUTCFullYear(), nxt.getUTCMonth(), nxt.getUTCDate()));
      let dayIdx = 0;
      while (cur < end) {
        allDays.push({
          date: new Date(cur),
          dateKey: toDateKey(cur),
          year: yData.year,
          monthIndex: m.index,
          monthName: m.name,
          dayIndex: dayIdx,
          isSaturday: cur.getUTCDay() === 6
        });
        cur.setUTCDate(cur.getUTCDate() + 1);
        dayIdx++;
      }
    });
  }

  // 2. Identificar Shemini Atzeret de cada año (Mes 7, índice 6, día 22)
  const sheminis = allDays.filter(d => d.monthIndex === 6 && d.dayIndex === 22);

  // Marcar Vezot Haberajáh en Shemini Atzeret / Simjat Torá (Conclusión de la Torá)
  sheminis.forEach(s => {
    schedule.set(s.dateKey, {
      title: "Vezot Haberajáh",
      numbers: [54],
      numberDisplay: "54",
      ref: "Deuteronomio 33:1 - 34:12",
      isDouble: false,
      isSpecial: true,
      isFestival: true,
      note: "Simjat Torá • Conclusión de la Torá"
    });
  });

  // 3. Procesar cada ciclo anual de lectura entre dos fiestas consecutivas de Sucot / Simjat Torá
  for (let c = 0; c < sheminis.length - 1; c++) {
    const sStart = sheminis[c];
    const sEnd = sheminis[c + 1];

    const cycleDays = allDays.filter(d => d.date > sStart.date && d.date <= sEnd.date);
    const shabbats = cycleDays.filter(d => d.isSaturday);

    // ¿El ciclo cuenta con mes 13 (año embolismal / bisiesto lunar)?
    const isLeapCycle = cycleDays.some(d => d.monthIndex === 12);

    const regularShabbats = [];
    shabbats.forEach(sh => {
      // Shabat durante Pésaj (Mes 1 / Abib, días 14 a 21)
      if (sh.monthIndex === 0 && sh.dayIndex >= 14 && sh.dayIndex <= 21) {
        schedule.set(sh.dateKey, {
          title: "Shabat Pésaj",
          subtitle: "Lectura Especial de Pésaj",
          numbers: [],
          numberDisplay: "Festividad",
          ref: "Éxodo 33:12 - 34:26",
          isDouble: false,
          isSpecial: true,
          isFestival: true,
          note: "Shabat Jol Hamoed Pésaj"
        });
      }
      // Shabat durante Sucot (Mes 7, días 14 a 21)
      else if (sh.monthIndex === 6 && sh.dayIndex >= 14 && sh.dayIndex <= 21) {
        // Se muestra la Parashá que toca esta semana: Vezot Haberajáh (#54).
        // Shemini Atzeret suele caer entre semana (y el calendario solo muestra
        // Parashá en Shabat), por eso se indica en este Shabat.
        // Si Shemini Atzeret cae en Shabat, Vezot Haberajáh ya se muestra allí.
        if (!sEnd.isSaturday) {
          schedule.set(sh.dateKey, {
            title: "Vezot Haberajáh",
            numbers: [54],
            numberDisplay: "54",
            ref: "Deuteronomio 33:1 - 34:12",
            isDouble: false,
            isSpecial: true,
            isFestival: false,
            note: "Parashá de la semana de Sucot • Conclusión de la Torá"
          });
        }
      }
      // Si coincide exactamente con el día de Shemini Atzeret
      else if (sh.dateKey === sEnd.dateKey) {
        // Ya marcado como Vezot Haberajáh
      }
      else {
        regularShabbats.push(sh);
      }
    });

    const portions = [];
    if (isLeapCycle) {
      // ------------------------------------------------------------------------
      // AÑO DE 13 MESES (Embolismal): Hay ~54 semanas.
      // Las 54 Parashot coinciden individualmente con los Shabatot del año.
      // ------------------------------------------------------------------------
      for (let p = 1; p <= 53; p++) {
        const item = PARASHOT_CANONICAL[p - 1];
        portions.push({
          title: item.title,
          numbers: [item.num],
          numberDisplay: String(item.num),
          ref: item.ref,
          isDouble: false,
          isSpecial: false,
          isFestival: false,
          note: "Lectura Individual (Año de 13 meses)"
        });
      }

      // Si por calendario exacto hay 1 semana menos antes de Sucot, unir 51 y 52
      if (regularShabbats.length < portions.length) {
        const diff = portions.length - regularShabbats.length;
        if (diff === 1) {
          const idx51 = portions.findIndex(p => p.numbers[0] === 51);
          if (idx51 !== -1) {
            portions.splice(idx51, 2, {
              title: "Nitzavim - Vayélej",
              numbers: [51, 52],
              numberDisplay: "51-52",
              ref: "Deuteronomio 29:9 - 31:30",
              isDouble: true,
              isSpecial: false,
              isFestival: false,
              note: "Lectura Conjunta"
            });
          }
        }
      }
    } else {
      // ------------------------------------------------------------------------
      // AÑO REGULAR DE 12 MESES: Hay solo ~50 semanas.
      // Como faltan semanas para las 54 porciones, se unen las Parashot
      // dobles tradicionales en el mismo Shabat:
      // Vayakhel-Pekudei, Tazria-Metzorá, Ajarei Mot-Kedoshim,
      // Behar-Bejukotai, Matot-Masei y Nitzavim-Vayélej.
      // ------------------------------------------------------------------------
      const neededReductions = Math.max(0, 53 - regularShabbats.length);
      const activePairs = PAIRS_COMBINABLE.slice(0, neededReductions);

      let pIdx = 1;
      while (pIdx <= 53) {
        const pair = activePairs.find(pr => pr.num1 === pIdx);
        if (pair) {
          portions.push({
            title: pair.title,
            numbers: [pair.num1, pair.num2],
            numberDisplay: `${pair.num1}-${pair.num2}`,
            ref: pair.ref,
            isDouble: true,
            isSpecial: false,
            isFestival: false,
            note: "Lectura Doble en Shabat (Año regular de 12 meses)"
          });
          pIdx += 2;
        } else {
          const item = PARASHOT_CANONICAL[pIdx - 1];
          portions.push({
            title: item.title,
            numbers: [item.num],
            numberDisplay: String(item.num),
            ref: item.ref,
            isDouble: false,
            isSpecial: false,
            isFestival: false,
            note: ""
          });
          pIdx += 1;
        }
      }
    }

    // Asignar porciones calculadas a cada Shabat regular
    for (let s = 0; s < regularShabbats.length; s++) {
      const sh = regularShabbats[s];
      if (s < portions.length) {
        schedule.set(sh.dateKey, portions[s]);
      } else {
        // Si sobra un Shabat inmediatamente previo a Sucot
        schedule.set(sh.dateKey, {
          title: "Haazinu",
          numbers: [53],
          numberDisplay: "53",
          ref: "Deuteronomio 32:1 - 32:52",
          isDouble: false,
          isSpecial: false,
          isFestival: false,
          note: "Cántico de Moisés"
        });
      }
    }
  }

  cachedSchedule = schedule;
  return schedule;
}

/**
 * Obtener la Parashá para una fecha dada (Date object o string YYYY-MM-DD)
 */
export function getParashaForDate(date) {
  const sched = buildCompleteParashotSchedule();
  let dateKey = "";
  if (typeof date === "string") {
    dateKey = date.split("T")[0];
  } else if (date instanceof Date) {
    dateKey = toDateKey(date);
  }
  return sched.get(dateKey) || null;
}
