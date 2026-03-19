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

  // REGLA GENERAL: El día de Rosh Jodesh (0% visibilidad) es la declaración.
  // El conteo de días comienza al día siguiente. 
  // Día 14 de la cuenta = rjIdx + 14 (porque rjIdx + 1 es el Día 1)
  const pesajDate = new Date(abibMonth.days[rjAbibIdx + 14]);
  const hamatzoDate = new Date(abibMonth.days[rjAbibIdx + 15]);

  let bikurimDate = null;
  for (let i = 1; i <= 7; i++) {
    const d = new Date(pesajDate);
    d.setUTCDate(d.getUTCDate() + i);
    if (d.getUTCDay() === 0) { // Domingo es el día de Bikurim
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
  // Día 1 de la cuenta = rj7Idx + 1
  const yomTeruahDate = new Date(month7.days[rj7Idx + 1]); 
  const yomKippurDate = new Date(month7.days[rj7Idx + 10]);
  const sukkotDate = new Date(month7.days[rj7Idx + 15]);

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
    const illum = typeof moonInfo.illumination === "string" ? parseFloat(moonInfo.illumination) : moonInfo.illumination;

    // Detectar si este día es UN Rosh Jodesh
    const prevDay = monthMoonData[index - 1];
    const prevIllum = prevDay ? (typeof prevDay.illumination === "string" ? parseFloat(prevDay.illumination) : prevDay.illumination) : 100;
    const nextDay = monthMoonData[index + 1];
    const nextIllum = nextDay ? (typeof nextDay.illumination === "string" ? parseFloat(nextDay.illumination) : nextDay.illumination) : 100;

    const isActuallyRoshJodesh = (illum <= prevIllum && illum <= nextIllum && illum < 2);


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

    if (isRoshHashana || (isActuallyRoshJodesh && index === firstRoshIndex)) {
      cell.classList.add(isRoshHashana ? "roshhashana" : "roshjodesh");

      const label = document.createElement("div");
      label.className = isRoshHashana ? "roshhashana-label" : "rosh-label";
      label.textContent = isRoshHashana ? "Rosh Hashaná" : "Rosh Jodesh";
      cell.appendChild(label);

      const lunisolarDayEl = document.createElement("div");
      lunisolarDayEl.className = "lunisolar-day";
      lunisolarDayEl.textContent = ""; // No lleva número el día 0%

      const gregorianDayEl = document.createElement("div");
      gregorianDayEl.className = "gregorian-day";
      gregorianDayEl.textContent = gregDate.getUTCDate();

      cell.appendChild(lunisolarDayEl);
      cell.appendChild(gregorianDayEl);
      
      const moonContainer = document.createElement("div");
      moonContainer.className = "moon-info";
      const moonIcon = document.createElement("div");
      moonIcon.className = "moon-icon";
      moonIcon.textContent = getMoonIcon(moonInfo.illumination);
      const moonText = document.createElement("span");
      moonText.textContent = `${illum}%`;
      moonContainer.appendChild(moonIcon);
      moonContainer.appendChild(moonText);
      cell.appendChild(moonContainer);

      gridEl.appendChild(cell);
      return; 
    }

    // ------------------------------------------------------------
    // 9.2 Rosh Jodesh (solo si NO es Rosh Hashaná)
    // ------------------------------------------------------------

    const isRoshJodesh = (index === firstRoshIndex);

    let lunisolarDay;

    if (isRoshJodesh) {
      lunisolarDay = ""; // El día del 0% es Rosh Jodesh (declaración), no lleva número
      cell.classList.add("roshjodesh");

      const label = document.createElement("div");
      label.className = "rosh-label";
      label.textContent = "Rosh Jodesh";
      cell.appendChild(label);

    } else {
      // El conteo comienza al día siguiente de Rosh Jodesh
      lunisolarDay = index - firstRoshIndex;
      
      if (lunisolarDay < 1) {
          lunisolarDay = ""; // Días previos a la declaración en el mismo mes gregoriano
      }
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

  // 10.1 Scrolear al día actual si existe en este mes
  setTimeout(() => {
    const todayCell = document.querySelector('.calendar-cell.today');
    if (todayCell) {
      todayCell.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, 300);
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

// ------------------------------------------------------------
// 16. Descarga como PNG / PDF
// ------------------------------------------------------------

// Cargar html2canvas dinámicamente desde CDN
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

/**
 * Captura el contenedor del calendario como un canvas.
 * Oculta temporalmente las flechas de navegación y los botones de descarga para la captura.
 * También quita temporalmente la imagen de fondo para evitar que el canvas quede "tainted".
 */
async function captureCalendar() {
  await loadScript(HTML2CANVAS_CDN);

  const container = document.querySelector('.calendar-container');
  const body = document.body;
  const section = document.querySelector('.section');

  // Guardar y quitar background-image para evitar tainted canvas
  const savedBodyBg = body.style.backgroundImage;
  const savedSectionBg = section ? section.style.backgroundImage : '';
  body.style.backgroundImage = 'none';
  if (section) section.style.backgroundImage = 'none';

  // Ocultar flechas de navegación, botones de descarga y el toggle de tema durante la captura
  const hideEls = container.querySelectorAll('.nav-arrow, .download-bar, .theme-toggle');
  hideEls.forEach(el => el.style.visibility = 'hidden');

  const bgColor = getComputedStyle(document.documentElement).getPropertyValue('--bg-global').trim() || '#060606';

  const canvas = await html2canvas(container, {
    backgroundColor: bgColor,
    scale: 2,
    useCORS: true,
    allowTaint: false,
    logging: false
  });

  // Restaurar elementos ocultos
  hideEls.forEach(el => el.style.visibility = '');

  // Restaurar background-image
  body.style.backgroundImage = savedBodyBg;
  if (section) section.style.backgroundImage = savedSectionBg;

  return canvas;
}

/**
 * Convierte un canvas a Blob y dispara la descarga con el nombre dado.
 */
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
      // Liberar el objeto URL después de un momento
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      resolve();
    }, 'image/png');
  });
}

