export function formatMoney(value: number, currency = 'THB', digits?: number) {
  if (!Number.isFinite(value)) return '—';
  const fractionDigits = digits ?? (currency === 'USD' ? 2 : 0);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    currencyDisplay: 'narrowSymbol',
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits
  }).format(value);
}

export function formatNumber(value: number, digits = 0) {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: digits, minimumFractionDigits: digits }).format(Number.isFinite(value) ? value : 0);
}

export function formatPct(value: number, digits = 1) {
  if (!Number.isFinite(value)) return '—';
  return `${value > 0 ? '+' : ''}${value.toFixed(digits)}%`;
}

export function formatDate(value?: string | Date | null) {
  if (!value) return '—';
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date);
}

export function formatShortDate(value: string) {
  const date = new Date(`${value}T00:00:00Z`);
  return new Intl.DateTimeFormat('zh-CN', { month: 'short', day: 'numeric', timeZone: 'UTC' }).format(date);
}

export function classNames(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ');
}
