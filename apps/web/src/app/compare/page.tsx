'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { calcQuote, MARKETS, type MarketCode, type WeightUnit, UNITS } from '@goldlens/core';
import { getIntlLocale } from '@goldlens/i18n';
import { useMarket } from '@/components/market-provider';
import { useI18n } from '@/components/locale-provider';
import { formatMoney, formatNumber } from '@/lib/format';

export default function ComparePage() {
  const { snapshot, demo } = useMarket();
  const { t, locale } = useI18n();
  const intl = getIntlLocale(locale);
  const [weight, setWeight] = useState(1);
  const [unit, setUnit] = useState<WeightUnit>('g');
  const [purity, setPurity] = useState(0.9167);

  const rows = useMemo(() => (Object.keys(MARKETS) as MarketCode[]).map((code) => {
    const config = MARKETS[code];
    try {
      return { code, config, quote: calcQuote({ market: code, purity, weight, unit }, snapshot) };
    } catch {
      return { code, config, quote: null };
    }
  }), [purity, weight, unit, snapshot]);

  const best = rows.reduce((acc, row) => {
    if (!row.quote) return acc;
    if (!acc || row.quote.total < (acc.quote?.total ?? Infinity)) return row;
    return acc;
  }, null as typeof rows[number] | null);

  return (
    <>
      <div className="page-head">
        <div>
          <p className="eyebrow"><span className="eyebrow-line" />{t('compare.eyebrow')}</p>
          <h1>{t('compare.title')}</h1>
          <p>{t('compare.subtitle')}</p>
        </div>
        <span className={`badge ${demo ? 'warn' : 'green'}`}>{demo ? t('common.demo') : t('common.live')}</span>
      </div>

      <section className="card card-pad" style={{ marginBottom: 16 }}>
        <div className="grid-3">
          <label className="label">{t('compare.weight')}
            <div className="input-row"><input type="number" min="0.01" step="0.01" value={weight} onChange={(event) => setWeight(Number(event.target.value) || 0)} /><select value={unit} onChange={(event) => setUnit(event.target.value as WeightUnit)}>{Object.keys(UNITS).map((code) => <option key={code} value={code}>{t(`calc.unit${code === 'g' ? 'G' : code === 'baht' ? 'Baht' : code === 'tola' ? 'Tola' : 'Oz'}`)}</option>)}</select></div>
          </label>
          <label className="label">{t('compare.purity')}
            <select className="select" value={purity} onChange={(event) => setPurity(Number(event.target.value))}>
              <option value={0.999}>24K</option><option value={0.9167}>22K</option><option value={0.965}>96.5%</option><option value={0.75}>18K</option>
            </select>
          </label>
          <div className="label">{t('compare.scope')}
            <div className="badge" style={{ minHeight: 36 }}>{t('compare.grams', { value: formatNumber(weight * UNITS[unit].grams, 3, intl) })}</div>
          </div>
        </div>
      </section>

      <div className="table-wrap">
        <table>
          <thead><tr><th>{t('compare.tableMarket')}</th><th>{t('compare.tableTotal')}</th><th>{t('compare.tablePremium')}</th><th>{t('compare.tableBuyback')}</th><th>{t('compare.tableBreakEven')}</th><th>{t('compare.tableVerdict')}</th><th /></tr></thead>
          <tbody>
            {rows.map(({ code, config, quote }) => (
              <tr key={code} style={best?.code === code ? { background: 'rgba(229,196,107,.045)' } : undefined}>
                <td><strong>{t(`markets.${code}`)}</strong><span className="tiny" style={{ display: 'block' }}>{config.currency}</span></td>
                <td>{quote ? <strong>{formatMoney(quote.total, config.currency, undefined, intl)}</strong> : '—'}</td>
                <td>{quote ? `${quote.premiumPct > 0 ? '+' : ''}${quote.premiumPct.toFixed(1)}%` : '—'}</td>
                <td>{quote ? formatMoney(quote.buyback, config.currency, undefined, intl) : '—'}</td>
                <td className={quote && quote.breakEvenPct > 5 ? 'negative' : 'positive'}>{quote ? `${quote.breakEvenPct.toFixed(1)}%` : '—'}</td>
                <td>{best?.code === code ? <span className="badge gold">{t('compare.best')}</span> : <span className="badge">{t('compare.comparable')}</span>}</td>
                <td><Link href="/calculate" className="btn small ghost">{t('compare.details')} <ArrowUpRight size={12} /></Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="note" style={{ marginTop: 12 }}>{t('compare.note')}</p>
    </>
  );
}
