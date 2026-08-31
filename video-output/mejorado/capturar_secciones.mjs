import puppeteer from 'puppeteer-core';
import fs from 'node:fs/promises';

const browser = await puppeteer.launch({
  executablePath: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  headless: true,
  args: ['--disable-gpu', '--no-first-run', '--hide-scrollbars'],
});

const page = await browser.newPage();
await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
await page.goto('https://www.hablemosdeyhwh.com/', { waitUntil: 'networkidle2', timeout: 60000 });
await page.evaluate(() => document.documentElement.style.scrollBehavior = 'auto');
await fs.mkdir(new URL('./secciones/', import.meta.url), { recursive: true });

const scenes = [
  ['01_inicio', '#hero'],
  ['02_quienes_somos', '#about'],
  ['03_torah_viviente', '#torah-viviente'],
  ['04_calendario', '#services'],
  ['05_parashot', '#portfolio'],
  ['06_ensenanzas', '#ensenanzas'],
  ['07_semillas', '#semillas-torah'],
  ['08_testimonios', '#testimonials'],
  ['09_comunidad', '#team'],
  ['10_novedades', '#blog'],
  ['11_contacto', '#contact'],
  ['12_footer', '#footer'],
];

const report = [];
for (const [name, selector] of scenes) {
  const exists = await page.$(selector);
  if (!exists) {
    report.push({ name, selector, captured: false });
    continue;
  }
  await page.evaluate((sel) => {
    const el = document.querySelector(sel);
    const top = el.getBoundingClientRect().top + window.scrollY - 85;
    window.scrollTo(0, Math.max(0, top));
  }, selector);
  await new Promise(resolve => setTimeout(resolve, 900));
  const path = new URL(`./secciones/${name}.png`, import.meta.url);
  await page.screenshot({ path: path.pathname.replace(/^\/(.:)/, '$1'), type: 'png' });
  const position = await page.evaluate(() => ({ y: window.scrollY, title: document.title }));
  report.push({ name, selector, captured: true, ...position });
}

await fs.writeFile(new URL('./capturas.json', import.meta.url), JSON.stringify(report, null, 2));
await browser.close();
console.log(JSON.stringify(report, null, 2));
