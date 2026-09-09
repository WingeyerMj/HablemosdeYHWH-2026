import puppeteer from 'puppeteer-core';

const browser = await puppeteer.launch({
  executablePath: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  headless: true,
  args: ['--disable-gpu', '--no-first-run', '--hide-scrollbars'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
await page.goto('https://www.hablemosdeyhwh.com/', { waitUntil: 'networkidle2', timeout: 60000 });
await page.evaluate(() => {
  document.querySelector('#preloader')?.remove();
  document.querySelectorAll('[data-aos]').forEach(element => {
    element.classList.add('aos-animate');
    element.style.opacity = '1';
    element.style.transform = 'none';
  });
  window.scrollTo(0, 0);
});
await new Promise(resolve => setTimeout(resolve, 3000));
await page.screenshot({
  path: 'C:\\xampp\\htdocs\\HablemosdeYHWH-2026\\video-output\\mejorado\\capturas-2026-09\\01_portada_fusion.png',
  type: 'png',
});
console.log(await page.evaluate(() => ({
  hero: document.querySelector('#hero')?.innerText,
  background: getComputedStyle(document.querySelector('#hero')).backgroundImage,
})));
await browser.close();
