// js/main.js

import { generateLunisolarYear, getLunisolarMonthView } from "./calendarEngine.js";
import { getMoonPhaseInfo } from "./moonPhase.js";
import { lunisolar2025 } from "./data/year2025.js";
import { lunisolar2026 } from "./data/year2026.js";
import { lunisolar2027 } from "./data/year2027.js";

// ------------------------------------------------------------
// 1. Fecha actual en UTC puro
// ------------------------------------------------------------

const now = new Date();
const today = new Date(Date.UTC(
  now.getUTCFullYear(),
  now.getUTCMonth(),
  now.getUTCDate()
));

// ------------------------------------------------------------
// 2. Determinar año lunisolar actual
// ------------------------------------------------------------

let currentYear;

if (today < new Date(lunisolar2026.roshHashana)) {
  currentYear = 2025;
} else if (today < new Date(lunisolar2027.roshHashana)) {
  currentYear = 2026;
} else {
  currentYear = 2027;
}

const yearData = generateLunisolarYear(currentYear);

// ------------------------------------------------------------
// 3. Encontrar el mes lunisolar actual según dataset
// ------------------------------------------------------------

function findCurrentLunisolarMonth(yearData, todayUTC) {
  for (let i = 0; i < yearData.months.length; i++) {
    const m = yearData.months[i];
    const start = new Date(m.roshJodes);
    const end = new Date(m.next);

    if (todayUTC >= start && todayUTC < end) {
      return i;
    }
  }
  return 0;
}

let baseLunisolarMonthIndex = findCurrentLunisolarMonth(yearData, today);
let currentMonthOffset = 0;

// ------------------------------------------------------------
// 4. Elementos del DOM
// ------------------------------------------------------------

const gridEl = document.getElementById("calendar-grid");
const titleEl = document.getElementById("calendar-title");
const subtitleEl = document.getElementById("calendar-subtitle");
const sliderEl = document.getElementById("month-slider");
const sliderLabelEl = document.getElementById("slider-label");
const sidePrev = document.getElementById("side-prev");
const sideNext = document.getElementById("side-next");

// ------------------------------------------------------------
// 5. Formateador LATAM dd/mm/yyyy
// ------------------------------------------------------------

function formatLatam(date) {
  const d = new Date(date);
  const day = String(d.getUTCDate()).padStart(2, "0");
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const year = d.getUTCFullYear();
  return `${day}/${month}/${year}`;
}

// ------------------------------------------------------------
// 6. Icono de luna según iluminación
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

// ------------------------------------------------------------
// 6.2 Lógica Global de Festividades (Año)
// ------------------------------------------------------------

