import Decimal from 'decimal.js';

export type MarketCode = 'TH' | 'AE' | 'IN' | 'US';
export type WeightUnit = 'g' | 'baht' | 'tola' | 'oz';

export interface ThaiReference {
  barSell: number;
  barBuy: number;
  ornamentSell: number;
  ornamentBuy: number;
  asOf?: string;
}

export interface MarketSnapshot {
  spotUsdOz: number;
  fxRates: Record<string, number>;
  thai?: ThaiReference;
}

export interface QuoteInput {
  market: MarketCode;
  purity: number;
  weight: number;
  unit: WeightUnit;
  makingPct?: number;
  taxPct?: number;
}

export interface QuoteResult {
  input: QuoteInput;
  currency: string;
  grams: number;
  purity: number;
  metal: number;
  making: number;
  tax: number;
  total: number;
  buyback: number;
  premiumPct: number;
  instantLoss: number;
  lossPct: number;
  breakEvenPct: number;
  perGram: number;
  metalMinor: number;
  makingMinor: number;
  taxMinor: number;
  totalMinor: number;
  buybackMinor: number;
  isThaiReference: boolean;
  fairness: {
    label: string;
    state: 'ok' | 'warn' | 'bad';
  };
}

export const UNITS: Record<WeightUnit, { label: string; grams: number }> = {
  g: { label: '克', grams: 1 },
  baht: { label: 'บาท', grams: 15.244 },
  tola: { label: '托拉', grams: 11.6638125 },
  oz: { label: '盎司', grams: 31.1034768 }
};

export const OZ_GRAMS = 31.1034768;
export const BAHT_GRAMS = 15.244;

export const MARKETS: Record<MarketCode, {
  name: string;
  currency: string;
  symbol: string;
  locale: string;
  defaultPurity: number;
  defaultUnit: WeightUnit;
  makingPct: number;
  taxPct: number;
  buybackSpreadPct: number;
  fairness: [number, number, number];
  fairnessLabels: [string, string, string, string];
}> = {
  TH: {
    name: '泰国',
    currency: 'THB',
    symbol: '฿',
    locale: 'th-TH',
    defaultPurity: 0.965,
    defaultUnit: 'baht',
    makingPct: 0,
    taxPct: 0,
    buybackSpreadPct: 0,
    fairness: [2, 5, 10],
    fairnessLabels: ['接近金条价', '正常金饰溢价', '溢价偏高', '明显偏高']
  },
  AE: {
    name: '阿联酋',
    currency: 'AED',
    symbol: 'د.إ',
    locale: 'en-AE',
    defaultPurity: 0.9167,
    defaultUnit: 'g',
    makingPct: 12,
    taxPct: 5,
    buybackSpreadPct: 3,
    fairness: [10, 20, 30],
    fairnessLabels: ['接近金料价', '正常零售区间', '溢价偏高', '明显偏高']
  },
  IN: {
    name: '印度',
    currency: 'INR',
    symbol: '₹',
    locale: 'en-IN',
    defaultPurity: 0.9167,
    defaultUnit: 'g',
    makingPct: 12,
    taxPct: 3,
    buybackSpreadPct: 4,
    fairness: [10, 20, 30],
    fairnessLabels: ['接近金料价', '正常零售区间', '溢价偏高', '明显偏高']
  },
  US: {
    name: '美国',
    currency: 'USD',
    symbol: '$',
    locale: 'en-US',
    defaultPurity: 0.999,
    defaultUnit: 'oz',
    makingPct: 8,
    taxPct: 0,
    buybackSpreadPct: 2,
    fairness: [8, 15, 25],
    fairnessLabels: ['接近金料价', '正常零售区间', '溢价偏高', '明显偏高']
  }
};

export const PURITY_LABELS: Record<string, string> = {
  '0.999': '24K',
  '0.9167': '22K',
  '0.965': '96.5%',
  '0.75': '18K'
};

export function unitToGrams(weight: number, unit: WeightUnit): number {
  return new Decimal(weight).mul(UNITS[unit].grams).toNumber();
}

