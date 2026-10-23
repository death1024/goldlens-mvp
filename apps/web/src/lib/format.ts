export function formatMoney(value: number, currency = 'THB', digits?: number, locale = 'zh-CN') {
  if (!Number.isFinite(value)) return '—';
  const fractionDigits = digits ?? (currency === 'USD' ? 2 : 0);
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    currencyDisplay: 'narrowSymbol',
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits
  }).format(value);
}

export function formatNumber(value: number, digits = 0, locale = 'zh-CN') {
  return new Intl.NumberFormat(locale, { maximumFractionDigits: digits, minimumFractionDigits: digits }).format(Number.isFinite(value) ? value : 0);
}

export function formatPct(value: number, digits = 1, locale = 'zh-CN') {
  if (!Number.isFinite(value)) return '—';
  const sign = value > 0 ? '+' : '';
  return `${sign}${new Intl.NumberFormat(locale, { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(value)}%`;
}

export function formatDate(value?: string | Date | null, locale = 'zh-CN') {
  if (!value) return '—';
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat(locale, { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date);
}

export function formatShortDate(value: string, locale = 'zh-CN') {
  const date = new Date(`${value}T00:00:00Z`);
  return new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric', timeZone: 'UTC' }).format(date);
}

export function classNames(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ');
}
