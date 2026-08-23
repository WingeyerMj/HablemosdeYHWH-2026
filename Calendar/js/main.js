// js/main.js

import { generateLunisolarYear, getLunisolarMonthView } from "./calendarEngine.js";
import { getMoonPhaseInfo } from "./moonPhase.js";
import { lunisolar2025 } from "./data/year2025.js";
import { lunisolar2026 } from "./data/year2026.js";
import { lunisolar2027 } from "./data/year2027.js";
import { lunisolar2028 } from "./data/year2028.js";

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

let currentYear;

if (today < new Date(lunisolar2026.roshHashana)) {
  currentYear = 2025;
} else if (today < new Date(lunisolar2027.roshHashana)) {
  currentYear = 2026;
} else if (today < new Date(lunisolar2028.roshHashana)) {
  currentYear = 2027;
} else {
  currentYear = 2028;
}

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

  // En la estructura lunisolar, el índice 0 del mes es siempre Rosh Jodesh (declaración)
  const rjAbibIdx = 0;
  const rj7Idx = 0;

  // Festividades Mes 1 (Abib)
  // Día 14 = Pesaj, Día 15 = Hamatzo (inicio 7 días)
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
  // Día 1 = Yom Teruah (Rosh Jodesh Mes 7, index 0), Día 10 = Yom Kippur (index 10), Día 15 = Sukkot (index 15)
  const yomTeruahDate = new Date(month7.days[rj7Idx]); 
  const yomKippurDate = new Date(month7.days[rj7Idx + 10]);
  const sukkotDate = new Date(month7.days[rj7Idx + 15]);

  // Shemini Atzeret es el 8vo día desde el inicio de Sukkot (7 días después del Día 15 = Día 22)
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
  // 8. Fase lunar del mes
  // ------------------------------------------------------------
  const monthMoonData = month.days.map(d => getMoonPhaseInfo(d));

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

    // Día actual (HOY)
    if (
      gregDate.getUTCFullYear() === today.getUTCFullYear() &&
      gregDate.getUTCMonth() === today.getUTCMonth() &&
      gregDate.getUTCDate() === today.getUTCDate()
    ) {
      cell.classList.add("today");
      const todayBadge = document.createElement("div");
      todayBadge.className = "today-badge";
      todayBadge.textContent = "HOY";
      cell.appendChild(todayBadge);
    }

    const moonInfo = monthMoonData[index];

    // ------------------------------------------------------------
    // 9.1 Detección de Rosh Hashaná y Rosh Jodesh
    // ------------------------------------------------------------
    const isRoshJodesh = (index === 0);
    const isRoshHashana = (isRoshJodesh && month.index === 0);

    let lunisolarDay = "";

    if (isRoshHashana || isRoshJodesh) {
      cell.classList.add(isRoshHashana ? "roshhashana" : "roshjodesh");

      const label = document.createElement("div");
      label.className = isRoshHashana ? "roshhashana-label" : "rosh-label";
      label.textContent = isRoshHashana ? "Rosh Hashaná" : "Rosh Jodesh";
      cell.appendChild(label);

      lunisolarDay = ""; // No lleva número el día de declaración (Rosh Jodesh / Rosh Hashana)
    } else {
      // El conteo de días empieza al día siguiente de Rosh Jodesh (índice 1 = Día 1)
      lunisolarDay = index;
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

    // No mostrar fase lunar en la celda de Rosh Jodesh / Rosh Hashaná
    if (!isRoshJodesh && !isRoshHashana) {
      cell.appendChild(moonContainer);
    }

    // 9.3 Inyectar Etiquetas de Festividades

    // Cálculos de rango (diferencia en días)
    const msPerDay = 1000 * 60 * 60 * 24;
    const hamatzoDiff = Math.round((gregDate - hamatzoDate) / msPerDay);
    const sukkotDiff = Math.round((gregDate - sukkotDate) / msPerDay);

    // Pesaj (Mes 1 / Abib)
    if (month.index === 0 && isSameDay(gregDate, pesajDate)) {
      const label = document.createElement("div");
      label.className = "holiday-label pesaj-label";
      label.textContent = "Pesaj";
      cell.appendChild(label);
      cell.classList.add("pesaj");
    }

    // Hamatzo (7 días en Mes 1 / Abib)
    if (month.index === 0 && hamatzoDiff >= 0 && hamatzoDiff < 7) {
      cell.classList.add("hamatzo");
      if (hamatzoDiff === 0) {
        const label = document.createElement("div");
        label.className = "holiday-label hamatzo-label";
        label.textContent = "Hamatzo";
        cell.appendChild(label);
      }
    }

    // Bikurim (puede coincidir con Hamatzo en Mes 1)
    if (month.index === 0 && isSameDay(gregDate, bikurimDate)) {
      const label = document.createElement("div");
      label.className = "holiday-label bikurim-label";
      label.textContent = "Bikurim";
      cell.appendChild(label);
      cell.classList.add("bikurim");
    }

    // Yom Teruah (Mes 7, Día 1 / Rosh Jodesh)
    if (month.index === 6 && isSameDay(gregDate, yomTeruahDate)) {
      const label = document.createElement("div");
      label.className = "holiday-label yomteruah-label";
      label.textContent = "Yom Teruah";
      cell.appendChild(label);
      cell.classList.add("yomteruah");
    }

    // Yom Kippur (Mes 7)
    if (month.index === 6 && isSameDay(gregDate, yomKippurDate)) {
      const label = document.createElement("div");
      label.className = "holiday-label yomkippur-label";
      label.textContent = "Yom Kippur";
      cell.appendChild(label);
      cell.classList.add("yomkippur");
    }

    // Sukkot (7 días en Mes 7)
    if (month.index === 6 && sukkotDiff >= 0 && sukkotDiff < 7) {
      cell.classList.add("sukkot");
      if (sukkotDiff === 0) {
        const label = document.createElement("div");
        label.className = "holiday-label sukkot-label";
        label.textContent = "Sukkot";
        cell.appendChild(label);
      }
    }

    // Shemini Atzeret (Mes 7)
    if (month.index === 6 && isSameDay(gregDate, sheminiAtzeretDate)) {
      const label = document.createElement("div");
      label.className = "holiday-label shemini-label";
      label.textContent = "Shemini Atzeret";
      cell.appendChild(label);
      cell.classList.add("sheminiatzeret");
    }

    // Shavuot (Detección por fecha en Mes 3)
    if (month.index === 2 && isSameDay(gregDate, shavuotDate)) {
      const label = document.createElement("div");
      label.className = "holiday-label shavuot-label";
      label.textContent = "Shavuot";
      cell.appendChild(label);
      cell.classList.add("shavuot");
    }

    // --- Cuenta de los días a Shavuot (Omer) ---
    if (bikurimDate && shavuotDate && !isRoshJodesh && !isRoshHashana) {
      const d1 = Date.UTC(gregDate.getUTCFullYear(), gregDate.getUTCMonth(), gregDate.getUTCDate());
      const dB = Date.UTC(bikurimDate.getUTCFullYear(), bikurimDate.getUTCMonth(), bikurimDate.getUTCDate());

      const diffTime = d1 - dB;
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays >= 0 && diffDays < 49) {
        const omerTag = document.createElement("div");
        omerTag.className = "omer-row";
        omerTag.textContent = `Omer ${diffDays + 1}`;
        const moonEl = cell.querySelector('.moon-info');
        if (moonEl) {
          cell.insertBefore(omerTag, moonEl);
        } else {
          cell.appendChild(omerTag);
        }
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

// ------------------------------------------------------------
// 11. Render inicial
// ------------------------------------------------------------

renderCalendar();

// ------------------------------------------------------------
// 12. Tema oscuro
// ------------------------------------------------------------

const themeToggle = document.getElementById("theme-toggle");

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme");
    const next = current === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    document.body.classList.toggle("dark");

    const isDark = document.body.classList.contains("dark");
    localStorage.setItem("theme", isDark ? "dark" : "light");
  });
}