export function gramsToUnit(grams: number, unit: WeightUnit): number {
  return new Decimal(grams).div(UNITS[unit].grams).toNumber();
}

export function purityLabel(purity: number): string {
  return PURITY_LABELS[String(purity)] ?? `${(purity * 100).toFixed(1)}%`;
}

function money(value: Decimal, currency: string): number {
  const places = currency === 'USD' ? 2 : 2;
  return value.toDecimalPlaces(places, Decimal.ROUND_HALF_UP).toNumber();
}

function minor(value: Decimal): number {
  return value.mul(100).toDecimalPlaces(0, Decimal.ROUND_HALF_UP).toNumber();
}

export function calcQuote(input: QuoteInput, snapshot: MarketSnapshot): QuoteResult {
  const market = MARKETS[input.market];
  if (!market) throw new Error(`Unsupported market: ${input.market}`);
  if (!Number.isFinite(input.weight) || input.weight <= 0) throw new Error('Weight must be positive');
  if (!Number.isFinite(input.purity) || input.purity <= 0 || input.purity > 1) throw new Error('Purity must be between 0 and 1');
  if (!Number.isFinite(snapshot.spotUsdOz) || snapshot.spotUsdOz <= 0) throw new Error('Spot price missing');

  const fx = new Decimal(snapshot.fxRates[market.currency] ?? 0);
  if (fx.lte(0)) throw new Error(`FX rate missing for ${market.currency}`);

  const grams = new Decimal(unitToGrams(input.weight, input.unit));
  const bahtWeight = grams.div(BAHT_GRAMS);
  const purity = new Decimal(input.purity);
  const makingPct = new Decimal(input.makingPct ?? market.makingPct);
  const taxPct = new Decimal(input.taxPct ?? market.taxPct);

  const spotGram = new Decimal(snapshot.spotUsdOz).div(OZ_GRAMS).mul(fx);
  const spotMetal = spotGram.mul(grams).mul(purity);

  const isThaiReference = input.market === 'TH' && input.purity === 0.965 && Boolean(snapshot.thai);
  let metal: Decimal;
  let baseRetail: Decimal;
  if (isThaiReference && snapshot.thai) {
    metal = new Decimal(snapshot.thai.barSell).mul(bahtWeight);
    baseRetail = new Decimal(snapshot.thai.ornamentSell).mul(bahtWeight);
  } else {
    metal = spotMetal;
    baseRetail = spotMetal;
  }

  const making = isThaiReference
    ? baseRetail.minus(metal).plus(baseRetail.mul(makingPct).div(100))
    : metal.mul(makingPct).div(100);
  const tax = metal.plus(making).mul(taxPct).div(100);
  const total = metal.plus(making).plus(tax);

  const buyback = isThaiReference && snapshot.thai
    ? new Decimal(snapshot.thai.ornamentBuy).mul(bahtWeight)
    : spotMetal.mul(new Decimal(1).minus(new Decimal(market.buybackSpreadPct).div(100)));

  const premiumPct = spotMetal.gt(0) ? total.div(spotMetal).minus(1).mul(100).toNumber() : 0;
  const instantLoss = total.minus(buyback);
  const lossPct = total.gt(0) ? instantLoss.div(total).mul(100).toNumber() : 0;
  const breakEvenPct = buyback.gt(0) ? total.div(buyback).minus(1).mul(100).toNumber() : 0;
  const perGram = grams.gt(0) ? total.div(grams).toNumber() : 0;

  const [low, mid, high] = market.fairness;
  const idx = premiumPct <= low ? 0 : premiumPct <= mid ? 1 : premiumPct <= high ? 2 : 3;
  const state: QuoteResult['fairness']['state'] = idx <= 1 ? 'ok' : idx === 2 ? 'warn' : 'bad';

  return {
    input,
    currency: market.currency,
    grams: grams.toNumber(),
    purity: input.purity,
    metal: money(metal, market.currency),
    making: money(making, market.currency),
    tax: money(tax, market.currency),
    total: money(total, market.currency),
    buyback: money(buyback, market.currency),
    premiumPct,
    instantLoss: money(instantLoss, market.currency),
    lossPct,
    breakEvenPct,
    perGram: money(new Decimal(perGram), market.currency),
    metalMinor: minor(metal),
    makingMinor: minor(making),
    taxMinor: minor(tax),
    totalMinor: minor(total),
    buybackMinor: minor(buyback),
    isThaiReference,
    fairness: {
      label: market.fairnessLabels[idx] ?? market.fairnessLabels[3],
      state
    }
  };
}

