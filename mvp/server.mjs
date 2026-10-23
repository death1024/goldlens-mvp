import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(ROOT, 'public');
const DATA_DIR = path.join(ROOT, 'data');
const PORT = Number(process.env.PORT || 5188);
const HOST = process.env.HOST || '127.0.0.1';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2'
};

let fallback = null;
try {
  fallback = JSON.parse(await readFile(path.join(DATA_DIR, 'fallback.json'), 'utf8'));
} catch (error) {
  console.warn('[goldlens] fallback data unavailable:', error.message);
}

const cache = { at: 0, data: null };
const CACHE_MS = 60_000;

function withTimeout(ms = 9_000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return { signal: controller.signal, done: () => clearTimeout(timer) };
}

async function fetchJson(url, ms = 9_000) {
  const t = withTimeout(ms);
  try {
    const response = await fetch(url, {
      signal: t.signal,
      headers: {
        'user-agent': 'GoldLens/0.1 (+market reference; contact: hello@goldlens.app)',
        accept: 'application/json,text/plain,*/*'
      }
    });
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
    return await response.json();
  } finally {
    t.done();
  }
}

async function fetchText(url, ms = 9_000) {
  const t = withTimeout(ms);
  try {
    const response = await fetch(url, {
      signal: t.signal,
      headers: {
        'user-agent': 'Mozilla/5.0 (compatible; GoldLens/0.1; +https://goldlens.app)',
        accept: 'text/html,application/xhtml+xml'
      }
    });
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
    return await response.text();
  } finally {
    t.done();
  }
}

function number(value) {
  if (value === null || value === undefined) return null;
  const parsed = Number(String(value).replace(/,/g, '').replace(/[^\d.-]/g, ''));
  return Number.isFinite(parsed) ? parsed : null;
}

function gtaField(html, id) {
  const pattern = new RegExp(`id="[^"]*${id}"[^>]*>(?:<[^>]+>)*([^<]*)`, 'i');
  const match = html.match(pattern);
  return match ? match[1].trim() : null;
}

async function getThaiReference() {
  const html = await fetchText('https://classic.goldtraders.or.th/', 10_000);
  const data = {
    barSell: number(gtaField(html, 'lblBLSell')),
    barBuy: number(gtaField(html, 'lblBLBuy')),
    ornamentSell: number(gtaField(html, 'lblOMSell')),
    ornamentBuy: number(gtaField(html, 'lblOMBuy')),
    asOf: gtaField(html, 'lblAsTime'),
    source: 'Gold Traders Association (GTA)',
    url: 'https://www.goldtraders.or.th/'
  };
  if (!data.barSell || !data.barBuy) throw new Error('GTA price fields missing');
  return data;
}

async function getGoldSpot() {
  const data = await fetchJson('https://api.gold-api.com/price/XAU');
  const price = Number(data.price);
  if (!Number.isFinite(price)) throw new Error('invalid spot price');
  return {
    usdOz: price,
    updatedAt: data.updatedAt || new Date().toISOString(),
    source: 'gold-api.com',
    url: 'https://gold-api.com/'
  };
}

async function getFx() {
  const data = await fetchJson('https://open.er-api.com/v6/latest/USD');
  if (data.result !== 'success' || !data.rates) throw new Error('invalid FX payload');
  const rates = {};
  for (const code of ['USD', 'THB', 'AED', 'INR', 'CNY', 'SGD', 'EUR']) {
    if (Number.isFinite(Number(data.rates[code]))) rates[code] = Number(data.rates[code]);
  }
  return {
    rates,
    updatedAt: data.time_last_update_utc || null,
    source: 'open.er-api.com',
    url: 'https://open.er-api.com/'
  };
}

async function getFutures() {
  const data = await fetchJson('https://query1.finance.yahoo.com/v8/finance/chart/GC=F?range=1y&interval=1d', 12_000);
  const result = data?.chart?.result?.[0];
  if (!result?.timestamp?.length) throw new Error('invalid Yahoo chart payload');
  const meta = result.meta || {};
  const quote = result.indicators?.quote?.[0] || {};
  const rows = [];
  for (let i = 0; i < result.timestamp.length; i += 1) {
    const close = quote.close?.[i];
    if (!Number.isFinite(close)) continue;
    const date = new Date(result.timestamp[i] * 1000).toISOString().slice(0, 10);
    rows.push({ date, close: Math.round(close * 100) / 100 });
  }
  const changeAbs = Number(meta.fulldayChange);
  const price = Number(meta.regularMarketPrice ?? rows.at(-1)?.close);
  return {
    price,
    previousClose: Number.isFinite(changeAbs) ? Math.round((price - changeAbs) * 100) / 100 : rows.at(-2)?.close ?? null,
    changeAbs: Number.isFinite(changeAbs) ? Math.round(changeAbs * 100) / 100 : null,
    changePct: Number.isFinite(Number(meta.fulldayChangePercent)) ? Number(meta.fulldayChangePercent) : null,
    dayHigh: Number(meta.regularMarketDayHigh) || null,
    dayLow: Number(meta.regularMarketDayLow) || null,
    fiftyTwoWeekHigh: Number(meta.fiftyTwoWeekHigh) || null,
    fiftyTwoWeekLow: Number(meta.fiftyTwoWeekLow) || null,
    symbol: meta.symbol || 'GC=F',
    source: 'Yahoo Finance · COMEX GC=F',
    url: 'https://finance.yahoo.com/quote/GC=F/',
    history: rows
  };
}

