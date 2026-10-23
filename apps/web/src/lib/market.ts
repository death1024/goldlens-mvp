import fallback from '@/data/market-fallback.json';

export interface PricePoint { date: string; close: number }
export interface MarketData {
  ok: boolean;
  updatedAt: string;
  fetchedAt?: string;
  spot: { usdOz: number; updatedAt: string; source: string };
  fx: { rates: Record<string, number>; updatedAt?: string | null; source?: string };
  futures: {
    price: number;
    previousClose?: number | null;
    changeAbs?: number | null;
    changePct?: number | null;
    dayHigh?: number | null;
    dayLow?: number | null;
    fiftyTwoWeekHigh?: number | null;
    fiftyTwoWeekLow?: number | null;
    source?: string;
    history: PricePoint[];
  };
  thai?: {
    barSell: number;
    barBuy: number;
    ornamentSell: number;
    ornamentBuy: number;
    asOf?: string;
    source?: string;
  };
  degraded: string[];
  demo?: boolean;
}

const FALLBACK = fallback as MarketData;
const OZ = 31.1034768;

let cache: { at: number; data: MarketData } | null = null;

async function json(url: string, ms = 8000) {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(ms),
    headers: { accept: 'application/json', 'user-agent': 'GoldLens/2.1' },
    cache: 'no-store'
  });
  if (!response.ok) throw new Error(`${url} ${response.status}`);
  return response.json();
}

async function text(url: string, ms = 9000) {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(ms),
    headers: { accept: 'text/html', 'user-agent': 'Mozilla/5.0 (compatible; GoldLens/2.1)' },
    cache: 'no-store'
  });
  if (!response.ok) throw new Error(`${url} ${response.status}`);
  return response.text();
}

function gtaField(html: string, id: string) {
  const match = html.match(new RegExp(`id="[^"]*${id}"[^>]*>(?:<[^>]+>)*([^<]*)`, 'i'));
  return match?.[1]?.trim() ?? null;
}

function num(value: string | null) {
  if (!value) return null;
  const parsed = Number(value.replace(/,/g, ''));
  return Number.isFinite(parsed) ? parsed : null;
}

async function getSpot() {
  const data = await json('https://api.gold-api.com/price/XAU');
  return { usdOz: Number(data.price), updatedAt: data.updatedAt ?? new Date().toISOString(), source: 'gold-api.com' };
}

async function getFx() {
  const data = await json('https://open.er-api.com/v6/latest/USD');
  if (data.result !== 'success') throw new Error('fx failed');
  const rates: Record<string, number> = {};
  for (const code of ['USD', 'THB', 'AED', 'INR', 'CNY', 'SGD', 'EUR']) {
    if (Number.isFinite(Number(data.rates?.[code]))) rates[code] = Number(data.rates[code]);
  }
  return { rates, updatedAt: data.time_last_update_utc ?? null, source: 'open.er-api.com' };
}

async function getFutures() {
  const data = await json('https://query1.finance.yahoo.com/v8/finance/chart/GC=F?range=1y&interval=1d', 12000);
  const result = data?.chart?.result?.[0];
  if (!result?.timestamp?.length) throw new Error('history failed');
  const meta = result.meta ?? {};
  const quote = result.indicators?.quote?.[0] ?? {};
  const history: PricePoint[] = [];
  for (let i = 0; i < result.timestamp.length; i += 1) {
    const close = quote.close?.[i];
    if (Number.isFinite(close)) {
      history.push({ date: new Date(result.timestamp[i] * 1000).toISOString().slice(0, 10), close: Math.round(close * 100) / 100 });
    }
  }
  return {
    price: Number(meta.regularMarketPrice ?? history.at(-1)?.close ?? 0),
    previousClose: Number.isFinite(meta.fulldayChange) ? Number(meta.regularMarketPrice) - Number(meta.fulldayChange) : null,
    changeAbs: Number.isFinite(meta.fulldayChange) ? Number(meta.fulldayChange) : null,
    changePct: Number.isFinite(meta.fulldayChangePercent) ? Number(meta.fulldayChangePercent) : null,
    dayHigh: Number(meta.regularMarketDayHigh) || null,
    dayLow: Number(meta.regularMarketDayLow) || null,
    fiftyTwoWeekHigh: Number(meta.fiftyTwoWeekHigh) || null,
    fiftyTwoWeekLow: Number(meta.fiftyTwoWeekLow) || null,
    source: 'Yahoo Finance · GC=F',
    history
  };
}

async function getThai(): Promise<NonNullable<MarketData['thai']>> {
  const html = await text('https://classic.goldtraders.or.th/');
  const barSell = num(gtaField(html, 'lblBLSell'));
  const barBuy = num(gtaField(html, 'lblBLBuy'));
  const ornamentSell = num(gtaField(html, 'lblOMSell'));
  const ornamentBuy = num(gtaField(html, 'lblOMBuy'));
  if (!barSell || !barBuy || !ornamentSell || !ornamentBuy) throw new Error('gta failed');
  return { barSell, barBuy, ornamentSell, ornamentBuy, asOf: gtaField(html, 'lblAsTime') ?? undefined, source: 'Gold Traders Association (GTA)' };
}

export async function getMarket(): Promise<MarketData> {
  if (cache && Date.now() - cache.at < 60_000) return cache.data;
  const degraded: string[] = [];
  const [spot, fx, futures, thai] = await Promise.allSettled([getSpot(), getFx(), getFutures(), getThai()]);

  const data: MarketData = {
    ok: true,
    updatedAt: new Date().toISOString(),
    fetchedAt: new Date().toISOString(),
    spot: spot.status === 'fulfilled' ? spot.value : (() => { degraded.push('spot'); return FALLBACK.spot; })(),
    fx: fx.status === 'fulfilled' ? fx.value : (() => { degraded.push('fx'); return FALLBACK.fx; })(),
    futures: futures.status === 'fulfilled' ? futures.value : (() => { degraded.push('futures'); return FALLBACK.futures; })(),
    thai: thai.status === 'fulfilled' ? thai.value : (() => { degraded.push('gta'); return FALLBACK.thai; })(),
    degraded
  };

  cache = { at: Date.now(), data };
  return data;
}

export function getSnapshot(data: MarketData) {
  return {
    spotUsdOz: data.spot.usdOz,
    fxRates: data.fx.rates,
    thai: data.thai
  };
}

export function convertToMarket(data: MarketData, market: 'TH' | 'AE' | 'IN' | 'US') {
  const currency = market === 'TH' ? 'THB' : market === 'AE' ? 'AED' : market === 'IN' ? 'INR' : 'USD';
  return { currency, rate: data.fx.rates[currency] ?? 1 };
}

export { OZ, FALLBACK };
