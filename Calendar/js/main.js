// js/main.js

import { generateLunisolarYear, getLunisolarMonthView } from "./calendarEngine.js";
import { getMoonPhaseInfo } from "./moonPhase.js";
import {
  getParashaForDate,
  HOLIDAYS_CANONICAL,
  PARASHOT_CANONICAL,
  PAIRS_COMBINABLE
} from "./parashotEngine.js";
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

// ------------------------------------------------------------
// 0. Modo Standalone PWA (cuando se abre como App instalada)
// ------------------------------------------------------------
const isStandalonePWA =
  window.matchMedia("(display-mode: standalone)").matches ||
  window.navigator.standalone === true ||
  new URLSearchParams(window.location.search).get("pwa") === "1";

if (isStandalonePWA) {
  document.documentElement.classList.add("pwa-standalone");
  document.body.classList.add("pwa-standalone");
}

// ------------------------------------------------------------
// 1. Fecha actual local convertida a fecha pura (dinámica por zona horaria)
// ------------------------------------------------------------

const now = new Date();
const today = new Date(Date.UTC(
  now.getFullYear(),
  now.getMonth(),
  now.getDate()
));

// ------------------------------------------------------------
// 2. Determinar año lunisolar actual
// ------------------------------------------------------------

const allYearsData = [
  lunisolar2025, lunisolar2026, lunisolar2027, lunisolar2028,
  lunisolar2029, lunisolar2030, lunisolar2031, lunisolar2032,
  lunisolar2033, lunisolar2034, lunisolar2035, lunisolar2036,
  lunisolar2037, lunisolar2038, lunisolar2039, lunisolar2040
];

let initialYear = allYearsData[0].year;
for (let i = 0; i < allYearsData.length; i++) {
  const nextYearData = allYearsData[i + 1];
  if (!nextYearData || today < new Date(nextYearData.roshHashana)) {
    initialYear = allYearsData[i].year;
    break;
  }
}

let currentYear = initialYear;
const yearData = generateLunisolarYear(currentYear);

// ------------------------------------------------------------
// 3. Encontrar el mes lunisolar actual según dataset
// ------------------------------------------------------------

function findCurrentLunisolarMonth(yearData, todayUTC) {
  for (let i = 0; i < yearData.months.length; i++) {
    const m = yearData.months[i];
    const rjRaw = new Date(m.roshJodes);
    const start = new Date(Date.UTC(rjRaw.getUTCFullYear(), rjRaw.getUTCMonth(), rjRaw.getUTCDate()));
    const nextRaw = new Date(m.next);
    const end = new Date(Date.UTC(nextRaw.getUTCFullYear(), nextRaw.getUTCMonth(), nextRaw.getUTCDate()));

    if (todayUTC >= start && todayUTC < end) {
      return i;
    }
  }
  return 0;
}

const initialMonthIndex = findCurrentLunisolarMonth(yearData, today);
let baseLunisolarMonthIndex = initialMonthIndex;
let currentMonthOffset = 0;

const gridEl = document.getElementById("calendar-grid");
const titleEl = document.getElementById("calendar-title");
const subtitleEl = document.getElementById("calendar-subtitle");
const yearSelectEl = document.getElementById("year-select");
const monthSelectEl = document.getElementById("month-select");
const sliderEl = document.getElementById("month-slider");
const sliderLabelEl = document.getElementById("slider-label");
const sidePrev = document.getElementById("side-prev");
const sideNext = document.getElementById("side-next");

function populateYearSelect() {
  if (!yearSelectEl) return;
  yearSelectEl.innerHTML = "";
  allYearsData.forEach(y => {
    const opt = document.createElement("option");
    opt.value = y.year;
    opt.textContent = y.year;
    if (y.year === currentYear) {
      opt.selected = true;
    }
    yearSelectEl.appendChild(opt);
  });
}

function populateMonthSelect(year, selectedIdx = 0) {
  if (!monthSelectEl) return;
  const yData = generateLunisolarYear(year);
  monthSelectEl.innerHTML = "";
  yData.months.forEach((m, idx) => {
    const opt = document.createElement("option");
    opt.value = idx;
    opt.textContent = m.name;
    if (idx === selectedIdx) {
      opt.selected = true;
    }
    monthSelectEl.appendChild(opt);
  });
}

populateYearSelect();
populateMonthSelect(currentYear, baseLunisolarMonthIndex);

if (yearSelectEl) {
  yearSelectEl.addEventListener("change", (e) => {
    const selectedYear = parseInt(e.target.value, 10);
    if (selectedYear) {
      currentYear = selectedYear;
      baseLunisolarMonthIndex = 0;
      currentMonthOffset = 0;
      populateMonthSelect(currentYear, 0);
      if (sliderEl) sliderEl.value = 0;
      updateSliderLabel();
      cambiarMesConTransicion(0);
    }
  });
}

if (monthSelectEl) {
  monthSelectEl.addEventListener("change", (e) => {
    const selectedMonth = parseInt(e.target.value, 10);
    if (!isNaN(selectedMonth)) {
      baseLunisolarMonthIndex = selectedMonth;
      currentMonthOffset = 0;
      if (sliderEl) sliderEl.value = 0;
      updateSliderLabel();
      cambiarMesConTransicion(0);
    }
  });
}

function goToToday() {
  currentYear = initialYear;
  baseLunisolarMonthIndex = initialMonthIndex;
  currentMonthOffset = 0;
  populateYearSelect();
  populateMonthSelect(currentYear, baseLunisolarMonthIndex);
  if (sliderEl) sliderEl.value = 0;
  updateSliderLabel();
  cambiarMesConTransicion(0);
}

// ------------------------------------------------------------
// 5. Formateadores de Fecha
// ------------------------------------------------------------

function formatLatam(date) {
  const d = new Date(date);
  const day = String(d.getUTCDate()).padStart(2, "0");
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const year = d.getUTCFullYear();
  return `${day}/${month}/${year}`;
}

const GREG_WEEKDAYS = [
  "Domingo (Día 1)",
  "Lunes (Día 2)",
  "Martes (Día 3)",
  "Miércoles (Día 4)",
  "Jueves (Día 5)",
  "Viernes (Día 6 • Preparación)",
  "Sábado (Shabat • 7° Día)"
];

const GREG_MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

function formatLongGregorian(date) {
  const d = new Date(date);
  const wName = GREG_WEEKDAYS[d.getUTCDay()];
  const day = d.getUTCDate();
  const mName = GREG_MONTHS[d.getUTCMonth()];
  const year = d.getUTCFullYear();
  return `${wName}, ${day} de ${mName} de ${year}`;
}

// ------------------------------------------------------------
// 6. Icono y descripción de luna según iluminación
// ------------------------------------------------------------

function getMoonIcon(illum) {
  const value = typeof illum === "string" ? parseFloat(illum) : illum;

  if (value === 0) return "🌑";
  if (value > 0 && value <= 24) return "🌒";
  if (value > 24 && value <= 49) return "🌓";
  if (value > 49 && value <= 74) return "🌔";
  if (value > 74 && value < 100) return "🌕";
  if (value === 100) return "🌕";

  return "🌘";
}

function getMoonPhaseLabel(illum, dayIndex) {
  const val = typeof illum === "string" ? parseFloat(illum) : illum;
  if (dayIndex === 0 || val === 0) return "Conjunción / Luna Nueva (0%)";
  if (dayIndex < 15) {
    if (val <= 30) return "Luna Creciente";
    if (val <= 65) return "Cuarto Creciente";
    return "Gibosa Creciente";
  }
  if (val >= 95) return "Luna Llena (Plenilunio)";
  if (val >= 60) return "Gibosa Menguante";
  if (val >= 30) return "Cuarto Menguante";
  return "Luna Menguante";
}

// ------------------------------------------------------------
// 6.2 Lógica Global de Festividades (Año)
// ------------------------------------------------------------

function getHolidaysForYear(year) {
  const { month: abibMonth } = getLunisolarMonthView(year, 0, 0);
  const { month: month7 } = getLunisolarMonthView(year, 0, 6);

  const rjAbibIdx = 0;
  const rj7Idx = 0;

  const pesajDate = new Date(abibMonth.days[rjAbibIdx + 14]);
  const hamatzoDate = new Date(abibMonth.days[rjAbibIdx + 15]);

  let bikurimDate = null;
  for (let i = 1; i <= 7; i++) {
    const d = new Date(pesajDate);
    d.setUTCDate(d.getUTCDate() + i);
    if (d.getUTCDay() === 0) {
      bikurimDate = d;
      break;
    }
  }

  const shavuotDate = bikurimDate ? new Date(Date.UTC(
    bikurimDate.getUTCFullYear(),
    bikurimDate.getUTCMonth(),
    bikurimDate.getUTCDate() + 49
  )) : null;

  const yomTeruahDate = new Date(month7.days[rj7Idx]);
  const yomKippurDate = new Date(month7.days[rj7Idx + 10]);
  const sukkotDate = new Date(month7.days[rj7Idx + 15]);

  const sheminiAtzeretDate = new Date(sukkotDate);
  sheminiAtzeretDate.setUTCDate(sheminiAtzeretDate.getUTCDate() + 7);

  return {
    pesajDate, hamatzoDate, bikurimDate, shavuotDate,
    yomTeruahDate, yomKippurDate, sukkotDate, sheminiAtzeretDate
  };
}

