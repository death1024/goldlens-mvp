import { describe, expect, it } from 'vitest';
import { formatMoney, formatPct, formatNumber } from './format';

describe('format helpers', () => {
  it('formats currency', () => {
    expect(formatMoney(65000, 'THB')).toContain('65,000');
    expect(formatMoney(4026.9, 'USD', 2)).toContain('4,026.90');
  });
  it('formats percentages and numbers', () => {
    expect(formatPct(3.64)).toBe('+3.6%');
    expect(formatPct(-1.2, 2)).toBe('-1.20%');
    expect(formatNumber(15.244, 2)).toBe('15.24');
  });
});
