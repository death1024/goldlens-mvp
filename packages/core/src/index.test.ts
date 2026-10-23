import { describe, expect, it } from 'vitest';
import { calcQuote, rankQuotes, unitToGrams } from './index';

const snapshot = {
  spotUsdOz: 4020.100098,
  fxRates: { THB: 33.729084, AED: 3.6725, INR: 94.901331, USD: 1 },
  thai: {
    barSell: 64200,
    barBuy: 64000,
    ornamentSell: 65000,
    ornamentBuy: 62716.92
  }
};

describe('GoldLens core', () => {
  it('converts baht and tola to grams', () => {
    expect(unitToGrams(1, 'baht')).toBeCloseTo(15.244, 6);
    expect(unitToGrams(1, 'tola')).toBeCloseTo(11.6638125, 6);
  });

  it('calculates the Thai GTA reference quote', () => {
    const quote = calcQuote({ market: 'TH', purity: 0.965, weight: 1, unit: 'baht' }, snapshot);
    expect(quote.total).toBe(65000);
    expect(quote.buyback).toBe(62716.92);
    expect(quote.instantLoss).toBeCloseTo(2283.08, 2);
    expect(quote.breakEvenPct).toBeCloseTo(3.64, 2);
    expect(quote.fairness.state).toBe('ok');
    expect(quote.fairness.labelKey).toBe('fairOk');
    expect(quote.totalMinor).toBe(6500000);
  });

  it('calculates an AED 22K quote with making and VAT', () => {
    const quote = calcQuote({ market: 'AE', purity: 0.9167, weight: 1, unit: 'g' }, snapshot);
    expect(quote.total).toBeGreaterThan(400);
    expect(quote.total).toBeLessThan(600);
    expect(quote.tax).toBeGreaterThan(0);
  });

  it('rejects invalid input', () => {
    expect(() => calcQuote({ market: 'TH', purity: 0.965, weight: 0, unit: 'baht' }, snapshot)).toThrow();
  });

  it('ranks price and buyback, not sponsorship', () => {
    const ranked = rankQuotes([
      { id: 'a', total: 65000, buyback: 62716, distanceKm: 2, verification: 'verified', freshnessMinutes: 10 },
      { id: 'b', total: 66000, buyback: 64000, distanceKm: 1, verification: 'audited', freshnessMinutes: 5, sponsored: true }
    ]);
    expect(ranked[0]!.score).toBeGreaterThan(0);
    expect(ranked[0]!.reasons.length).toBe(3);
  });
});