function fallbackMarket() {
  const base = fallback || {};
  return {
    spot: base.spot || null,
    futures: base.futures ? { ...base.futures, history: base.history || [] } : null,
    fx: { rates: base.fx || {}, updatedAt: base.fxUpdatedAt || null, source: 'open.er-api.com' },
    thai: base.thai || null,
    degraded: ['snapshot'],
    updatedAt: base.generatedAt || new Date().toISOString()
  };
}

async function getMarket() {
  if (cache.data && Date.now() - cache.at < CACHE_MS) return cache.data;

  const [spotResult, fxResult, futuresResult, thaiResult] = await Promise.allSettled([
    getGoldSpot(),
    getFx(),
    getFutures(),
    getThaiReference()
  ]);

  const snapshot = fallbackMarket();
  const degraded = [];

  const pick = (result, key, fallbackValue, label) => {
    if (result.status === 'fulfilled' && result.value) return result.value;
    degraded.push(label);
    return fallbackValue;
  };

  let spot = pick(spotResult, 'spot', snapshot.spot, 'spot');
  let fx = pick(fxResult, 'fx', snapshot.fx, 'fx');
  let futures = pick(futuresResult, 'futures', snapshot.futures, 'futures');
  let thai = pick(thaiResult, 'thai', snapshot.thai, 'gta');

  if (!spot) spot = { usdOz: 4020.1, updatedAt: new Date().toISOString(), source: 'snapshot' };
  if (!fx?.rates?.THB) fx = snapshot.fx;
  if (!futures?.history?.length) futures = snapshot.futures;
  if (!thai) thai = snapshot.thai;

  const data = {
    ok: true,
    updatedAt: spot.updatedAt || new Date().toISOString(),
    fetchedAt: new Date().toISOString(),
    spot,
    fx: { rates: fx.rates, updatedAt: fx.updatedAt, source: fx.source },
    futures: futures
      ? {
          price: futures.price,
          previousClose: futures.previousClose,
          changeAbs: futures.changeAbs,
          changePct: futures.changePct,
          dayHigh: futures.dayHigh,
          dayLow: futures.dayLow,
          fiftyTwoWeekHigh: futures.fiftyTwoWeekHigh,
          fiftyTwoWeekLow: futures.fiftyTwoWeekLow,
          symbol: futures.symbol,
          source: futures.source,
          url: futures.url,
          history: futures.history || []
        }
      : null,
    thai,
    degraded,
    cacheSeconds: Math.round(CACHE_MS / 1000)
  };

  cache.at = Date.now();
  cache.data = data;
  return data;
}

function sendJson(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'x-content-type-options': 'nosniff',
    'referrer-policy': 'strict-origin-when-cross-origin',
    'content-length': Buffer.byteLength(body)
  });
  res.end(body);
}

async function serveStatic(req, res) {
  const requestUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  let pathname = decodeURIComponent(requestUrl.pathname);
  if (pathname === '/') pathname = '/index.html';
  const resolved = path.resolve(PUBLIC_DIR, `.${pathname}`);
  if (!resolved.startsWith(PUBLIC_DIR + path.sep) && resolved !== PUBLIC_DIR) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }
  try {
    const content = await readFile(resolved);
    const ext = path.extname(resolved).toLowerCase();
    res.writeHead(200, {
      'content-type': MIME[ext] || 'application/octet-stream',
      'cache-control': ext === '.html' ? 'no-cache' : ext === '.webmanifest' ? 'public, max-age=3600' : 'public, max-age=300',
      'x-content-type-options': 'nosniff',
      'referrer-policy': 'strict-origin-when-cross-origin',
      'content-length': content.length
    });
    res.end(content);
  } catch (error) {
    if (error.code === 'ENOENT') {
      res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
      res.end('Not found');
    } else {
      res.writeHead(500, { 'content-type': 'text/plain; charset=utf-8' });
      res.end('Internal error');
    }
  }
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    if (url.pathname === '/health') {
      sendJson(res, 200, { ok: true, uptime: process.uptime(), service: 'goldlens' });
      return;
    }
    if (url.pathname === '/api/market') {
      const data = await getMarket();
      sendJson(res, 200, data);
      return;
    }
    if (url.pathname.startsWith('/api/')) {
      sendJson(res, 404, { ok: false, error: 'unknown endpoint' });
      return;
    }
    await serveStatic(req, res);
  } catch (error) {
    console.error('[goldlens] request failed:', error);
    if (!res.headersSent) sendJson(res, 500, { ok: false, error: 'market data unavailable' });
    else res.end();
  }
});

server.listen(PORT, HOST, () => {
  console.log(`[goldlens] running at http://${HOST}:${PORT}`);
  console.log(`[goldlens] health: http://${HOST}:${PORT}/health`);
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    console.log(`[goldlens] ${signal} received, shutting down`);
    server.close(() => process.exit(0));
  });
}
