const { chromium } = require('playwright-core');
const path = require('node:path');
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

(async () => {
  const browser = await chromium.launch({ executablePath: EDGE, headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 950 }, deviceScaleFactor: 1 });
  for (let attempt = 0; attempt < 4; attempt += 1) {
    await page.goto(`http://127.0.0.1:5188/?v=final-${attempt}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(900);
    const status = await page.locator('#liveText').innerText();
    if (status === 'LIVE') break;
    await page.waitForTimeout(1200);
  }
  await page.locator('#toast').evaluate((element) => element.classList.remove('show'));
  await page.screenshot({ path: path.resolve('..', 'shots', 'hero.png'), fullPage: false });

  await page.locator('.calc-section').scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await page.locator('#toast').evaluate((element) => element.classList.remove('show'));
  await page.locator('.calc-section').screenshot({ path: path.resolve('..', 'shots', 'calc.png') });

  await page.locator('#addHoldingBtn').click();
  await page.locator('#holdingName').fill('曼谷金饰');
  await page.locator('#holdingMarket').selectOption('TH');
  await page.locator('#holdingPurity').selectOption('0.965');
  await page.locator('#holdingAssetType').selectOption('jewelry');
  await page.locator('#holdingWeight').fill('1');
  await page.locator('#holdingUnit').selectOption('baht');
  await page.locator('#holdingCost').fill('65000');
  await page.locator('#saveHoldingBtn').click();
  await page.waitForTimeout(500);
  await page.locator('#toast').evaluate((element) => element.classList.remove('show'));
  await page.locator('#portfolio').scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await page.locator('#portfolio').screenshot({ path: path.resolve('..', 'shots', 'portfolio.png') });
  console.log('status', await page.locator('#liveText').innerText());
  await browser.close();
})();