export interface DealerQuoteForRanking {
  id: string;
  total: number;
  buyback: number;
  distanceKm?: number;
  verification?: 'self_reported' | 'verified' | 'audited';
  freshnessMinutes?: number;
  sponsored?: boolean;
}

export interface RankedQuote extends DealerQuoteForRanking {
  score: number;
  reasons: string[];
}

export function rankQuotes(quotes: DealerQuoteForRanking[]): RankedQuote[] {
  if (quotes.length === 0) return [];
  const totals = quotes.map((q) => q.total);
  const buybacks = quotes.map((q) => q.buyback);
  const minTotal = Math.min(...totals);
  const maxTotal = Math.max(...totals);
  const minBuyback = Math.min(...buybacks);
  const maxBuyback = Math.max(...buybacks);
  const totalSpan = maxTotal - minTotal || 1;
  const buybackSpan = maxBuyback - minBuyback || 1;

  return quotes
    .map((quote) => {
      const priceScore = ((maxTotal - quote.total) / totalSpan) * 100;
      const buybackScore = ((quote.buyback - minBuyback) / buybackSpan) * 100;
      const proximityScore = quote.distanceKm === undefined ? 70 : Math.max(0, 100 - quote.distanceKm * 2);
      const verificationScore = quote.verification === 'audited' ? 100 : quote.verification === 'verified' ? 80 : 50;
      const freshnessScore = quote.freshnessMinutes === undefined ? 70 : Math.max(0, 100 - quote.freshnessMinutes / 6);
      const score = 0.4 * priceScore + 0.25 * buybackScore + 0.15 * proximityScore + 0.1 * verificationScore + 0.1 * freshnessScore;
      const reasons = [
        `到手价 ${priceScore >= 80 ? '较优' : priceScore >= 50 ? '中等' : '偏高'}`,
        `回购价 ${buybackScore >= 80 ? '较优' : buybackScore >= 50 ? '中等' : '偏低'}`,
        quote.verification === 'audited' ? '已审计' : quote.verification === 'verified' ? '已验证' : '待验证'
      ];
      return { ...quote, score: Math.round(score * 10) / 10, reasons };
    })
    .sort((a, b) => Number(Boolean(b.sponsored)) - Number(Boolean(a.sponsored)) || b.score - a.score);
}

export function parseNaturalQuery(text: string): Partial<QuoteInput> {
  const lower = text.toLowerCase();
  const market: MarketCode = /迪拜|dubai|阿联酋|uae/.test(lower)
    ? 'AE'
    : /印度|india|mumbai|孟买/.test(lower)
      ? 'IN'
      : /美国|usd|usa|new york/.test(lower)
        ? 'US'
        : 'TH';
  const weightMatch = lower.match(/(\d+(?:\.\d+)?)\s*(baht|บาท|g|克|tola|托拉|oz|盎司)/);
  const weight = weightMatch ? Number(weightMatch[1]) : 1;
  const unitRaw = weightMatch?.[2] ?? (market === 'TH' ? 'baht' : market === 'US' ? 'oz' : 'g');
  const unit: WeightUnit = /tola|托拉/.test(unitRaw) ? 'tola' : /oz|盎司/.test(unitRaw) ? 'oz' : /g|克/.test(unitRaw) ? 'g' : 'baht';
  const purity = /24k|24k|999/.test(lower) ? 0.999 : /22k|916/.test(lower) ? 0.9167 : /18k|750/.test(lower) ? 0.75 : 0.965;
  return { market, weight, unit, purity };
}
