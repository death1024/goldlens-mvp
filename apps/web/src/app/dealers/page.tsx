import Link from 'next/link';
import { MapPin, ShieldCheck, Star } from 'lucide-react';
import { listDealers, listQuotes } from '@/lib/db-data';
import { formatMoney } from '@/lib/format';
import { getI18n } from '@/lib/i18n-server';
import { getIntlLocale } from '@goldlens/i18n';

export const dynamic = 'force-dynamic';

export default async function DealersPage() {
  const { t, locale } = await getI18n();
  const intl = getIntlLocale(locale);
  const dealers = await listDealers();
  const thaiQuotes = await listQuotes('TH');

  return (
    <>
      <div className="page-head">
        <div>
          <p className="eyebrow"><span className="eyebrow-line" />{t('dealers.eyebrow')}</p>
          <h1>{t('dealers.title')}</h1>
          <p>{t('dealers.subtitle')}</p>
        </div>
        <Link href="/quotes" className="btn primary">{t('dealers.request')}</Link>
      </div>

      <div className="dealer-grid">
        {dealers.map((dealer: any) => {
          const quote = thaiQuotes.find((item: any) => item.dealerId === dealer.id);
          return (
            <div className="dealer-card" key={dealer.id}>
              <div className="between"><h3>{dealer.name}</h3><span className="badge green"><ShieldCheck size={11} />{t('dealers.verified')}</span></div>
              <p><MapPin size={10} style={{ display: 'inline', marginRight: 4 }} />{dealer.city} · {dealer.country}</p>
              <div className="row" style={{ marginTop: 10 }}>
                <span className="badge"><Star size={10} />{dealer.rating ?? '—'}</span>
                {quote ? <span className="badge gold">{formatMoney(quote.sellPriceMinor / 100, quote.currency, undefined, intl)} / baht</span> : <span className="badge">{t('dealers.awaiting')}</span>}
              </div>
              <div className="divider" />
              <p className="note">{quote ? `${t('dealers.buyback', { value: formatMoney(quote.buybackMinor / 100, quote.currency, undefined, intl) })} · ${t('dealers.validUntil', { date: new Date(quote.expiresAt).toLocaleDateString(intl) })}` : t('dealers.awaiting')}</p>
            </div>
          );
        })}
      </div>

      <section style={{ marginTop: 24 }} className="card card-pad">
        <p className="eyebrow">{t('dealers.trustEyebrow')}</p>
        <h2 className="section-title">{t('dealers.whyTitle')}</h2>
        <div className="feature-grid" style={{ marginTop: 14 }}>
          <div className="feature"><ShieldCheck /><h3>{t('dealers.l1Title')}</h3><p>{t('dealers.l1Body')}</p></div>
          <div className="feature"><Star /><h3>{t('dealers.l2Title')}</h3><p>{t('dealers.l2Body')}</p></div>
          <div className="feature"><MapPin /><h3>{t('dealers.l3Title')}</h3><p>{t('dealers.l3Body')}</p></div>
        </div>
      </section>
    </>
  );
}
