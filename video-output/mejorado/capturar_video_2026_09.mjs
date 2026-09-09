import puppeteer from 'puppeteer-core';
import fs from 'node:fs/promises';
import path from 'node:path';

const root = 'C:\\xampp\\htdocs\\HablemosdeYHWH-2026\\video-output\\mejorado\\capturas-2026-09';
await fs.mkdir(root, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  headless: true,
  args: ['--disable-gpu', '--no-first-run', '--hide-scrollbars'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });

async function capture(name, url, selector = null, offset = 82) {
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
  await page.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; });
  if (selector) {
    await page.evaluate(({ selector, offset }) => {
      const element = document.querySelector(selector);
      if (element) window.scrollTo(0, Math.max(0, element.getBoundingClientRect().top + window.scrollY - offset));
    }, { selector, offset });
  }
  await new Promise(resolve => setTimeout(resolve, 1300));
  await page.screenshot({ path: path.join(root, `${name}.png`), type: 'png' });
  console.log(name, page.url());
}

await capture('01_portada_fusion', 'https://www.hablemosdeyhwh.com/', '#hero');
await capture('02_quienes_somos_redil', 'https://www.hablemosdeyhwh.com/', '#about', 82);
await capture('03_torah_viviente', 'https://www.hablemosdeyhwh.com/', '#torah-viviente');
await capture('04_calendario', 'https://www.hablemosdeyhwh.com/calendar');
await capture('05_aliyot_superior', 'https://www.hablemosdeyhwh.com/aliyot');
await page.evaluate(() => window.scrollTo(0, 720));
await new Promise(resolve => setTimeout(resolve, 900));
await page.screenshot({ path: path.join(root, '06_aliyot_textos.png'), type: 'png' });
await capture('07_parashot', 'https://www.hablemosdeyhwh.com/parashot');
await capture('08_ensenanzas', 'https://www.hablemosdeyhwh.com/ensenanzas');
await capture('09_semillas', 'https://www.hablemosdeyhwh.com/semillas-de-torah');
await capture('10_blog', 'https://www.hablemosdeyhwh.com/', '#blog');
await capture('11_identidad', 'https://www.hablemosdeyhwh.com/', '#section-identidad');
await capture('12_contacto', 'https://www.hablemosdeyhwh.com/', '#contact');

await browser.close();
