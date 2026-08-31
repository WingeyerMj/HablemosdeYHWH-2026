import puppeteer from 'puppeteer-core';

const browser = await puppeteer.launch({
  executablePath: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  headless: true,
  args: ['--disable-gpu', '--no-first-run', '--hide-scrollbars'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });

await page.goto('https://www.hablemosdeyhwh.com/aliyot', { waitUntil: 'networkidle2', timeout: 60000 });
await new Promise(resolve => setTimeout(resolve, 1200));
await page.screenshot({ path: 'C:\\xampp\\htdocs\\HablemosdeYHWH-2026\\video-output\\mejorado\\secciones\\05a_aliyot.png' });

await page.goto('https://www.hablemosdeyhwh.com/#section-identidad', { waitUntil: 'networkidle2', timeout: 60000 });
await page.evaluate(() => {
  const el = document.querySelector('#section-identidad');
  if (el) window.scrollTo(0, Math.max(0, el.getBoundingClientRect().top + window.scrollY - 85));
});
await new Promise(resolve => setTimeout(resolve, 1200));
await page.screenshot({ path: 'C:\\xampp\\htdocs\\HablemosdeYHWH-2026\\video-output\\mejorado\\secciones\\10a_identidad.png' });

await browser.close();
console.log('Aliyot e Identidad capturadas');