function getHolidaysForYear(year) {
  const { month: abibMonth } = getLunisolarMonthView(year, 0, 0);
  const { month: month7 } = getLunisolarMonthView(year, 0, 6); // Mes 7 (índice 6)

  // Rosh Jodesh Abib
  let rjAbibIdx = 0;
  let minIllumAbib = 100;
  abibMonth.days.forEach((d, idx) => {
    const illum = getMoonPhaseInfo(d).illumination;
    const val = typeof illum === "string" ? parseFloat(illum) : illum;
    if (val < minIllumAbib) {
      minIllumAbib = val;
      rjAbibIdx = idx;
    }
  });

  // Rosh Jodesh Mes 7
  let rj7Idx = 0;
  let minIllum7 = 100;
  month7.days.forEach((d, idx) => {
    const illum = getMoonPhaseInfo(d).illumination;
    const val = typeof illum === "string" ? parseFloat(illum) : illum;
    if (val < minIllum7) {
      minIllum7 = val;
      rj7Idx = idx;
    }
  });

  const pesajDate = new Date(abibMonth.days[rjAbibIdx + 13]);
  const hamatzoDate = new Date(abibMonth.days[rjAbibIdx + 14]);

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

  // Festividades Mes 7
  const yomTeruahDate = new Date(month7.days[rj7Idx]);
  const yomKippurDate = new Date(month7.days[rj7Idx + 9]);
  const sukkotDate = new Date(month7.days[rj7Idx + 14]);

  // Shemini Atzeret is the 8th day (7 days after Sukkot starts)
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
  const { yearData, month } = getLunisolarMonthView(
    currentYear,
    baseLunisolarMonthIndex,
    currentMonthOffset
  );

  // Título
  titleEl.textContent = `${month.name}`;

  const firstDay = month.days[0];
  const lastDay = month.days[month.days.length - 1];

  // Subtítulo
  subtitleEl.textContent =
    `Rosh Hashaná: ${formatLatam(yearData.roshHashana)} | ` +
    `Mes: ${formatLatam(firstDay)} a ${formatLatam(lastDay)}`;

  // Limpiar grilla
  gridEl.innerHTML = "";

  // Día de la semana del primer día
  const firstWeekday = firstDay.getUTCDay();

  // Celdas vacías
  for (let i = 0; i < firstWeekday; i++) {
    const cell = document.createElement("div");
    cell.className = "calendar-cell empty";
    gridEl.appendChild(cell);
  }

  // ------------------------------------------------------------
  // 8. Encontrar la PRIMER luna nueva del mes
  // ------------------------------------------------------------

  let firstRoshIndex = 0;
  let minIllum = 100;

  const monthMoonData = month.days.map(d => getMoonPhaseInfo(d));

  monthMoonData.forEach((mi, idx) => {
    const illum = typeof mi.illumination === "string"
      ? parseFloat(mi.illumination)
      : mi.illumination;

    if (illum < minIllum) {
      minIllum = illum;
      firstRoshIndex = idx;
    }
  });

  // ------------------------------------------------------------
  // 9. Identificar Festividades Globales del Año
  // ------------------------------------------------------------

  const {
    pesajDate, hamatzoDate, bikurimDate, shavuotDate,
    yomTeruahDate, yomKippurDate, sukkotDate, sheminiAtzeretDate
  } = getHolidaysForYear(yearData.year);

  // ------------------------------------------------------------
  // 10. Render de días
  // ------------------------------------------------------------

  month.days.forEach((gregDate, index) => {
    const cell = document.createElement("div");
    cell.className = "calendar-cell";

    // Día actual
    if (
      gregDate.getUTCFullYear() === today.getUTCFullYear() &&
      gregDate.getUTCMonth() === today.getUTCMonth() &&
      gregDate.getUTCDate() === today.getUTCDate()
    ) {
      cell.classList.add("today");
    }

    const moonInfo = monthMoonData[index];

    // ------------------------------------------------------------
    // 9.1 Detección de Rosh Hashaná (PRIORIDAD MÁXIMA)
    // ------------------------------------------------------------

    const gYear = gregDate.getUTCFullYear();
    const gMonth = String(gregDate.getUTCMonth() + 1).padStart(2, "0");
    const gDay = String(gregDate.getUTCDate()).padStart(2, "0");
    const gregKey = `${gYear}-${gMonth}-${gDay}`;

    // Convertir el timestamp del dataset a YYYY-MM-DD
    const roshDate = new Date(yearData.roshHashana);
    const roshKey =
      `${roshDate.getUTCFullYear()}-` +
      `${String(roshDate.getUTCMonth() + 1).padStart(2, "0")}-` +
      `${String(roshDate.getUTCDate()).padStart(2, "0")}`;

    const isRoshHashana = (gregKey === roshKey);

    if (isRoshHashana) {
      cell.classList.add("roshhashana");

      const rhLabel = document.createElement("div");
      rhLabel.className = "roshhashana-label";
      rhLabel.textContent = "Rosh Hashaná";
      cell.appendChild(rhLabel);

      const lunisolarDayEl = document.createElement("div");
      lunisolarDayEl.className = "lunisolar-day";
      lunisolarDayEl.textContent = "1";

      const gregorianDayEl = document.createElement("div");
      gregorianDayEl.className = "gregorian-day";
      gregorianDayEl.textContent = gregDate.getUTCDate();

      cell.appendChild(lunisolarDayEl);
      cell.appendChild(gregorianDayEl);

      gridEl.appendChild(cell);
      return; // NO seguir procesando este día
    }

    // ------------------------------------------------------------
    // 9.2 Rosh Jodesh (solo si NO es Rosh Hashaná)
    // ------------------------------------------------------------

    const isRoshJodesh = (index === firstRoshIndex);

    let lunisolarDay;

    if (isRoshJodesh) {
      lunisolarDay = 1;
      cell.classList.add("roshjodesh");

      const label = document.createElement("div");
      label.className = "rosh-label";
      label.textContent = "Rosh Jodesh";
      cell.appendChild(label);

    } else {
      lunisolarDay = index - firstRoshIndex + 1;
      if (lunisolarDay < 1) lunisolarDay = 1;
    }

    // Día lunisolar
    const lunisolarDayEl = document.createElement("div");
    lunisolarDayEl.className = "lunisolar-day";
    lunisolarDayEl.textContent = lunisolarDay;

    // Día gregoriano
    const gregorianDayEl = document.createElement("div");
    gregorianDayEl.className = "gregorian-day";
    gregorianDayEl.textContent = gregDate.getUTCDate();

    // Fase lunar
    const moonContainer = document.createElement("div");
    moonContainer.className = "moon-info";

    const moonIcon = document.createElement("div");
    moonIcon.className = "moon-icon";
    moonIcon.textContent = getMoonIcon(moonInfo.illumination);

    const moonText = document.createElement("span");
    const illumText = typeof moonInfo.illumination === "string"
      ? moonInfo.illumination
      : `${moonInfo.illumination}%`;
    moonText.textContent = illumText;

    moonContainer.appendChild(moonIcon);
    moonContainer.appendChild(moonText);

    cell.appendChild(lunisolarDayEl);
    cell.appendChild(gregorianDayEl);
    cell.appendChild(moonContainer);

    // 9.3 Inyectar Etiquetas de Festividades

    // Cálculos de rango (diferencia en días)
    const msPerDay = 1000 * 60 * 60 * 24;
    const hamatzoDiff = Math.round((gregDate - hamatzoDate) / msPerDay);
    const sukkotDiff = Math.round((gregDate - sukkotDate) / msPerDay);

    // Pesaj
    if (isSameDay(gregDate, pesajDate)) {
      const label = document.createElement("div");
      label.className = "holiday-label pesaj-label";
      label.textContent = "Pesaj";
      cell.appendChild(label);
      cell.classList.add("pesaj");
    }

    // Hamatzo (7 días)
    if (hamatzoDiff >= 0 && hamatzoDiff < 7) {
      cell.classList.add("hamatzo");
      if (hamatzoDiff === 0) {
        const label = document.createElement("div");
        label.className = "holiday-label hamatzo-label";
        label.textContent = "Hamatzo";
        cell.appendChild(label);
      }
    }

    // Bikurim (puede coincidir con Hamatzo)
    if (isSameDay(gregDate, bikurimDate)) {
      const label = document.createElement("div");
      label.className = "holiday-label bikurim-label";
      label.textContent = "Bikurim";
      cell.appendChild(label);
      cell.classList.add("bikurim");
    }

    // Yom Teruah
    if (isSameDay(gregDate, yomTeruahDate)) {
      const label = document.createElement("div");
      label.className = "holiday-label yomteruah-label";
      label.textContent = "Yom Teruah";
      cell.appendChild(label);
      cell.classList.add("yomteruah");
    }

    // Yom Kippur
    if (isSameDay(gregDate, yomKippurDate)) {
      const label = document.createElement("div");
      label.className = "holiday-label yomkippur-label";
      label.textContent = "Yom Kippur";
      cell.appendChild(label);
      cell.classList.add("yomkippur");
    }

    // Sukkot (7 días)
    if (sukkotDiff >= 0 && sukkotDiff < 7) {
      cell.classList.add("sukkot");
      if (sukkotDiff === 0) {
        const label = document.createElement("div");
        label.className = "holiday-label sukkot-label";
        label.textContent = "Sukkot";
        cell.appendChild(label);
      }
    }

    // Shemini Atzeret
    if (isSameDay(gregDate, sheminiAtzeretDate)) {
      const label = document.createElement("div");
      label.className = "holiday-label shemini-label";
      label.textContent = "Shemini Atzeret";
      cell.appendChild(label);
      cell.classList.add("sheminiatzeret");
    }

    // Shavuot (Detección por fecha)
    if (isSameDay(gregDate, shavuotDate)) {
      const label = document.createElement("div");
      label.className = "holiday-label shavuot-label";
      label.textContent = "Shavuot";
      cell.appendChild(label);
      cell.classList.add("shavuot");
    }

    // --- Cuenta de los días a Shavuot (Omer) ---
    if (bikurimDate && shavuotDate) {
      // Normalizar fechas para comparación (solo año, mes, día)
      const d1 = Date.UTC(gregDate.getUTCFullYear(), gregDate.getUTCMonth(), gregDate.getUTCDate());
      const dB = Date.UTC(bikurimDate.getUTCFullYear(), bikurimDate.getUTCMonth(), bikurimDate.getUTCDate());

      const diffTime = d1 - dB;
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      // El día de Bikurim es el día 1. El usuario pidió no verlo el día 50.
      if (diffDays >= 0 && diffDays < 49) {
        const omerTag = document.createElement("div");
        omerTag.className = "omer-row";
        omerTag.textContent = `Omer ${diffDays + 1}`;
        // Insertar antes del contenedor de luna
        cell.insertBefore(omerTag, cell.querySelector('.moon-info'));
      }
    }

    gridEl.appendChild(cell);
  });
}