/**
 * Descargar el calendario como imagen PNG
 */
async function downloadPNG() {
  const btn = document.getElementById('btn-download-png');
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
    alert('No se pudo generar la imagen. Intenta de nuevo.');
  } finally {
    btn.innerHTML = originalText;
    btn.disabled = false;
  }
}

/**
 * Descargar el calendario como archivo PDF
 */
async function downloadPDF() {
  const btn = document.getElementById('btn-download-pdf');
  const originalText = btn.innerHTML;
  btn.innerHTML = '⏳ Generando…';
  btn.disabled = true;

  try {
    await loadScript(JSPDF_CDN);
    const canvas = await captureCalendar();
    const imgData = canvas.toDataURL('image/png');

    const { jsPDF } = window.jspdf;
    // Landscape para que el calendario quepa mejor
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Calcular dimensiones manteniendo aspecto
    const imgRatio = canvas.width / canvas.height;
    let imgW = pageWidth - 20; // 10mm margen cada lado
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
    alert('No se pudo generar el PDF. Intenta de nuevo.');
  } finally {
    btn.innerHTML = originalText;
    btn.disabled = false;
  }
}

// Crear la barra de botones de descarga
function createDownloadBar() {
  const container = document.querySelector('.calendar-container');
  const bar = document.createElement('div');
  bar.className = 'download-bar';
  bar.innerHTML = `
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

  // Insertar después de la fila de días de la semana (antes del wrapper)
  const wrapper = container.querySelector('.calendar-wrapper');
  container.insertBefore(bar, wrapper);

  document.getElementById('btn-download-png').addEventListener('click', downloadPNG);
  document.getElementById('btn-download-pdf').addEventListener('click', downloadPDF);
}

createDownloadBar();
