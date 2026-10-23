import Link from 'next/link';
import { getMarket } from '@/lib/market';
import { formatNumber } from '@/lib/format';
import { getI18n } from '@/lib/i18n-server';
import { getIntlLocale } from '@goldlens/i18n';

export const dynamic = 'force-dynamic';

export default async function StatusPage() {
  const { t, locale } = await getI18n();
  const intl = getIntlLocale(locale);
  const data = await getMarket();
  const sources = [
    { name: 'Gold API · XAU/USD', key: 'spot', value: `$${formatNumber(data.spot.usdOz, 2, intl)}`, detail: data.spot.source },
    { name: 'ExchangeRate API', key: 'fx', value: `THB ${formatNumber(data.fx.rates.THB ?? 0, 3, intl)}`, detail: data.fx.source ?? 'open.er-api.com' },
    { name: 'Yahoo Finance · GC=F', key: 'futures', value: `$${formatNumber(data.futures.price, 2, intl)}`, detail: data.futures.source ?? 'fallback' },
    { name: 'GTA Thailand', key: 'gta', value: `฿${formatNumber(data.thai?.ornamentSell ?? 0, 0, intl)}`, detail: data.thai?.source ?? 'fallback' }
  ];
  return (
    <>
      <div className="page-head">
        <div>
          <p className="eyebrow"><span className="eyebrow-line" />{t('status.eyebrow')}</p>
          <h1>{t('status.title')}</h1>
          <p>{t('status.subtitle')}</p>
        </div>
        <span className="badge green">{t('status.operational')}</span>
      </div>
      <div className="grid-2">
        {sources.map((source) => {
          const degraded = data.degraded.includes(source.key);
          return (
            <div className="card card-pad" key={source.key}>
              <div className="between"><span className="panel-title">{source.name}</span><span className={`badge ${degraded ? 'warn' : 'green'}`}>{degraded ? t('status.degraded') : t('status.live')}</span></div>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 34, marginTop: 12 }}>{source.value}</div>
              <p className="note">{source.detail}</p>
            </div>
          );
        })}
      </div>
      <div className="card card-pad" style={{ marginTop: 16 }}>
        <div className="between"><span className="panel-title">{t('status.updated')}</span><span className="tiny">{t('status.updatedAt', { time: new Date(data.updatedAt).toLocaleString(intl) })}</span></div>
        <div className="divider" />
        <p className="note">{t('status.degradedSources', { sources: data.degraded.length ? data.degraded.join(', ') : '—' })}</p>
        <div className="row" style={{ marginTop: 12 }}><Link href="/" className="btn small ghost">{t('status.back')}</Link><Link href="/admin" className="btn small ghost">{t('status.admin')}</Link></div>
      </div>
    </>
  );
}