// ------------------------------------------------------------
// 10. Navegación
// ------------------------------------------------------------

function cambiarMes(delta) {
  currentMonthOffset += delta;
  if (sliderEl) sliderEl.value = currentMonthOffset;
  updateSliderLabel();
  renderCalendar();
}

sliderEl.addEventListener("input", () => {
  currentMonthOffset = parseInt(sliderEl.value, 10);
  updateSliderLabel();
  renderCalendar();
});

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

// ------------------------------------------------------------
// 11. Render inicial
// ------------------------------------------------------------

renderCalendar();

// ------------------------------------------------------------
// 12. Tema oscuro
// ------------------------------------------------------------

const themeToggle = document.getElementById("theme-toggle");

themeToggle.addEventListener("click", () => {
  const current = document.documentElement.getAttribute("data-theme");
  const next = current === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
});

// ------------------------------------------------------------
// 13. Boton oscuro
// ------------------------------------------------------------
const toggle = document.getElementById("theme-toggle");

toggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");

  const isDark = document.body.classList.contains("dark");
  localStorage.setItem("theme", isDark ? "dark" : "light");
});

// Cargar preferencia guardada
if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark");
}

// ------------------------------------------------------------
// 14. Navegación por meses (header)
// ------------------------------------------------------------
// 14. Navegación movida a los laterales
// ------------------------------------------------------------



// ------------------------------------------------------------
// 15. Navegación por meses (flechas laterales nuevas)
// ------------------------------------------------------------

function cambiarMesConTransicion(delta) {
  const grid = document.getElementById('calendar-grid');
  // Fade out
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