function isSameDay(d1, d2) {
  if (!d1 || !d2) return false;
  return d1.getUTCFullYear() === d2.getUTCFullYear() &&
    d1.getUTCMonth() === d2.getUTCMonth() &&
    d1.getUTCDate() === d2.getUTCDate();
}

// ------------------------------------------------------------
// 7. Render del calendario
// ------------------------------------------------------------

function renderCalendar() {
  const { yearData, month, monthIndex } = getLunisolarMonthView(
    currentYear,
    baseLunisolarMonthIndex,
    currentMonthOffset
  );

  titleEl.textContent = `${month.name}`;

  const yearChanged = yearData.year !== currentYear;
  if (yearSelectEl && parseInt(yearSelectEl.value, 10) !== yearData.year) {
    yearSelectEl.value = yearData.year;
  }
  currentYear = yearData.year;

  if (monthSelectEl) {
    if (yearChanged || monthSelectEl.children.length !== yearData.months.length) {
      populateMonthSelect(yearData.year, monthIndex);
    } else {
      monthSelectEl.value = monthIndex;
    }
  }

  const firstDay = month.days[0];
  const lastDay = month.days[month.days.length - 1];

  const leapBadgeHtml = yearData.hasLeapMonth
    ? `<span class="year-cycle-pill leap" title="Año con mes 13 (Adar II): las 54 Parashot se leen de forma individual cada Shabat">✨ Año de 13 Meses (Embolismal) • 54 Parashot Individuales</span>`
    : `<span class="year-cycle-pill regular" title="Año regular de 12 meses: se unen las 6 porciones dobles tradicionales en Shabat">📖 Año Regular (12 Meses) • Incluye Parashot Dobles</span>`;

  subtitleEl.innerHTML =
    `<div class="subtitle-dates">Rosh Hashaná: ${formatLatam(yearData.roshHashana)} | Mes: ${formatLatam(firstDay)} a ${formatLatam(lastDay)}</div>` +
    `<div class="subtitle-cycle-info">${leapBadgeHtml}</div>`;

  gridEl.innerHTML = "";

  const firstWeekday = firstDay.getUTCDay();

  for (let i = 0; i < firstWeekday; i++) {
    const cell = document.createElement("div");
    cell.className = "calendar-cell empty";
    gridEl.appendChild(cell);
  }

  const monthMoonData = month.days.map(d => getMoonPhaseInfo(d));

  const {
    pesajDate, hamatzoDate, bikurimDate, shavuotDate,
    yomTeruahDate, yomKippurDate, sukkotDate, sheminiAtzeretDate
  } = getHolidaysForYear(yearData.year);

  month.days.forEach((gregDate, index) => {
    const cell = document.createElement("div");
    cell.className = "calendar-cell";
    cell.setAttribute("role", "button");
    cell.setAttribute("tabindex", "0");

    const dayHolidays = [];
    let omerCountDay = null;
    let parashaInfo = null;

    const isToday = (
      gregDate.getUTCFullYear() === today.getUTCFullYear() &&
      gregDate.getUTCMonth() === today.getUTCMonth() &&
      gregDate.getUTCDate() === today.getUTCDate()
    );

    if (isToday) {
      cell.classList.add("today");
      const todayBadge = document.createElement("div");
      todayBadge.className = "today-badge";
      todayBadge.textContent = "HOY";
      cell.appendChild(todayBadge);
    }

    const moonInfo = monthMoonData[index];

    const isRoshJodesh = (index === 0);
    const isRoshHashana = (isRoshJodesh && month.index === 0);

    let lunisolarDay = "";

    if (isRoshHashana || isRoshJodesh) {
      cell.classList.add(isRoshHashana ? "roshhashana" : "roshjodesh");

      const label = document.createElement("div");
      label.className = isRoshHashana ? "roshhashana-label" : "rosh-label";
      label.textContent = isRoshHashana ? "Rosh Hashaná" : "Rosh Jodesh";
      cell.appendChild(label);

      lunisolarDay = "";
      if (isRoshHashana) dayHolidays.push(HOLIDAYS_CANONICAL.roshHashana);
      dayHolidays.push(HOLIDAYS_CANONICAL.roshJodesh);
    } else {
      lunisolarDay = index;
    }

    const lunisolarDayEl = document.createElement("div");
    lunisolarDayEl.className = "lunisolar-day";
    lunisolarDayEl.textContent = lunisolarDay;

    const gregorianDayEl = document.createElement("div");
    gregorianDayEl.className = "gregorian-day";
    gregorianDayEl.textContent = gregDate.getUTCDate();

    const moonContainer = document.createElement("div");
    moonContainer.className = "moon-info";

    const moonIcon = document.createElement("div");
    moonIcon.className = "moon-icon";
    moonIcon.textContent = getMoonIcon(moonInfo.illumination);

    const moonText = document.createElement("span");
    moonText.className = "moon-text";
    const illumText = typeof moonInfo.illumination === "string"
      ? moonInfo.illumination
      : `${moonInfo.illumination}%`;
    moonText.textContent = illumText;

    moonContainer.appendChild(moonText);
    moonContainer.appendChild(moonIcon);

    cell.appendChild(lunisolarDayEl);
    cell.appendChild(gregorianDayEl);

    if (!isRoshJodesh && !isRoshHashana) {
      cell.appendChild(moonContainer);
    }

    const msPerDay = 1000 * 60 * 60 * 24;
    const hamatzoDiff = Math.round((gregDate - hamatzoDate) / msPerDay);
    const sukkotDiff = Math.round((gregDate - sukkotDate) / msPerDay);

    if (month.index === 0 && isSameDay(gregDate, pesajDate)) {
      const label = document.createElement("div");
      label.className = "holiday-label pesaj-label";
      label.textContent = "Pesaj";
      cell.appendChild(label);
      cell.classList.add("pesaj");
      dayHolidays.push(HOLIDAYS_CANONICAL.pesaj);
    }

    if (month.index === 0 && hamatzoDiff >= 0 && hamatzoDiff < 7) {
      cell.classList.add("hamatzo");
      if (hamatzoDiff === 0) {
        const label = document.createElement("div");
        label.className = "holiday-label hamatzo-label";
        label.textContent = "Hamatzo";
        cell.appendChild(label);
      }
      dayHolidays.push({
        ...HOLIDAYS_CANONICAL.hamatzo,
        dayOfFestival: `Día ${hamatzoDiff + 1} de 7 de Panes sin Levadura`
      });
    }

    if (month.index === 0 && isSameDay(gregDate, bikurimDate)) {
      const label = document.createElement("div");
      label.className = "holiday-label bikurim-label";
      label.textContent = "Bikurim";
      cell.appendChild(label);
      cell.classList.add("bikurim");
      dayHolidays.push(HOLIDAYS_CANONICAL.bikurim);
    }

    if (month.index === 6 && isSameDay(gregDate, yomTeruahDate)) {
      const label = document.createElement("div");
      label.className = "holiday-label yomteruah-label";
      label.textContent = "Yom Teruah";
      cell.appendChild(label);
      cell.classList.add("yomteruah");
      dayHolidays.push(HOLIDAYS_CANONICAL.yomTeruah);
    }

    if (month.index === 6 && isSameDay(gregDate, yomKippurDate)) {
      const label = document.createElement("div");
      label.className = "holiday-label yomkippur-label";
      label.textContent = "Yom Kippur";
      cell.appendChild(label);
      cell.classList.add("yomkippur");
      dayHolidays.push(HOLIDAYS_CANONICAL.yomKippur);
    }

    if (month.index === 6 && sukkotDiff >= 0 && sukkotDiff < 7) {
      cell.classList.add("sukkot");
      if (sukkotDiff === 0) {
        const label = document.createElement("div");
        label.className = "holiday-label sukkot-label";
        label.textContent = "Sukkot";
        cell.appendChild(label);
      }
      dayHolidays.push({
        ...HOLIDAYS_CANONICAL.sukkot,
        dayOfFestival: `Día ${sukkotDiff + 1} de 7 de Sukkot`
      });
    }

    if (month.index === 6 && isSameDay(gregDate, sheminiAtzeretDate)) {
      const label = document.createElement("div");
      label.className = "holiday-label shemini-label";
      label.textContent = "Shemini Atzeret";
      cell.appendChild(label);
      cell.classList.add("sheminiatzeret");
      dayHolidays.push(HOLIDAYS_CANONICAL.sheminiAtzeret);
    }

    if (month.index === 2 && isSameDay(gregDate, shavuotDate)) {
      const label = document.createElement("div");
      label.className = "holiday-label shavuot-label";
      label.textContent = "Shavuot";
      cell.appendChild(label);
      cell.classList.add("shavuot");
      dayHolidays.push(HOLIDAYS_CANONICAL.shavuot);
    }

    if (bikurimDate && shavuotDate && !isRoshJodesh && !isRoshHashana) {
      const d1 = Date.UTC(gregDate.getUTCFullYear(), gregDate.getUTCMonth(), gregDate.getUTCDate());
      const dB = Date.UTC(bikurimDate.getUTCFullYear(), bikurimDate.getUTCMonth(), bikurimDate.getUTCDate());

      const diffTime = d1 - dB;
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays >= 0 && diffDays < 49) {
        omerCountDay = diffDays + 1;
        const omerTag = document.createElement("div");
        omerTag.className = "omer-row";
        omerTag.textContent = `Omer ${omerCountDay}`;
        const moonEl = cell.querySelector('.moon-info');
        if (moonEl) {
          cell.insertBefore(omerTag, moonEl);
        } else {
          cell.appendChild(omerTag);
        }
      }
    }

    const isShabat = (gregDate.getUTCDay() === 6);
    parashaInfo = getParashaForDate(gregDate);

    if (isShabat) {
      cell.classList.add("shabat-cell");
      if (parashaInfo) {
        const pBadge = document.createElement("a");
        pBadge.className = "shabat-parasha-badge";
        if (parashaInfo.isDouble) pBadge.classList.add("double");
        if (parashaInfo.isFestival) pBadge.classList.add("festival");

        const targetPNum = (parashaInfo.numbers && parashaInfo.numbers.length > 0) ? parashaInfo.numbers[0] : null;
        pBadge.href = targetPNum ? `/parashot/${targetPNum}` : `/parashot`;
        pBadge.title = `${parashaInfo.title}${parashaInfo.ref ? ' (' + parashaInfo.ref + ')' : ''}${parashaInfo.note ? ' • ' + parashaInfo.note : ''} — Toca para ver lecturas`;

        const pTop = document.createElement("div");
        pTop.className = "parasha-badge-top";
        const pIco = document.createElement("span");
        pIco.className = "parasha-badge-ico";
        pIco.textContent = parashaInfo.isFestival ? "✡️" : "📖";
        const pTitle = document.createElement("span");
        pTitle.className = "parasha-badge-title";
        pTitle.textContent = parashaInfo.title;
        pTop.appendChild(pIco);
        pTop.appendChild(pTitle);
        pBadge.appendChild(pTop);

        if (parashaInfo.ref) {
          const pRef = document.createElement("div");
          pRef.className = "parasha-badge-ref";
          pRef.textContent = (parashaInfo.numberDisplay && parashaInfo.numbers && parashaInfo.numbers.length > 0 ? `#${parashaInfo.numberDisplay} • ` : "") + parashaInfo.ref;
          pBadge.appendChild(pRef);
        }

        if (parashaInfo.isDouble) {
          const pDoublePill = document.createElement("span");
          pDoublePill.className = "parasha-double-pill";
          pDoublePill.textContent = "Lectura Doble";
          pBadge.appendChild(pDoublePill);
        }

        pBadge.addEventListener("click", (ev) => {
          ev.preventDefault();
          ev.stopPropagation();
          openDayDetailModal({
            gregDate,
            year: yearData.year,
            monthName: month.name,
            monthIndex: month.index,
            lunisolarDay,
            dayIndex: index,
            isRoshJodesh,
            isRoshHashana,
            isShabat,
            isToday,
            moonInfo,
            omerCountDay,
            dayHolidays,
            parashaInfo
          });
        });

        cell.appendChild(pBadge);
      }
    }

    const openCurrentCellModal = () => {
      openDayDetailModal({
        gregDate,
        year: yearData.year,
        monthName: month.name,
        monthIndex: month.index,
        lunisolarDay,
        dayIndex: index,
        isRoshJodesh,
        isRoshHashana,
        isShabat,
        isToday,
        moonInfo,
        omerCountDay,
        dayHolidays,
        parashaInfo
      });
    };

    cell.addEventListener("click", openCurrentCellModal);
    cell.addEventListener("keydown", (ev) => {
      if (ev.key === "Enter" || ev.key === " ") {
        ev.preventDefault();
        openCurrentCellModal();
      }
    });

    gridEl.appendChild(cell);
  });

  setTimeout(() => {
    const todayCell = document.querySelector('.calendar-cell.today');
    if (todayCell) {
      todayCell.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, 300);
}

// ------------------------------------------------------------
// 10.2 Modal de Ficha del Día, Festividades y Parashot (100% Offline)
// ------------------------------------------------------------

function ensureModalsContainer() {
  let modalOverlay = document.getElementById("cal-offline-modal-overlay");
  if (!modalOverlay) {
    modalOverlay = document.createElement("div");
    modalOverlay.id = "cal-offline-modal-overlay";
    modalOverlay.className = "cal-modal-overlay";
    modalOverlay.innerHTML = `
      <div class="cal-modal-card" role="dialog" aria-modal="true" aria-labelledby="cal-modal-title">
        <button type="button" class="cal-modal-close" id="cal-modal-close-btn" aria-label="Cerrar">✕</button>
        <div id="cal-modal-body"></div>
      </div>
    `;
    document.body.appendChild(modalOverlay);

    modalOverlay.addEventListener("click", (e) => {
      if (e.target === modalOverlay) {
        closeOfflineModal();
      }
    });

    document.getElementById("cal-modal-close-btn").addEventListener("click", closeOfflineModal);

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modalOverlay.classList.contains("active")) {
        closeOfflineModal();
      }
    });
  }
  return modalOverlay;
}

