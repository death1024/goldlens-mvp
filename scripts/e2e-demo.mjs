import assert from 'node:assert/strict';

const BASE = process.env.BASE_URL ?? 'http://localhost:3000';

function cookieHeader(response) {
  return response.headers.getSetCookie().map((item) => item.split(';')[0]).filter(Boolean);
}

async function login(email, password = 'goldlens') {
  const csrfResponse = await fetch(`${BASE}/api/auth/csrf`);
  const csrf = await csrfResponse.json();
  let cookies = cookieHeader(csrfResponse);

  const response = await fetch(`${BASE}/api/auth/callback/credentials`, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded', cookie: cookies.join('; ') },
    body: new URLSearchParams({ csrfToken: csrf.csrfToken, email, password, callbackUrl: `${BASE}/portfolio`, json: 'true' }),
    redirect: 'manual'
  });
  cookies = cookies.concat(cookieHeader(response));
  assert.equal(response.status, 302, `login ${email} should redirect`);
  return cookies.join('; ');
}

async function json(path, options = {}, cookie = '') {
  const response = await fetch(`${BASE}${path}`, {
    ...options,
    headers: { 'content-type': 'application/json', ...(cookie ? { cookie } : {}), ...(options.headers ?? {}) }
  });
  const text = await response.text();
  let body = null;
  try { body = JSON.parse(text); } catch { body = text; }
  return { status: response.status, body };
}

async function page(path, cookie = '') {
  const response = await fetch(`${BASE}${path}`, { headers: cookie ? { cookie } : {} });
  return { status: response.status, text: await response.text() };
}

console.log('1. public pages + demo market');
for (const path of ['/', '/calculate', '/compare', '/quotes', '/dealers', '/portfolio', '/alerts', '/learn', '/login', '/status']) {
  const result = await page(path);
  assert.equal(result.status, 200, `${path} should be 200`);
}
const market = await json('/api/market');
assert.equal(market.status, 200);
assert.equal(market.body.demo, true, 'market must be demo snapshot by default');
assert.ok(market.body.thai?.barSell > 0);
const health = await json('/api/health');
assert.equal(health.status, 200);
assert.equal(health.body.ok, true);

console.log('2. consumer login + AI rules + billing demo');
const demo = await login('demo@goldlens.app');
const ai = await json('/api/ai/parse', { method: 'POST', body: JSON.stringify({ text: '1 baht 96.5 今天曼谷买金' }) });
assert.equal(ai.status, 200);
assert.equal(ai.body.source, 'rules');
assert.equal(ai.body.quote.total, 65000);
const checkout = await json('/api/billing/checkout', { method: 'POST', body: JSON.stringify({ plan: 'pro' }) }, demo);
assert.equal(checkout.status, 200);
assert.equal(checkout.body.mode, 'demo');

console.log('3. holdings create/list/delete');
const holding = await json('/api/holdings', {
  method: 'POST',
  body: JSON.stringify({ name: 'Demo bar', market: 'TH', purity: 0.965, weightGrams: 15.244, costMinor: 6500000, currency: 'THB', assetType: 'bar' })
}, demo);
assert.equal(holding.status, 201, JSON.stringify(holding.body));
const holdingId = holding.body.holding.id;
let holdings = await json('/api/holdings', {}, demo);
assert.ok(holdings.body.holdings.some((item) => item.id === holdingId));
const deletedHolding = await json('/api/holdings', { method: 'DELETE', body: JSON.stringify({ id: holdingId }) }, demo);
assert.equal(deletedHolding.status, 200);
holdings = await json('/api/holdings', {}, demo);
assert.ok(!holdings.body.holdings.some((item) => item.id === holdingId));

console.log('4. alerts create/list/delete');
const alert = await json('/api/alerts', {
  method: 'POST',
  body: JSON.stringify({ metric: 'spot_usd_oz', comparator: 'below', threshold: 3000, channel: 'web' })
}, demo);
assert.equal(alert.status, 201, JSON.stringify(alert.body));
const alertId = alert.body.alert.id;
let alerts = await json('/api/alerts', {}, demo);
assert.ok(alerts.body.alerts.some((item) => item.id === alertId));
const deletedAlert = await json('/api/alerts', { method: 'DELETE', body: JSON.stringify({ id: alertId }) }, demo);
assert.equal(deletedAlert.status, 200);

console.log('5. quote request');
const quoteRequest = await json('/api/quote-requests', {
  method: 'POST',
  body: JSON.stringify({ market: 'TH', weightGrams: 15.244, purity: 0.965, city: 'Bangkok', note: 'demo e2e' })
}, demo);
assert.equal(quoteRequest.status, 201, JSON.stringify(quoteRequest.body));
assert.ok(quoteRequest.body.id.startsWith('qr_'));

console.log('6. dealer portal');
const dealer = await login('dealer@goldlens.app');
const dealerPage = await page('/dealer', dealer);
assert.equal(dealerPage.status, 200);
assert.ok(dealerPage.text.includes('DEALER PORTAL'));
const dealerQuote = await json('/api/dealer/quotes', {
  method: 'POST',
  body: JSON.stringify({ dealerId: 'd-siam', market: 'TH', purity: 0.965, weightGrams: 15.244, sellPrice: 65100, buyback: 62800, currency: 'THB', notes: 'demo e2e' })
}, dealer);
assert.equal(dealerQuote.status, 201, JSON.stringify(dealerQuote.body));

console.log('7. admin console');
const admin = await login('admin@goldlens.app');
const adminPage = await page('/admin', admin);
assert.equal(adminPage.status, 200);
assert.ok(adminPage.text.includes('ADMIN CONSOLE'));

console.log('DEMO E2E PASS · all virtual-data flows are working');
