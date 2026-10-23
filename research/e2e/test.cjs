const { chromium } = require('playwright-core');
const path = require('node:path');

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const BASE = 'http://127.0.0.1:5188/?v=e2e2';

(async () => {
  const browser = await chromium.launch({ executablePath: EDGE, headless: true });
  const errors = [];
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(`console: ${message.text()}`);
  });
  page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));

  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);

  const spot = (await page.locator('#spotPrice').innerText()).trim();
  const total = (await page.locator('#totalPrice').innerText()).trim();
  console.log('spot', spot, 'total', total);

  // Market switch: UAE
  await page.locator('#marketChips .chip[data-market="AE"]').click();
  await page.waitForTimeout(300);
  const aeTotal = (await page.locator('#totalPrice').innerText()).trim();
  const aeMaking = await page.locator('#makingPctLabel').innerText();
  const aeTax = await page.locator('#taxPctLabel').innerText();
  console.log('AE total', aeTotal, 'making', aeMaking, 'tax', aeTax);

  // India + purity 24K + 10g
  await page.locator('#marketChips .chip[data-market="IN"]').click();
  await page.locator('#purityChips .chip[data-purity="0.999"]').click();
  await page.locator('#weight').fill('10');
  await page.locator('#unit').selectOption('g');
  await page.waitForTimeout(400);
  const inTotal = (await page.locator('#totalPrice').innerText()).trim();
  console.log('IN 24K 10g total', inTotal);

  // Back to Thailand, default
  await page.locator('#marketChips .chip[data-market="TH"]').click();
  await page.locator('#weight').fill('1');
  await page.locator('#unit').selectOption('baht');
  await page.waitForTimeout(400);
  const thTotal = (await page.locator('#totalPrice').innerText()).trim();
  console.log('TH total', thTotal);

  // Chart hover
  const chart = page.locator('.chart-stage');
  await chart.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  const box = await chart.boundingBox();
  await page.mouse.move(box.x + box.width * 0.6, box.y + box.height * 0.45);
  await page.waitForTimeout(300);
  const tooltipVisible = await page.locator('#chartTooltip').isVisible();
  console.log('tooltip', tooltipVisible);

  // Element screenshots
  await page.locator('.calc-section').scrollIntoViewIfNeeded();
  await page.locator('.calc-section').screenshot({ path: path.resolve('..', 'shots', 'calc.png') });
  await page.locator('#trend').screenshot({ path: path.resolve('..', 'shots', 'trend.png') });

  // Add holding
  await page.locator('#addHoldingBtn').click();
  await page.locator('#holdingName').fill('曼谷金饰');
  await page.locator('#holdingMarket').selectOption('TH');
  await page.locator('#holdingPurity').selectOption('0.965');
  await page.locator('#holdingAssetType').selectOption('jewelry');
  await page.locator('#holdingWeight').fill('1');
  await page.locator('#holdingUnit').selectOption('baht');
  await page.locator('#holdingCost').fill('65000');
  await page.locator('#saveHoldingBtn').click();
  await page.waitForTimeout(600);
  const rows = await page.locator('#holdingsBody tr').count();
  const holdingValue = (await page.locator('#portfolioValue').innerText()).trim();
  console.log('holdings', rows, 'value', holdingValue);
  await page.locator('#toast').evaluate((element) => element.classList.remove('show'));
  await page.locator('#portfolio').scrollIntoViewIfNeeded();
  await page.locator('#portfolio').screenshot({ path: path.resolve('..', 'shots', 'portfolio.png') });

  // Add alert
  await page.locator('#alertTarget').fill('3500');
  await page.locator('#alertDirection').selectOption('below');
  await page.locator('#alertForm button[type="submit"]').click();
  await page.waitForTimeout(400);
  const alerts = await page.locator('#alertList .alert-item').count();
  console.log('alerts', alerts);
  await page.locator('#alerts').scrollIntoViewIfNeeded();
  await page.locator('#alerts').screenshot({ path: path.resolve('..', 'shots', 'alerts.png') });

  // Mobile overflow check
  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  await mobile.goto('http://127.0.0.1:5188/?v=e2e2', { waitUntil: 'networkidle' });
  await mobile.waitForTimeout(800);
  const metrics = await mobile.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
    bodyScrollWidth: document.body.scrollWidth
  }));
  console.log('mobile metrics', metrics);
  await mobile.screenshot({ path: path.resolve('..', 'shots', 'mobile.png'), fullPage: false });

  console.log('errors', JSON.stringify(errors, null, 2));
  await browser.close();
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