// Cargar preferencia guardada
if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark");
}

// ------------------------------------------------------------
// 15. Navegación por meses (flechas laterales)
// ------------------------------------------------------------

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

// ------------------------------------------------------------
// 16. Descarga como PNG / PDF
// ------------------------------------------------------------

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

  hideEls.forEach(el => el.style.visibility = '');

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
    alert('No se pudo generar la imagen. Intenta de nuevo.');
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
    alert('No se pudo generar el PDF. Intenta de nuevo.');
  } finally {
    btn.innerHTML = originalText;
    btn.disabled = false;
  }
}

function createDownloadBar() {
  const container = document.querySelector('.calendar-container');
  if (!container) return;
  const bar = document.createElement('div');
  bar.className = 'download-bar';
  bar.innerHTML = `
    <a href="/" class="download-btn" title="Volver a la página principal" style="text-decoration: none;">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
      <span>Inicio</span>
    </a>
    <div style="flex-grow: 1;"></div>
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

  const pngBtn = document.getElementById('btn-download-png');
  const pdfBtn = document.getElementById('btn-download-pdf');
  if (pngBtn) pngBtn.addEventListener('click', downloadPNG);
  if (pdfBtn) pdfBtn.addEventListener('click', downloadPDF);
}

createDownloadBar();
