import { chromium } from 'playwright-core';

const edge = process.env.EDGE ?? 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const base = process.env.BASE_URL ?? 'http://localhost:3000';
const out = process.env.OUT ?? 'docs/screenshots';
const browser = await chromium.launch({ executablePath: edge, headless: true });

for (const locale of ['zh', 'en', 'th', 'ar']) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1100 }, deviceScaleFactor: 1 });
  await context.addCookies([{ name: 'gl_locale', value: locale, domain: 'localhost', path: '/' }]);
  const page = await context.newPage();
  await page.goto(`${base}/`, { waitUntil: 'networkidle' });
  const check = await page.evaluate(() => {
    const content = document.querySelector('.content')?.innerText ?? '';
    const cjk = (content.match(/[\u4e00-\u9fff]/g) ?? []).length;
    const sidebar = document.querySelector('.sidebar')?.getBoundingClientRect();
    return {
      lang: document.documentElement.lang,
      dir: document.documentElement.dir,
      cjk,
      sidebarRight: sidebar ? Math.round(sidebar.right) : null,
      width: window.innerWidth,
      title: document.querySelector('h1')?.textContent ?? ''
    };
  });
  console.log(locale, JSON.stringify(check));
  await page.screenshot({ path: `${out}/v21-${locale}.png` });
  await context.close();
}

const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
await mobile.addCookies([{ name: 'gl_locale', value: 'ar', domain: 'localhost', path: '/' }]);
const mobilePage = await mobile.newPage();
await mobilePage.goto(`${base}/`, { waitUntil: 'networkidle' });
console.log('ar-mobile', await mobilePage.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, width: innerWidth, dir: document.documentElement.dir })));
await mobilePage.screenshot({ path: `${out}/v21-ar-mobile.png` });
await mobile.close();
await browser.close();
