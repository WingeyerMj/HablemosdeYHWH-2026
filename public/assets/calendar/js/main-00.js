// js/main.js

import { generateLunisolarYear, getLunisolarMonthView } from "./calendarEngine.js";
import { getMoonPhaseInfo } from "./moonPhase.js";
import { lunisolar2025 } from "./data/year2025.js";
import { lunisolar2026 } from "./data/year2026.js";

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
} else {
  currentYear = 2026;
}

const yearData = generateLunisolarYear(currentYear);

// ------------------------------------------------------------
// 3. Encontrar el mes lunisolar actual
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
const prevBtn = document.getElementById("prev-month");
const nextBtn = document.getElementById("next-month");

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
// 6. Render del calendario
// ------------------------------------------------------------

function renderCalendar() {
  const { yearData, month } = getLunisolarMonthView(
    currentYear,
    baseLunisolarMonthIndex,
    currentMonthOffset
  );

  // Título
  titleEl.textContent = `${month.name} - Año ${yearData.year}`;

  const firstDay = month.days[0];
  const lastDay = month.days[month.days.length - 1];

  // Subtítulo en formato LATAM
  subtitleEl.textContent =
    `Rosh Hashaná: ${formatLatam(yearData.roshHashana)} | ` +
    `Mes: ${formatLatam(firstDay)} a ${formatLatam(lastDay)}`;

  // Limpiar grilla
  gridEl.innerHTML = "";

  // Día de la semana del primer día (0 = domingo)
  const firstWeekday = firstDay.getUTCDay();

  // Celdas vacías antes del primer día
  for (let i = 0; i < firstWeekday; i++) {
    const cell = document.createElement("div");
    cell.className = "calendar-cell empty";
    gridEl.appendChild(cell);
  }

  // Celdas de días reales
  month.days.forEach((gregDate, index) => {
    const cell = document.createElement("div");
    cell.className = "calendar-cell";

    // --- RESALTAR EL DÍA ACTUAL ---
    if (
      gregDate.getUTCFullYear() === today.getUTCFullYear() &&
      gregDate.getUTCMonth() === today.getUTCMonth() &&
      gregDate.getUTCDate() === today.getUTCDate()
    ) {
      cell.classList.add("today");
    }

    // --- DETECTAR LUNA NUEVA (0% = ROSH JODESH) ---
    const moonInfo = getMoonPhaseInfo(gregDate);
    const isRoshJodesh = moonInfo.illumination === 0;

    if (isRoshJodesh) {
      cell.classList.add("roshjodesh");

      const roshLabel = document.createElement("div");
      roshLabel.className = "rosh-label";
      roshLabel.textContent = "Rosh Jodesh";
      cell.appendChild(roshLabel);
    }
    // ----------------------------------------------

    // Día lunisolar
    const lunisolarDayEl = document.createElement("div");
    lunisolarDayEl.className = "lunisolar-day";
    lunisolarDayEl.textContent = index + 1;

    // Día gregoriano
    const gregorianDayEl = document.createElement("div");
    gregorianDayEl.className = "gregorian-day";
    gregorianDayEl.textContent = gregDate.getUTCDate();

    // Fase lunar
    const moonContainer = document.createElement("div");
    moonContainer.className = "moon-info";

    const moonIcon = document.createElement("div");
    moonIcon.className = "moon-icon";

    const moonText = document.createElement("span");
    moonText.textContent = `${moonInfo.illumination}%`;

    moonContainer.appendChild(moonIcon);
    moonContainer.appendChild(moonText);

    // Agregar elementos a la celda
    cell.appendChild(lunisolarDayEl);
    cell.appendChild(gregorianDayEl);
    cell.appendChild(moonContainer);

    gridEl.appendChild(cell);
  });
}

// ------------------------------------------------------------
// 7. Navegación (botones y slider)
// ------------------------------------------------------------

prevBtn.addEventListener("click", () => {
  currentMonthOffset--;
  sliderEl.value = currentMonthOffset;
  updateSliderLabel();
  renderCalendar();
});

nextBtn.addEventListener("click", () => {
  currentMonthOffset++;
  sliderEl.value = currentMonthOffset;
  updateSliderLabel();
  renderCalendar();
});

sliderEl.addEventListener("input", () => {
  currentMonthOffset = parseInt(sliderEl.value, 10);
  updateSliderLabel();
  renderCalendar();
});

function updateSliderLabel() {
  if (currentMonthOffset === 0) {
    sliderLabelEl.textContent = "Mes actual";
  } else if (currentMonthOffset < 0) {
    sliderLabelEl.textContent = `Mes ${currentMonthOffset} (anterior)`;
  } else {
    sliderLabelEl.textContent = `Mes +${currentMonthOffset} (posterior)`;
  }
}

// ------------------------------------------------------------
// 8. Render inicial
// ------------------------------------------------------------

renderCalendar();