function closeOfflineModal() {
  const modalOverlay = document.getElementById("cal-offline-modal-overlay");
  if (modalOverlay) {
    modalOverlay.classList.remove("active");
  }
}

function openDayDetailModal(data) {
  const overlay = ensureModalsContainer();
  const bodyEl = document.getElementById("cal-modal-body");

  const {
    gregDate, year, monthName, lunisolarDay, dayIndex,
    isRoshJodesh, isRoshHashana, isShabat, isToday,
    moonInfo, omerCountDay, dayHolidays, parashaInfo
  } = data;

  const lunisolarTitle = isRoshHashana
    ? `Rosh Hashaná • Inicio de ${monthName} (${year})`
    : isRoshJodesh
      ? `Rosh Jódesh • Declaración de ${monthName} (${year})`
      : `Día ${lunisolarDay} de ${monthName} • Año Lunisolar ${year}`;

  const moonIcon = getMoonIcon(moonInfo.illumination);
  const moonLabel = getMoonPhaseLabel(moonInfo.illumination, dayIndex);
  const illumVal = typeof moonInfo.illumination === "string" ? moonInfo.illumination : `${moonInfo.illumination}%`;

  let holidaysHtml = "";
  if (dayHolidays && dayHolidays.length > 0) {
    holidaysHtml = dayHolidays.map(h => `
      <div class="cal-detail-section holiday-box">
        <div class="cal-detail-badge-row">
          <span class="cal-pill gold">🎺 Moed / Festividad de YHWH</span>
          ${h.hebrew ? `<span class="cal-hebrew-tag">${h.hebrew}</span>` : ""}
        </div>
        <h4 class="cal-detail-heading">${h.title}</h4>
        ${h.dayOfFestival ? `<div class="cal-festival-sub">${h.dayOfFestival}</div>` : ""}
        <p class="cal-detail-text">${h.summary}</p>
        <div class="cal-scripture-grid">
          <div class="cal-scripture-item">
            <strong>📖 Torá:</strong> <span>${h.torahRef}</span>
          </div>
          <div class="cal-scripture-item">
            <strong>📜 Profetas / Escritos:</strong> <span>${h.prophetsRef}</span>
          </div>
        </div>
      </div>
    `).join("");
  }

  let omerHtml = "";
  if (omerCountDay) {
    const weeks = Math.floor(omerCountDay / 7);
    const remDays = omerCountDay % 7;
    const weekStr = weeks > 0
      ? `${weeks} ${weeks === 1 ? "semana" : "semanas"}${remDays > 0 ? ` y ${remDays} ${remDays === 1 ? "día" : "días"}` : " completas"}`
      : `${omerCountDay} ${omerCountDay === 1 ? "día" : "días"}`;
    omerHtml = `
      <div class="cal-detail-section omer-box">
        <div class="cal-detail-badge-row">
          <span class="cal-pill amber">🌾 Cuenta del Omer hacia Shavuot</span>
        </div>
        <h4 class="cal-detail-heading">Día ${omerCountDay} del Omer (${weekStr})</h4>
        <p class="cal-detail-text">
          Faltan <strong>${50 - omerCountDay} días</strong> para la fiesta de <strong>Shavuot</strong> (Levítico 23:15-16: <em>"Y contaréis desde el día que sigue al Shabat, desde el día en que ofrecisteis la gavilla de la ofrenda mecida; siete semanas cumplidas serán"</em>).
        </p>
      </div>
    `;
  }

  let parashaHtml = "";
  if (parashaInfo) {
    const targetPNum = (parashaInfo.numbers && parashaInfo.numbers.length > 0) ? parashaInfo.numbers[0] : null;
    const onlineStudyUrl = targetPNum ? `/parashot/${targetPNum}` : `/parashot`;
    const isOnline = navigator.onLine !== false;

    parashaHtml = `
      <div class="cal-detail-section parasha-box">
        <div class="cal-detail-badge-row">
          <span class="cal-pill cyan">${parashaInfo.isFestival ? "✡️ Lectura Festiva" : parashaInfo.isDouble ? "🟣 Parashá Doble de Shabat" : "📖 Parashá Semanal de Shabat"}</span>
          ${parashaInfo.numberDisplay ? `<span class="cal-pill-num">Porción #${parashaInfo.numberDisplay}</span>` : ""}
        </div>
        <h4 class="cal-detail-heading">Parashá ${parashaInfo.title}</h4>
        ${parashaInfo.summary ? `<p class="cal-detail-text">${parashaInfo.summary}</p>` : ""}
        <div class="cal-scripture-grid">
          ${parashaInfo.ref ? `<div class="cal-scripture-item"><strong>📖 Torá (${parashaInfo.book || "Pentateuco"}):</strong> <span>${parashaInfo.ref}</span></div>` : ""}
          ${parashaInfo.haftara ? `<div class="cal-scripture-item"><strong>📜 Haftará (Profetas):</strong> <span>${parashaInfo.haftara}</span></div>` : ""}
          ${parashaInfo.brit ? `<div class="cal-scripture-item"><strong>✨ Brit Jadashá:</strong> <span>${parashaInfo.brit}</span></div>` : ""}
        </div>
        ${!isStandalonePWA ? `
          <div class="cal-modal-actions-row">
            ${isOnline
              ? `<a href="${onlineStudyUrl}" class="cal-action-link">🌐 Abrir estudio completo en la web →</a>`
              : `<span class="cal-offline-note">📴 Modo sin conexión: las citas y el resumen están disponibles aquí mismo sin internet.</span>`
            }
          </div>
        ` : ""}
      </div>
    `;
  }

  bodyEl.innerHTML = `
    <div class="cal-modal-header">
      <div class="cal-modal-badges">
        ${isToday ? `<span class="cal-pill today">📍 HOY</span>` : ""}
        ${isShabat ? `<span class="cal-pill shabat">🕯️ Shabat Kódesh</span>` : ""}
      </div>
      <h3 id="cal-modal-title" class="cal-modal-main-title">${lunisolarTitle}</h3>
      <p class="cal-modal-gregorian">📅 ${formatLongGregorian(gregDate)} (${formatLatam(gregDate)})</p>
    </div>

    <div class="cal-detail-section moon-box">
      <div class="cal-moon-row">
        <div class="cal-moon-big-icon">${moonIcon}</div>
        <div>
          <div class="cal-moon-phase-title">${moonLabel}</div>
          <div class="cal-moon-phase-sub">Luminosidad lunar al atardecer (18:00 UTC): <strong>${illumVal}</strong></div>
        </div>
      </div>
    </div>

    ${holidaysHtml}
    ${omerHtml}
    ${parashaHtml}
  `;

  overlay.classList.add("active");
}

// ------------------------------------------------------------
// 10.3 Navegación
// ------------------------------------------------------------

function cambiarMes(delta) {
  currentMonthOffset += delta;
  if (sliderEl) sliderEl.value = currentMonthOffset;
  updateSliderLabel();
  renderCalendar();
}

if (sliderEl) {
  sliderEl.addEventListener("input", () => {
    currentMonthOffset = parseInt(sliderEl.value, 10);
    updateSliderLabel();
    renderCalendar();
  });
}

function updateSliderLabel() {
  if (!sliderLabelEl) return;
  if (currentMonthOffset === 0) {
    sliderLabelEl.textContent = "Mes actual";
  } else if (currentMonthOffset < 0) {
    sliderLabelEl.textContent = `Mes ${currentMonthOffset} (anterior)`;
  } else {
    sliderLabelEl.textContent = `Mes +${currentMonthOffset} (posterior)`;
  }
}

renderCalendar();

function applyTheme(theme) {
  const isDark = (theme === "dark");
  document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
  if (isDark) {
    document.body.classList.add("dark");
  } else {
    document.body.classList.remove("dark");
  }
  try {
    localStorage.setItem("theme", isDark ? "dark" : "light");
  } catch (e) {}
}

const themeToggle = document.getElementById("theme-toggle");
let savedTheme = "dark";
try {
  savedTheme = localStorage.getItem("theme") || document.documentElement.getAttribute("data-theme") || "dark";
} catch (e) {}
applyTheme(savedTheme);

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme") || "dark";
    const next = (current === "dark") ? "light" : "dark";
    applyTheme(next);
  });
}

function cambiarMesConTransicion(delta) {
  const grid = document.getElementById('calendar-grid');
  if (!grid) return;
  grid.classList.add('fade-out');

  setTimeout(() => {
    cambiarMes(delta);
    grid.classList.remove('fade-out');
    grid.classList.add('fade-in');

    setTimeout(() => {
      grid.classList.remove('fade-in');
    }, 250);

  }, 250);
}

if (sidePrev) sidePrev.addEventListener('click', () => cambiarMesConTransicion(-1));
if (sideNext) sideNext.addEventListener('click', () => cambiarMesConTransicion(1));

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const s = document.createElement('script');
    s.src = src;
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

const HTML2CANVAS_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
const JSPDF_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';

async function captureCalendar() {
  await loadScript(HTML2CANVAS_CDN);

  const container = document.querySelector('.calendar-container');
  const body = document.body;
  const section = document.querySelector('.section');

  const savedBodyBg = body.style.backgroundImage;
  const savedSectionBg = section ? section.style.backgroundImage : '';
  body.style.backgroundImage = 'none';
  if (section) section.style.backgroundImage = 'none';

  const legendEl = container.querySelector('.calendar-torah-legend');
  const savedLegendDisplay = legendEl ? legendEl.style.display : null;
  if (legendEl) legendEl.style.display = 'none';

  const sliderEl = container.querySelector('.month-slider');
  const savedSliderDisplay = sliderEl ? sliderEl.style.display : null;
  if (sliderEl) sliderEl.style.display = 'none';

  const hideEls = container.querySelectorAll('.nav-arrow, .download-bar, .theme-toggle');
  const savedDisplays = [];
  hideEls.forEach(el => {
    savedDisplays.push({ el, display: el.style.display });
    el.style.display = 'none';
  });

  const bgColor = getComputedStyle(document.documentElement).getPropertyValue('--bg-global').trim() || '#060606';

  const canvas = await html2canvas(container, {
    backgroundColor: bgColor,
    scale: 3,
    useCORS: true,
    allowTaint: false,
    logging: false
  });

  if (legendEl) legendEl.style.display = savedLegendDisplay || '';
  if (sliderEl) sliderEl.style.display = savedSliderDisplay || '';
  savedDisplays.forEach(item => {
    item.el.style.display = item.display;
  });

  body.style.backgroundImage = savedBodyBg;
  if (section) section.style.backgroundImage = savedSectionBg;

  return canvas;
}

function downloadCanvasAsFile(canvas, filename) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('No se pudo generar el blob de la imagen'));
        return;
      }
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      resolve();
    }, 'image/png');
  });
}

async function downloadPNG() {
  const btn = document.getElementById('btn-download-png');
  if (!btn) return;
  const originalText = btn.innerHTML;
  btn.innerHTML = '⏳ Generando…';
  btn.disabled = true;

  try {
    const canvas = await captureCalendar();
    const monthName = titleEl.textContent || 'calendario';
    const filename = `Calendario_Lunisolar_${monthName.replace(/\s/g, '_')}.png`;
    await downloadCanvasAsFile(canvas, filename);
  } catch (err) {
    console.error('Error generando PNG:', err);
    alert('Para exportar como imagen PNG por primera vez necesitas conexión o puedes usar la función de captura de tu dispositivo.');
  } finally {
    btn.innerHTML = originalText;
    btn.disabled = false;
  }
}

async function downloadPDF() {
  const btn = document.getElementById('btn-download-pdf');
  if (!btn) return;
  const originalText = btn.innerHTML;
  btn.innerHTML = '⏳ Generando…';
  btn.disabled = true;

  try {
    await loadScript(JSPDF_CDN);
    const canvas = await captureCalendar();
    const imgData = canvas.toDataURL('image/png');

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const imgRatio = canvas.width / canvas.height;
    let imgW = pageWidth - 20;
    let imgH = imgW / imgRatio;

    if (imgH > pageHeight - 20) {
      imgH = pageHeight - 20;
      imgW = imgH * imgRatio;
    }

    const x = (pageWidth - imgW) / 2;
    const y = (pageHeight - imgH) / 2;

    pdf.addImage(imgData, 'PNG', x, y, imgW, imgH);

    const monthName = titleEl.textContent || 'calendario';
    pdf.save(`Calendario_Lunisolar_${monthName.replace(/\s/g, '_')}.pdf`);
  } catch (err) {
    console.error('Error generando PDF:', err);
    alert('Para exportar como PDF por primera vez necesitas conexión o puedes usar Imprimir > Guardar como PDF en tu navegador.');
  } finally {
    btn.innerHTML = originalText;
    btn.disabled = false;
  }
}

// ------------------------------------------------------------
// 17. Instalación PWA y Generador de Software Portable (.html 100% Offline)
// ------------------------------------------------------------

let deferredInstallPrompt = null;
let swOfflineReady = false;

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredInstallPrompt = e;
  const installBtn = document.getElementById("btn-install-pwa");
  if (installBtn) {
    installBtn.classList.add("pwa-ready-pulse");
  }
});

window.addEventListener("appinstalled", () => {
  deferredInstallPrompt = null;
  updateOfflineStatusBadge(true, "App Instalada");
  closeOfflineModal();
});

function updateOfflineStatusBadge(isCached = swOfflineReady, customText = null) {
  const pill = document.getElementById("offline-status-pill");
  if (!pill) return;

  const isOnline = navigator.onLine !== false;
  if (!isOnline) {
    pill.className = "offline-status-pill mode-offline";
    pill.innerHTML = `<span class="status-dot"></span><span>Modo Sin Conexión Activo</span>`;
    pill.title = "Estás navegando sin internet. El calendario funciona al 100% desde la memoria de tu dispositivo.";
  } else if (isCached) {
    pill.className = "offline-status-pill mode-ready";
    pill.innerHTML = `<span class="status-dot"></span><span>${customText || "Listo sin internet"}</span>`;
    pill.title = "El calendario (2025-2040) ya está guardado en este dispositivo y funciona sin conexión a internet.";
  } else {
    pill.className = "offline-status-pill mode-sync";
    pill.innerHTML = `<span class="status-dot"></span><span>Disponible Offline</span>`;
  }
}

window.addEventListener("online", () => updateOfflineStatusBadge());
window.addEventListener("offline", () => updateOfflineStatusBadge());

async function registerCalendarServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  try {
    const swUrl = window.location.pathname.toLowerCase().includes("/calendar/index.html")
      ? "./sw.js"
      : "/sw-calendar.js";
    const reg = await navigator.serviceWorker.register(swUrl, { scope: "/" }).catch(() =>
      navigator.serviceWorker.register("./sw.js")
    );
    if (reg) {
      swOfflineReady = true;
      updateOfflineStatusBadge(true);
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({ type: "GET_CACHE_STATUS" });
      }
    }
    navigator.serviceWorker.addEventListener("message", (event) => {
      if (event.data && event.data.type === "CACHE_STATUS") {
        swOfflineReady = true;
        updateOfflineStatusBadge(true);
      }
    });
  } catch (err) {
    console.warn("Aviso registrando Service Worker del calendario:", err);
  }
}

function detectDevicePlatform() {
  const ua = navigator.userAgent || "";
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isAndroid = /Android/i.test(ua);
  if (isIOS) return "ios";
  if (isAndroid) return "android";
  return "desktop";
}

async function handleInstallButtonClick() {
  if (deferredInstallPrompt) {
    try {
      deferredInstallPrompt.prompt();
      const { outcome } = await deferredInstallPrompt.userChoice;
      if (outcome === "accepted") {
        deferredInstallPrompt = null;
        return;
      }
    } catch (err) {
      console.warn("Error al mostrar prompt nativo:", err);
    }
  }
  openInstallModal();
}

function openInstallModal() {
  const overlay = ensureModalsContainer();
  const bodyEl = document.getElementById("cal-modal-body");
  const platform = detectDevicePlatform();

  let platformStepsHtml = "";
  if (platform === "ios") {
    platformStepsHtml = `
      <div class="cal-install-steps">
        <div class="cal-step-item">
          <span class="cal-step-num">1</span>
          <div>En <strong>Safari</strong> (iPhone / iPad), toca el botón <strong>Compartir</strong> <span class="cal-inline-ico">📤</span> en la barra inferior.</div>
        </div>
        <div class="cal-step-item">
          <span class="cal-step-num">2</span>
          <div>Desliza hacia abajo y selecciona <strong>"Agregar a pantalla de inicio"</strong> <span class="cal-inline-ico">➕</span>.</div>
        </div>
        <div class="cal-step-item">
          <span class="cal-step-num">3</span>
          <div>Toca <strong>"Agregar"</strong>. Verás el icono de <strong>Calendario YHWH</strong> en tu celular y podrás abrirlo siempre sin internet.</div>
        </div>
      </div>
    `;
  } else if (platform === "android") {
    platformStepsHtml = `
      <div class="cal-install-steps">
        <div class="cal-step-item">
          <span class="cal-step-num">1</span>
          <div>Toca el menú de tu navegador <strong>(⋮ arriba a la derecha)</strong> en Chrome o Samsung Internet.</div>
        </div>
        <div class="cal-step-item">
          <span class="cal-step-num">2</span>
          <div>Selecciona <strong>"Instalar aplicación"</strong> o <strong>"Agregar a la pantalla principal"</strong>.</div>
        </div>
        <div class="cal-step-item">
          <span class="cal-step-num">3</span>
          <div>¡Listo! El calendario quedará instalado como una aplicación en tu teléfono y funcionará <strong>100% sin conexión a internet</strong>.</div>
        </div>
      </div>
    `;
  } else {
    platformStepsHtml = `
      <div class="cal-install-steps">
        <div class="cal-step-item">
          <span class="cal-step-num">1</span>
          <div>En la barra de direcciones de tu navegador (arriba a la derecha en Chrome, Edge o Brave), haz clic en el icono <strong>Instalar Calendario YHWH</strong> <span class="cal-inline-ico">🖥️⬇️</span> (o en el menú <strong>⋮ → Guardar y compartir → Instalar página como aplicación</strong>).</div>
        </div>
        <div class="cal-step-item">
          <span class="cal-step-num">2</span>
          <div>Confirma haciendo clic en <strong>"Instalar"</strong>. Se creará un acceso directo en tu Escritorio y Menú Inicio, y abrirá en su propia ventana sin necesitar conexión a internet.</div>
        </div>
      </div>
    `;
  }

  bodyEl.innerHTML = `
    <div class="cal-modal-header">
      <div class="cal-modal-badges">
        <span class="cal-pill gold">📲 Software 100% Sin Conexión</span>
        <span class="cal-pill cyan">Años 2025 – 2040 Incluidos</span>
      </div>
      <h3 id="cal-modal-title" class="cal-modal-main-title">Instalar Calendario Lunisolar en tu Dispositivo</h3>
      <p class="cal-modal-gregorian">Usa el calendario en tu celular, tablet o computadora sin necesidad de tener internet.</p>
    </div>

    <div class="cal-detail-section install-status-box">
      <div class="cal-install-ready-row">
        <span class="cal-ready-check">✅</span>
        <div>
          <strong>Memoria sin conexión activada en este navegador</strong>
          <p class="cal-detail-text" style="margin-top:4px;">
            Todos los meses lunisolares (2025–2040), fases de la luna, cuenta del Omer, Moedim (Festividades) y las 54 Parashot con sus lecturas bíblicas ya están guardados en tu dispositivo.
          </p>
        </div>
      </div>
    </div>

    ${deferredInstallPrompt ? `
      <div class="cal-detail-section" style="text-align:center;">
        <button type="button" id="modal-direct-install-btn" class="cal-primary-install-btn">
          📲 Instalar Aplicación Ahora (1 Clic)
        </button>
      </div>
    ` : `
      <div class="cal-detail-section">
        <h4 class="cal-detail-heading">Opción 1: Instalar como Aplicación desde el Navegador (PWA)</h4>
        ${platformStepsHtml}
      </div>
    `}

    <div class="cal-detail-section portable-box">
      <div class="cal-detail-badge-row">
        <span class="cal-pill amber">💾 Archivo Independiente Portable</span>
      </div>
      <h4 class="cal-detail-heading">Opción 2: Descargar Software Portable (Archivo Único)</h4>
      <p class="cal-detail-text">
        También puedes descargar el programa completo del calendario en un único archivo autónomo (<code>.html</code>). Puedes guardarlo en tu PC o celular, enviarlo por <strong>WhatsApp, Telegram o USB</strong> y abrirlo en cualquier dispositivo sin internet nunca:
      </p>
      <button type="button" id="modal-download-portable-btn" class="cal-portable-download-btn">
        📥 Descargar Calendario Portable (Funciona 100% Sin Internet)
      </button>
    </div>
  `;

  overlay.classList.add("active");

  const directBtn = document.getElementById("modal-direct-install-btn");
  if (directBtn) {
    directBtn.addEventListener("click", () => {
      handleInstallButtonClick();
    });
  }

  const portableBtn = document.getElementById("modal-download-portable-btn");
  if (portableBtn) {
    portableBtn.addEventListener("click", () => {
      downloadStandaloneCalendarApp();
    });
  }
}

async function downloadStandaloneCalendarApp() {
  const btn = document.getElementById("modal-download-portable-btn");
  const prevText = btn ? btn.innerHTML : "";
  if (btn) {
    btn.innerHTML = "⏳ Empaquetando software offline...";
    btn.disabled = true;
  }

  try {
    let cssText = "";
    try {
      const res = await fetch("/assets/calendar/css/style.css");
      if (res.ok) cssText = await res.text();
    } catch (e) {}

    if (!cssText) {
      for (const sheet of Array.from(document.styleSheets)) {
        try {
          if (sheet.href && sheet.href.includes("style.css")) {
            cssText = Array.from(sheet.cssRules).map(r => r.cssText).join("\n");
            break;
          }
        } catch (e) {}
      }
    }

    const yearsJson = JSON.stringify(allYearsData);
    const holidaysJson = JSON.stringify(HOLIDAYS_CANONICAL);
    const parashotJson = JSON.stringify(PARASHOT_CANONICAL);
    const pairsJson = JSON.stringify(PAIRS_COMBINABLE);

    const standaloneHtml = `<!DOCTYPE html>
<html lang="es" data-theme="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Calendario Lunisolar — Hablemos de YHWH (Software Offline)</title>
  <style>
${cssText}
  </style>
</head>
<body class="calendar-page dark pwa-standalone">
  <div class="calendar-container">
    <button id="theme-toggle" class="theme-toggle" aria-label="Cambiar tema">
      <svg class="icon moon" viewBox="0 0 24 24" fill="none">
        <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 11.79 9 9 0 0 1 .5-.21z" fill="#FFFDF2" />
      </svg>
      <svg class="icon sun" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="6" fill="#FFEA00" />
        <g stroke="#FF8C00" stroke-width="2" stroke-linecap="round">
          <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </g>
      </svg>
    </button>

    <header class="calendar-header">
      <div class="calendar-header-content">
        <div class="calendar-title-wrapper">
          <h1 id="calendar-title"></h1>
          <div class="year-select-container">
            <select id="year-select" class="year-select" aria-label="Seleccionar Año"></select>
          </div>
          <div class="month-select-container">
            <select id="month-select" class="month-select" aria-label="Seleccionar Mes"></select>
          </div>
        </div>
        <h2 id="calendar-subtitle"></h2>
      </div>
    </header>

    <div class="download-bar">
      <div class="offline-status-pill mode-ready">
        <span class="status-dot"></span>
        <span>Software Portable 100% Sin Internet • Hablemos de YHWH</span>
      </div>
      <div style="flex-grow:1;"></div>
      <button type="button" id="btn-go-today" class="download-btn" title="Ir al mes actual">📅 Hoy</button>
      <button type="button" onclick="window.print()" class="download-btn" title="Imprimir o Guardar como PDF">🖨️ Imprimir / PDF</button>
    </div>

    <div class="weekdays-row">
      <div>1</div><div>2</div><div>3</div><div>4</div><div>5</div><div>6</div><div>Shabat</div>
    </div>

    <div class="calendar-wrapper">
      <button id="side-prev" class="nav-arrow left" aria-label="Mes anterior"></button>
      <div id="calendar-grid" class="calendar-grid"></div>
      <button id="side-next" class="nav-arrow right" aria-label="Siguiente mes"></button>
    </div>

    <div class="calendar-torah-legend">
      <div class="legend-header">📖 <strong>Ciclo Anual de Parashot (Lectura Semanal de la Torá) — Toca cualquier día para ver sus lecturas y fiestas:</strong></div>
      <div class="legend-items">
        <div class="legend-chip"><span class="chip-badge regular">📖 Parashá Individual</span><span><strong>Años de 13 Meses (Embolismales):</strong> ~54 semanas, coincidiendo las 54 Parashot de forma individual cada Shabat.</span></div>
        <div class="legend-chip"><span class="chip-badge double">🟣 Lectura Doble</span><span><strong>Años Regulares de 12 Meses:</strong> ~50 semanas; se unen las porciones dobles tradicionales.</span></div>
        <div class="legend-chip"><span class="chip-badge festival">✡️ Festividad</span><span>Shabat durante Pésaj o Sucot. Concluye en Sheminí Atzéret con <em>Vezot Haberajáh</em> (#54) y reinicia en <em>Bereshit</em> (#1).</span></div>
      </div>
    </div>
  </div>

  <script>
    const allYearsData = ${yearsJson};
    const HOLIDAYS_CANONICAL = ${holidaysJson};
    const PARASHOT_CANONICAL = ${parashotJson};
    const PAIRS_COMBINABLE = ${pairsJson};
    const yearsMap = {};
    allYearsData.forEach(y => { yearsMap[y.year] = y; });

    function getMoonPhaseInfo(date) {
      const synodicMonth = 29.53058867;
      const ref = new Date(Date.UTC(2000, 0, 6, 18, 14));
      const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 18, 0, 0));
      const diff = (d - ref) / (1000 * 60 * 60 * 24);
      const phase = ((diff % synodicMonth) + synodicMonth) % synodicMonth;
      return { illumination: Math.round((1 - Math.cos((2 * Math.PI * phase) / synodicMonth)) * 50) };
    }

    function generateLunisolarYear(year) {
      return yearsMap[year] || allYearsData[0];
    }

    function getLunisolarMonthView(year, baseMonthIndex, monthOffset) {
      let yearData = generateLunisolarYear(year);
      let index = baseMonthIndex + monthOffset;
      while (index >= yearData.months.length) {
        index -= yearData.months.length;
        year++;
        yearData = generateLunisolarYear(year);
      }
      while (index < 0) {
        year--;
        yearData = generateLunisolarYear(year);
        index += yearData.months.length;
      }
      const month = yearData.months[index];
      const rj = new Date(month.roshJodes);
      const start = new Date(Date.UTC(rj.getUTCFullYear(), rj.getUTCMonth(), rj.getUTCDate()));
      const nxt = new Date(month.next);
      const end = new Date(Date.UTC(nxt.getUTCFullYear(), nxt.getUTCMonth(), nxt.getUTCDate()));
      const days = [];
      let cursor = new Date(start);
      while (cursor <= end) {
        days.push(new Date(cursor));
        cursor.setUTCDate(cursor.getUTCDate() + 1);
      }
      return { yearData, month: { ...month, days }, monthIndex: index };
    }

    function toDateKey(d) {
      return d.getUTCFullYear() + "-" + String(d.getUTCMonth() + 1).padStart(2, "0") + "-" + String(d.getUTCDate()).padStart(2, "0");
    }

    let cachedSchedule = null;
    function buildCompleteParashotSchedule() {
      if (cachedSchedule) return cachedSchedule;
      const schedule = new Map();
      const allDays = [];
      allYearsData.forEach(yData => {
        yData.months.forEach(m => {
          const rj = new Date(m.roshJodes);
          const nxt = new Date(m.next);
          let cur = new Date(Date.UTC(rj.getUTCFullYear(), rj.getUTCMonth(), rj.getUTCDate()));
          const end = new Date(Date.UTC(nxt.getUTCFullYear(), nxt.getUTCMonth(), nxt.getUTCDate()));
          let dayIdx = 0;
          while (cur < end) {
            allDays.push({ date: new Date(cur), dateKey: toDateKey(cur), year: yData.year, monthIndex: m.index, monthName: m.name, dayIndex: dayIdx, isSaturday: cur.getUTCDay() === 6 });
            cur.setUTCDate(cur.getUTCDate() + 1);
            dayIdx++;
          }
        });
      });
      const sheminis = allDays.filter(d => d.monthIndex === 6 && d.dayIndex === 22);
      const p54 = PARASHOT_CANONICAL[53];
      sheminis.forEach(s => {
        schedule.set(s.dateKey, { title: "Vezot Haberajáh", numbers: [54], numberDisplay: "54", ref: p54.ref, haftara: p54.haftara, brit: p54.brit, book: p54.book, summary: p54.summary, isDouble: false, isSpecial: true, isFestival: true });
      });
      for (let c = 0; c < sheminis.length - 1; c++) {
        const sStart = sheminis[c], sEnd = sheminis[c + 1];
        const cycleDays = allDays.filter(d => d.date > sStart.date && d.date <= sEnd.date);
        const shabbats = cycleDays.filter(d => d.isSaturday);
        const isLeapCycle = cycleDays.some(d => d.monthIndex === 12);
        const regularShabbats = [];
        shabbats.forEach(sh => {
          if (sh.monthIndex === 0 && sh.dayIndex >= 14 && sh.dayIndex <= 21) {
            schedule.set(sh.dateKey, { title: "Shabat Pésaj", numbers: [], numberDisplay: "Festividad", ref: "Éxodo 33:12 - 34:26", haftara: "Ezequiel 37:1-14", brit: "1 Corintios 15:1-23", book: "Éxodo", summary: "Lectura especial de Shabat durante la fiesta de Pésaj.", isDouble: false, isSpecial: true, isFestival: true });
          } else if (sh.monthIndex === 6 && sh.dayIndex >= 14 && sh.dayIndex <= 21) {
            if (!sEnd.isSaturday) schedule.set(sh.dateKey, { title: "Vezot Haberajáh", numbers: [54], numberDisplay: "54", ref: p54.ref, haftara: p54.haftara, brit: p54.brit, book: p54.book, summary: p54.summary, isDouble: false, isSpecial: true, isFestival: false });
          } else if (sh.dateKey !== sEnd.dateKey) {
            regularShabbats.push(sh);
          }
        });
        const portions = [];
        if (isLeapCycle) {
          for (let p = 1; p <= 53; p++) {
            const item = PARASHOT_CANONICAL[p - 1];
            portions.push({ title: item.title, numbers: [item.num], numberDisplay: String(item.num), ref: item.ref, haftara: item.haftara, brit: item.brit, book: item.book, summary: item.summary, isDouble: false });
          }
          if (regularShabbats.length < portions.length && portions.length - regularShabbats.length === 1) {
            const idx51 = portions.findIndex(p => p.numbers[0] === 51);
            if (idx51 !== -1) portions.splice(idx51, 2, { title: "Nitzavim - Vayélej", numbers: [51, 52], numberDisplay: "51-52", ref: "Deuteronomio 29:9 - 31:30", haftara: PARASHOT_CANONICAL[51].haftara, brit: PARASHOT_CANONICAL[50].brit, book: "Deuteronomio", summary: PARASHOT_CANONICAL[50].summary, isDouble: true });
          }
        } else {
          const neededReductions = Math.max(0, 53 - regularShabbats.length);
          const activePairs = PAIRS_COMBINABLE.slice(0, neededReductions);
          let pIdx = 1;
          while (pIdx <= 53) {
            const pair = activePairs.find(pr => pr.num1 === pIdx);
            if (pair) {
              const i1 = PARASHOT_CANONICAL[pair.num1 - 1], i2 = PARASHOT_CANONICAL[pair.num2 - 1];
              portions.push({ title: pair.title, numbers: [pair.num1, pair.num2], numberDisplay: pair.num1 + "-" + pair.num2, ref: pair.ref, haftara: i2.haftara, brit: i1.brit + "; " + i2.brit, book: i1.book, summary: i1.title + ": " + i1.summary + " | " + i2.title + ": " + i2.summary, isDouble: true });
              pIdx += 2;
            } else {
              const item = PARASHOT_CANONICAL[pIdx - 1];
              portions.push({ title: item.title, numbers: [item.num], numberDisplay: String(item.num), ref: item.ref, haftara: item.haftara, brit: item.brit, book: item.book, summary: item.summary, isDouble: false });
              pIdx += 1;
            }
          }
        }
        regularShabbats.forEach((sh, s) => {
          schedule.set(sh.dateKey, s < portions.length ? portions[s] : { title: "Haazinu", numbers: [53], numberDisplay: "53", ref: PARASHOT_CANONICAL[52].ref, haftara: PARASHOT_CANONICAL[52].haftara, brit: PARASHOT_CANONICAL[52].brit, book: "Deuteronomio", summary: PARASHOT_CANONICAL[52].summary });
        });
      }
      cachedSchedule = schedule;
      return schedule;
    }

    function getParashaForDate(date) {
      return buildCompleteParashotSchedule().get(toDateKey(date)) || null;
    }

    const now = new Date();
    const today = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
    let initialYear = allYearsData[0].year;
    for (let i = 0; i < allYearsData.length; i++) {
      const nextY = allYearsData[i + 1];
      if (!nextY || today < new Date(nextY.roshHashana)) { initialYear = allYearsData[i].year; break; }
    }
    let currentYear = initialYear;
    function findMonth(yData, tUTC) {
      for (let i = 0; i < yData.months.length; i++) {
        const m = yData.months[i];
        const s = new Date(m.roshJodes), e = new Date(m.next);
        const start = new Date(Date.UTC(s.getUTCFullYear(), s.getUTCMonth(), s.getUTCDate()));
        const end = new Date(Date.UTC(e.getUTCFullYear(), e.getUTCMonth(), e.getUTCDate()));
        if (tUTC >= start && tUTC < end) return i;
      }
      return 0;
    }
    const initialMonthIndex = findMonth(generateLunisolarYear(currentYear), today);
    let baseLunisolarMonthIndex = initialMonthIndex;
    let currentMonthOffset = 0;

    const gridEl = document.getElementById("calendar-grid");
    const titleEl = document.getElementById("calendar-title");
    const subtitleEl = document.getElementById("calendar-subtitle");
    const yearSelectEl = document.getElementById("year-select");
    const monthSelectEl = document.getElementById("month-select");

    function populateYearSelect() {
      yearSelectEl.innerHTML = "";
      allYearsData.forEach(y => {
        const opt = document.createElement("option");
        opt.value = y.year; opt.textContent = y.year;
        if (y.year === currentYear) opt.selected = true;
        yearSelectEl.appendChild(opt);
      });
    }
    function populateMonthSelect(year, selIdx) {
      const yData = generateLunisolarYear(year);
      monthSelectEl.innerHTML = "";
      yData.months.forEach((m, idx) => {
        const opt = document.createElement("option");
        opt.value = idx; opt.textContent = m.name;
        if (idx === selIdx) opt.selected = true;
        monthSelectEl.appendChild(opt);
      });
    }
    populateYearSelect();
    populateMonthSelect(currentYear, baseLunisolarMonthIndex);

    yearSelectEl.addEventListener("change", e => {
      currentYear = parseInt(e.target.value, 10);
      baseLunisolarMonthIndex = 0; currentMonthOffset = 0;
      populateMonthSelect(currentYear, 0); renderCalendar();
    });
    monthSelectEl.addEventListener("change", e => {
      baseLunisolarMonthIndex = parseInt(e.target.value, 10);
      currentMonthOffset = 0; renderCalendar();
    });
    document.getElementById("btn-go-today").addEventListener("click", () => {
      currentYear = initialYear; baseLunisolarMonthIndex = initialMonthIndex; currentMonthOffset = 0;
      populateYearSelect(); populateMonthSelect(currentYear, baseLunisolarMonthIndex); renderCalendar();
    });
    document.getElementById("side-prev").addEventListener("click", () => { currentMonthOffset--; renderCalendar(); });
    document.getElementById("side-next").addEventListener("click", () => { currentMonthOffset++; renderCalendar(); });

    function formatLatam(date) {
      const d = new Date(date);
      return String(d.getUTCDate()).padStart(2, "0") + "/" + String(d.getUTCMonth() + 1).padStart(2, "0") + "/" + d.getUTCFullYear();
    }
    function getMoonIcon(illum) {
      const v = Number(illum);
      if (v === 0) return "🌑";
      if (v <= 24) return "🌒";
      if (v <= 49) return "🌓";
      if (v <= 74) return "🌔";
      if (v <= 100) return "🌕";
      return "🌘";
    }
    function isSameDay(d1, d2) {
      return d1 && d2 && d1.getUTCFullYear() === d2.getUTCFullYear() && d1.getUTCMonth() === d2.getUTCMonth() && d1.getUTCDate() === d2.getUTCDate();
    }
    function getHolidaysForYear(year) {
      const abibMonth = getLunisolarMonthView(year, 0, 0).month;
      const month7 = getLunisolarMonthView(year, 0, 6).month;
      const pesajDate = new Date(abibMonth.days[14]);
      const hamatzoDate = new Date(abibMonth.days[15]);
      let bikurimDate = null;
      for (let i = 1; i <= 7; i++) {
        const d = new Date(pesajDate); d.setUTCDate(d.getUTCDate() + i);
        if (d.getUTCDay() === 0) { bikurimDate = d; break; }
      }
      const shavuotDate = bikurimDate ? new Date(Date.UTC(bikurimDate.getUTCFullYear(), bikurimDate.getUTCMonth(), bikurimDate.getUTCDate() + 49)) : null;
      const yomTeruahDate = new Date(month7.days[0]);
      const yomKippurDate = new Date(month7.days[10]);
      const sukkotDate = new Date(month7.days[15]);
      const sheminiAtzeretDate = new Date(sukkotDate); sheminiAtzeretDate.setUTCDate(sheminiAtzeretDate.getUTCDate() + 7);
      return { pesajDate, hamatzoDate, bikurimDate, shavuotDate, yomTeruahDate, yomKippurDate, sukkotDate, sheminiAtzeretDate };
    }

    function showModal(html) {
      let ov = document.getElementById("cal-offline-modal-overlay");
      if (!ov) {
        ov = document.createElement("div");
        ov.id = "cal-offline-modal-overlay";
        ov.className = "cal-modal-overlay";
        ov.innerHTML = '<div class="cal-modal-card"><button type="button" class="cal-modal-close" onclick="document.getElementById(\\'cal-offline-modal-overlay\\').classList.remove(\\'active\\')">✕</button><div id="cal-modal-body"></div></div>';
        ov.addEventListener("click", e => { if (e.target === ov) ov.classList.remove("active"); });
        document.body.appendChild(ov);
      }
      document.getElementById("cal-modal-body").innerHTML = html;
      ov.classList.add("active");
    }

    function renderCalendar() {
      const { yearData, month, monthIndex } = getLunisolarMonthView(currentYear, baseLunisolarMonthIndex, currentMonthOffset);
      titleEl.textContent = month.name;
      currentYear = yearData.year;
      yearSelectEl.value = yearData.year;
      populateMonthSelect(yearData.year, monthIndex);
      const firstDay = month.days[0], lastDay = month.days[month.days.length - 1];
      subtitleEl.innerHTML = '<div class="subtitle-dates">Rosh Hashaná: ' + formatLatam(yearData.roshHashana) + ' | Mes: ' + formatLatam(firstDay) + ' a ' + formatLatam(lastDay) + '</div>';
      gridEl.innerHTML = "";
      for (let i = 0; i < firstDay.getUTCDay(); i++) {
        const empty = document.createElement("div"); empty.className = "calendar-cell empty"; gridEl.appendChild(empty);
      }
      const { pesajDate, hamatzoDate, bikurimDate, shavuotDate, yomTeruahDate, yomKippurDate, sukkotDate, sheminiAtzeretDate } = getHolidaysForYear(yearData.year);
      month.days.forEach((gregDate, index) => {
        const cell = document.createElement("div"); cell.className = "calendar-cell";
        const dayHolidays = [];
        if (isSameDay(gregDate, today)) {
          cell.classList.add("today");
          const b = document.createElement("div"); b.className = "today-badge"; b.textContent = "HOY"; cell.appendChild(b);
        }
        const moonInfo = getMoonPhaseInfo(gregDate);
        const isRoshJodesh = (index === 0);
        const isRoshHashana = (isRoshJodesh && month.index === 0);
        let lunisolarDay = isRoshJodesh ? "" : index;
        if (isRoshHashana || isRoshJodesh) {
          cell.classList.add(isRoshHashana ? "roshhashana" : "roshjodesh");
          const l = document.createElement("div"); l.className = isRoshHashana ? "roshhashana-label" : "rosh-label";
          l.textContent = isRoshHashana ? "Rosh Hashaná" : "Rosh Jodesh"; cell.appendChild(l);
          if (isRoshHashana) dayHolidays.push(HOLIDAYS_CANONICAL.roshHashana);
          dayHolidays.push(HOLIDAYS_CANONICAL.roshJodesh);
        }
        const lEl = document.createElement("div"); lEl.className = "lunisolar-day"; lEl.textContent = lunisolarDay;
        const gEl = document.createElement("div"); gEl.className = "gregorian-day"; gEl.textContent = gregDate.getUTCDate();
        cell.appendChild(lEl); cell.appendChild(gEl);
        if (!isRoshJodesh) {
          const mC = document.createElement("div"); mC.className = "moon-info";
          mC.innerHTML = '<span class="moon-text">' + moonInfo.illumination + '%</span><div class="moon-icon">' + getMoonIcon(moonInfo.illumination) + '</div>';
          cell.appendChild(mC);
        }
        const msPerDay = 86400000;
        const hamatzoDiff = Math.round((gregDate - hamatzoDate) / msPerDay);
        const sukkotDiff = Math.round((gregDate - sukkotDate) / msPerDay);
        if (month.index === 0 && isSameDay(gregDate, pesajDate)) { cell.classList.add("pesaj"); cell.insertAdjacentHTML("beforeend", '<div class="holiday-label pesaj-label">Pesaj</div>'); dayHolidays.push(HOLIDAYS_CANONICAL.pesaj); }
        if (month.index === 0 && hamatzoDiff >= 0 && hamatzoDiff < 7) { cell.classList.add("hamatzo"); if (hamatzoDiff === 0) cell.insertAdjacentHTML("beforeend", '<div class="holiday-label hamatzo-label">Hamatzo</div>'); dayHolidays.push(HOLIDAYS_CANONICAL.hamatzo); }
        if (month.index === 0 && isSameDay(gregDate, bikurimDate)) { cell.classList.add("bikurim"); cell.insertAdjacentHTML("beforeend", '<div class="holiday-label bikurim-label">Bikurim</div>'); dayHolidays.push(HOLIDAYS_CANONICAL.bikurim); }
        if (month.index === 6 && isSameDay(gregDate, yomTeruahDate)) { cell.classList.add("yomteruah"); cell.insertAdjacentHTML("beforeend", '<div class="holiday-label yomteruah-label">Yom Teruah</div>'); dayHolidays.push(HOLIDAYS_CANONICAL.yomTeruah); }
        if (month.index === 6 && isSameDay(gregDate, yomKippurDate)) { cell.classList.add("yomkippur"); cell.insertAdjacentHTML("beforeend", '<div class="holiday-label yomkippur-label">Yom Kippur</div>'); dayHolidays.push(HOLIDAYS_CANONICAL.yomKippur); }
        if (month.index === 6 && sukkotDiff >= 0 && sukkotDiff < 7) { cell.classList.add("sukkot"); if (sukkotDiff === 0) cell.insertAdjacentHTML("beforeend", '<div class="holiday-label sukkot-label">Sukkot</div>'); dayHolidays.push(HOLIDAYS_CANONICAL.sukkot); }
        if (month.index === 6 && isSameDay(gregDate, sheminiAtzeretDate)) { cell.classList.add("sheminiatzeret"); cell.insertAdjacentHTML("beforeend", '<div class="holiday-label shemini-label">Shemini Atzeret</div>'); dayHolidays.push(HOLIDAYS_CANONICAL.sheminiAtzeret); }
        if (month.index === 2 && isSameDay(gregDate, shavuotDate)) { cell.classList.add("shavuot"); cell.insertAdjacentHTML("beforeend", '<div class="holiday-label shavuot-label">Shavuot</div>'); dayHolidays.push(HOLIDAYS_CANONICAL.shavuot); }
        let omerDay = null;
        if (bikurimDate && shavuotDate && !isRoshJodesh) {
          const diffDays = Math.floor((Date.UTC(gregDate.getUTCFullYear(), gregDate.getUTCMonth(), gregDate.getUTCDate()) - Date.UTC(bikurimDate.getUTCFullYear(), bikurimDate.getUTCMonth(), bikurimDate.getUTCDate())) / msPerDay);
          if (diffDays >= 0 && diffDays < 49) {
            omerDay = diffDays + 1;
            const oTag = document.createElement("div"); oTag.className = "omer-row"; oTag.textContent = "Omer " + omerDay;
            cell.appendChild(oTag);
          }
        }
        const pInfo = getParashaForDate(gregDate);
        if (gregDate.getUTCDay() === 6) {
          cell.classList.add("shabat-cell");
          if (pInfo) {
            const pB = document.createElement("div");
            pB.className = "shabat-parasha-badge" + (pInfo.isDouble ? " double" : "") + (pInfo.isFestival ? " festival" : "");
            pB.innerHTML = '<div class="parasha-badge-top"><span class="parasha-badge-ico">📖</span><span class="parasha-badge-title">' + pInfo.title + '</span></div>' + (pInfo.ref ? '<div class="parasha-badge-ref">' + pInfo.ref + '</div>' : '');
            cell.appendChild(pB);
          }
        }
        cell.addEventListener("click", () => {
          const lTitle = isRoshHashana ? "Rosh Hashaná • " + month.name : isRoshJodesh ? "Rosh Jódesh • " + month.name : "Día " + lunisolarDay + " de " + month.name + " (" + yearData.year + ")";
          let hHtml = dayHolidays.map(h => '<div class="cal-detail-section holiday-box"><span class="cal-pill gold">🎺 Festividad de YHWH</span><h4 class="cal-detail-heading">' + h.title + '</h4><p class="cal-detail-text">' + h.summary + '</p><div class="cal-scripture-grid"><div class="cal-scripture-item"><strong>📖 Torá:</strong> ' + h.torahRef + '</div><div class="cal-scripture-item"><strong>📜 Profetas:</strong> ' + h.prophetsRef + '</div></div></div>').join("");
          let oHtml = omerDay ? '<div class="cal-detail-section omer-box"><span class="cal-pill amber">🌾 Cuenta del Omer</span><h4 class="cal-detail-heading">Día ' + omerDay + ' de 49 hacia Shavuot</h4></div>' : "";
          let pHtml = pInfo ? '<div class="cal-detail-section parasha-box"><span class="cal-pill cyan">📖 Parashá de Shabat</span><h4 class="cal-detail-heading">Parashá ' + pInfo.title + '</h4>' + (pInfo.summary ? '<p class="cal-detail-text">' + pInfo.summary + '</p>' : '') + '<div class="cal-scripture-grid"><div class="cal-scripture-item"><strong>📖 Torá:</strong> ' + pInfo.ref + '</div>' + (pInfo.haftara ? '<div class="cal-scripture-item"><strong>📜 Haftará:</strong> ' + pInfo.haftara + '</div>' : '') + (pInfo.brit ? '<div class="cal-scripture-item"><strong>✨ Brit Jadashá:</strong> ' + pInfo.brit + '</div>' : '') + '</div></div>' : "";
          showModal('<div class="cal-modal-header"><h3 class="cal-modal-main-title">' + lTitle + '</h3><p class="cal-modal-gregorian">📅 Fecha Gregoriana: ' + formatLatam(gregDate) + ' • Luminosidad Lunar: ' + moonInfo.illumination + '% ' + getMoonIcon(moonInfo.illumination) + '</p></div>' + hHtml + oHtml + pHtml);
        });
        gridEl.appendChild(cell);
      });
    }
    renderCalendar();
    document.getElementById("theme-toggle").addEventListener("click", () => {
      const cur = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", cur);
      document.body.classList.toggle("dark", cur === "dark");
    });
  <\/script>
</body>
</html>`;

    const blob = new Blob([standaloneHtml], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "Calendario_Lunisolar_YHWH_Offline.html";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  } catch (err) {
    console.error("Error empaquetando HTML autónomo:", err);
  } finally {
    if (btn) {
      btn.innerHTML = prevText;
      btn.disabled = false;
    }
  }
}

function createDownloadBar() {
  const container = document.querySelector('.calendar-container');
  if (!container) return;
  const bar = document.createElement('div');
  bar.className = 'download-bar';
  bar.innerHTML = `
    ${!isStandalonePWA ? `
      <a href="/" class="download-btn" title="Volver a la página principal" style="text-decoration: none;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
        <span>Inicio</span>
      </a>
    ` : ""}
    <button id="btn-go-today" class="download-btn" title="Ir al mes lunisolar de hoy">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
        <circle cx="12" cy="15" r="2"/>
      </svg>
      <span>Hoy</span>
    </button>
    <div id="offline-status-pill" class="offline-status-pill mode-sync" role="status" title="Estado de funcionamiento sin internet">
      <span class="status-dot"></span>
      <span>Disponible Offline</span>
    </div>
    <div style="flex-grow: 1;"></div>
    <button id="btn-install-pwa" class="download-btn install-pwa-btn" title="Instalar Calendario en tu dispositivo para usar sin internet">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
        <line x1="12" y1="18" x2="12.01" y2="18"/>
        <path d="M12 7v6"/>
        <path d="M9.5 10.5 12 13l2.5-2.5"/>
      </svg>
      <span>Instalar App (Sin Internet)</span>
    </button>
    <button id="btn-download-png" class="download-btn" title="Descargar como imagen PNG">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
        <circle cx="8.5" cy="8.5" r="1.5"/>
        <polyline points="21 15 16 10 5 21"/>
      </svg>
      <span>PNG</span>
    </button>
    <button id="btn-download-pdf" class="download-btn" title="Descargar como PDF">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="12" y1="18" x2="12" y2="12"/>
        <polyline points="8 15 12 18 16 15"/>
      </svg>
      <span>PDF</span>
    </button>
  `;

  const wrapper = container.querySelector('.calendar-wrapper');
  if (wrapper) {
    container.insertBefore(bar, wrapper);
  } else {
    container.appendChild(bar);
  }

  const todayBtn = document.getElementById('btn-go-today');
  const installBtn = document.getElementById('btn-install-pwa');
  const pngBtn = document.getElementById('btn-download-png');
  const pdfBtn = document.getElementById('btn-download-pdf');
  const statusPill = document.getElementById('offline-status-pill');

  if (todayBtn) todayBtn.addEventListener('click', goToToday);
  if (installBtn) installBtn.addEventListener('click', handleInstallButtonClick);
  if (statusPill) {
    statusPill.style.cursor = 'pointer';
    statusPill.addEventListener('click', openInstallModal);
  }
  if (pngBtn) pngBtn.addEventListener('click', downloadPNG);
  if (pdfBtn) pdfBtn.addEventListener('click', downloadPDF);

  updateOfflineStatusBadge();
}

createDownloadBar();
registerCalendarServiceWorker();
