'use client';

import Link from 'next/link';
import {
  ArrowRight, Bell, Calculator as CalcIcon, ChartNoAxesCombined,
  Globe2, ShieldCheck, Sparkles, WalletCards
} from 'lucide-react';
import { calcQuote, MARKETS, type MarketCode } from '@goldlens/core';
import { getIntlLocale } from '@goldlens/i18n';
import { useMarket } from '@/components/market-provider';
import { useI18n } from '@/components/locale-provider';
import { Calculator } from '@/components/calculator';
import { Sparkline } from '@/components/sparkline';
import { formatMoney, formatNumber, formatPct } from '@/lib/format';

export default function HomePage() {
  const { data, demo, snapshot } = useMarket();
  const { t, locale } = useI18n();
  const intl = getIntlLocale(locale);
  const change = data.futures.changePct ?? 0;
  const thai = calcQuote({ market: 'TH', purity: 0.965, weight: 1, unit: 'baht' }, snapshot);
  const marketRows = (Object.keys(MARKETS) as MarketCode[]).map((code) => {
    const config = MARKETS[code];
    const quote = calcQuote({ market: code, purity: config.defaultPurity, weight: 1, unit: 'g' }, snapshot);
    return { code, config, quote };
  });
  const spread = (data.thai?.ornamentSell ?? 0) - (data.thai?.ornamentBuy ?? 0);
  const spreadPct = data.thai?.ornamentSell ? (spread / data.thai.ornamentSell) * 100 : 0;
  const trendPct = ((data.futures.history.at(-1)?.close ?? 0) / (data.futures.history.at(-30)?.close ?? 1) - 1) * 100;

  return (
    <>
      <section className="hero">
        <div className="hero-main">
          <div className="between" style={{ alignItems: 'flex-start' }}>
            <div className="eyebrow"><span className="eyebrow-line" />{t('home.eyebrow')}</div>
            <span className={`badge ${demo ? 'warn' : 'green'}`}>{demo ? t('common.demo') : t('common.live')}</span>
          </div>
          <div className="hero-price" dir="ltr">
            ${formatNumber(data.spot.usdOz, 2, intl)}<small>/ oz</small>
          </div>
          <div className="hero-delta">
            <span className={change >= 0 ? 'positive' : 'negative'}>{change >= 0 ? '↑' : '↓'} {formatPct(change, 2, intl)}</span>
            <span className="tiny">{t('home.comex')}</span>
          </div>
          <h1>{t('home.titleA')}<br /><em>{t('home.titleB')}</em></h1>
          <p>{t('home.subtitle')}</p>
          <div className="hero-actions">
            <Link href="/calculate" className="btn primary">{t('home.ctaCalc')} <ArrowRight size={16} /></Link>
            <Link href="/compare" className="btn ghost">{t('home.ctaCompare')}</Link>
          </div>
          <div className="row" style={{ marginTop: 18 }}>
            <span className="tiny">{t('home.updatedAt', { time: new Date(data.updatedAt).toLocaleString(intl) })}</span>
            <span className="tiny">·</span>
            <span className="tiny">{t('home.dataSources', { n: 4 - data.degraded.length })}</span>
          </div>
        </div>

        <div className="hero-side">
          <div className="price-panel">
            <div className="between">
              <div>
                <p className="eyebrow">{t('home.bangkok')}</p>
                <h2>{t('home.thaiTitle')}</h2>
              </div>
              <span className="badge gold">{t('home.gta')}</span>
            </div>
            <div className="price-grid">
              <div className="price-cell"><span>{t('home.barSell')}</span><strong>{formatMoney(data.thai?.barSell ?? 0, 'THB', 0, intl)}</strong><small>{t('home.perBaht')}</small></div>
              <div className="price-cell"><span>{t('home.ornamentSell')}</span><strong>{formatMoney(data.thai?.ornamentSell ?? 0, 'THB', 0, intl)}</strong><small>{t('home.perBaht')}</small></div>
              <div className="price-cell"><span>{t('home.barBuy')}</span><strong>{formatMoney(data.thai?.barBuy ?? 0, 'THB', 0, intl)}</strong><small>{t('home.perBaht')}</small></div>
              <div className="price-cell"><span>{t('home.ornamentBuy')}</span><strong>{formatMoney(data.thai?.ornamentBuy ?? 0, 'THB', 0, intl)}</strong><small>{t('home.perBaht')}</small></div>
            </div>
            <div className="spread"><span className="gold">↕</span><span>{t('home.spread', { spread: formatMoney(spread, 'THB', 0, intl), pct: spreadPct.toFixed(1) })}</span></div>
            <div className="divider" />
            <div className="spark-head"><span>{t('home.sparkTitle')}</span><span>{formatPct(trendPct, 1, intl)}</span></div>
            <Sparkline points={data.futures.history.slice(-30)} />
          </div>
          <div className="card card-pad" style={{ padding: 16 }}>
            <div className="between">
              <span className="panel-title">{t('home.quickRead')}</span>
              <span className="badge">96.5% / baht</span>
            </div>
            <div className="row" style={{ marginTop: 10, alignItems: 'baseline' }}>
              <strong style={{ fontFamily: 'var(--serif)', fontSize: 30, fontWeight: 400 }}>{formatMoney(thai.total, 'THB', 0, intl)}</strong>
              <span className="tiny">{t('home.oneBaht')}</span>
            </div>
            <div className="tiny" style={{ marginTop: 4 }}>{t('home.buybackApprox', { value: formatMoney(thai.buyback, 'THB', 0, intl), pct: thai.breakEvenPct.toFixed(1) })}</div>
          </div>
        </div>
      </section>

      <div className="kpi-row">
        <div className="kpi"><span>{t('home.kpiHidden')}</span><strong>{formatMoney(thai.instantLoss, 'THB', 0, intl)}</strong></div>
        <div className="kpi"><span>{t('home.kpiPremium')}</span><strong>{formatMoney(thai.making, 'THB', 0, intl)}</strong></div>
        <div className="kpi"><span>{t('home.kpiFx')}</span><strong>{formatNumber(data.fx.rates.THB ?? 0, 3, intl)}</strong></div>
        <div className="kpi"><span>{t('home.kpiDegraded')}</span><strong>{data.degraded.length === 0 ? t('common.normal') : data.degraded.join(' · ')}</strong></div>
      </div>

      <section className="card card-pad quick-calc">
        <div className="between" style={{ marginBottom: 16 }}>
          <div>
            <p className="eyebrow">{t('home.trueCostEyebrow')}</p>
            <h2 className="section-title">{t('home.trueCostTitle')}</h2>
          </div>
          <Link href="/calculate" className="btn small ghost">{t('home.fullCalc')}</Link>
        </div>
        <Calculator compact />
      </section>

      <section style={{ marginTop: 26 }}>
        <div className="between" style={{ marginBottom: 12 }}>
          <div>
            <p className="eyebrow">{t('home.marketPulseEyebrow')}</p>
            <h2 className="section-title">{t('home.marketPulseTitle')}</h2>
          </div>
          <span className="tiny">{t('home.marketPulseSub')}</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>{t('home.tableMarket')}</th><th>{t('home.tablePurity')}</th><th>{t('home.tableTotal')}</th><th>{t('home.tableBuyback')}</th><th>{t('home.tableBreakEven')}</th><th>{t('home.tableData')}</th></tr></thead>
            <tbody>
              {marketRows.map(({ code, config, quote }) => (
                <tr key={code}>
                  <td><strong>{t(`markets.${code}`)}</strong><span className="tiny" style={{ display: 'block' }}>{config.currency}</span></td>
                  <td>{config.defaultPurity === 0.965 ? '96.5%' : config.defaultPurity === 0.9167 ? '22K' : config.defaultPurity === 0.999 ? '24K' : '18K'}</td>
                  <td><strong>{formatMoney(quote.total, config.currency, undefined, intl)}</strong></td>
                  <td>{formatMoney(quote.buyback, config.currency, undefined, intl)}</td>
                  <td className={quote.breakEvenPct > 5 ? 'negative' : 'positive'}>{formatPct(quote.breakEvenPct, 1, intl)}</td>
                  <td><span className={`badge ${demo ? 'warn' : 'green'}`}>{demo ? t('common.snapshot') : t('common.live')}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section style={{ marginTop: 28 }}>
        <div className="between" style={{ marginBottom: 12 }}>
          <div>
            <p className="eyebrow">{t('home.featuresEyebrow')}</p>
            <h2 className="section-title">{t('home.featuresTitle')}</h2>
          </div>
        </div>
        <div className="feature-grid">
          <Link href="/calculate" className="feature"><CalcIcon /><h3>{t('home.f1Title')}</h3><p>{t('home.f1Body')}</p></Link>
          <Link href="/compare" className="feature"><Globe2 /><h3>{t('home.f2Title')}</h3><p>{t('home.f2Body')}</p></Link>
          <Link href="/portfolio" className="feature"><WalletCards /><h3>{t('home.f3Title')}</h3><p>{t('home.f3Body')}</p></Link>
          <Link href="/alerts" className="feature"><Bell /><h3>{t('home.f4Title')}</h3><p>{t('home.f4Body')}</p></Link>
          <Link href="/quotes" className="feature"><ShieldCheck /><h3>{t('home.f5Title')}</h3><p>{t('home.f5Body')}</p></Link>
          <Link href="/calculate" className="feature"><Sparkles /><h3>{t('home.f6Title')}</h3><p>{t('home.f6Body')}</p></Link>
        </div>
      </section>

      <section style={{ marginTop: 28 }} className="card card-pad">
        <div className="between">
          <div>
            <p className="eyebrow">{t('home.howEyebrow')}</p>
            <h2 className="section-title">{t('home.howTitle')}</h2>
            <p className="section-sub" style={{ marginTop: 6 }}>{t('home.howBody')}</p>
          </div>
          <ChartNoAxesCombined size={42} className="gold" />
        </div>
      </section>
    </>
  );
}
