import { QuoteForm } from '@/components/quote-form';
import { listDealers, listQuotes } from '@/lib/db-data';
import { formatMoney } from '@/lib/format';
import { getI18n } from '@/lib/i18n-server';
import { getIntlLocale } from '@goldlens/i18n';

export const dynamic = 'force-dynamic';

export default async function QuotesPage() {
  const { t, locale } = await getI18n();
  const intl = getIntlLocale(locale);
  const [quotes, dealers] = await Promise.all([listQuotes('TH'), listDealers('TH')]);

  return (
    <>
      <div className="page-head">
        <div>
          <p className="eyebrow"><span className="eyebrow-line" />{t('quotes.eyebrow')}</p>
          <h1>{t('quotes.title')}</h1>
          <p>{t('quotes.subtitle')}</p>
        </div>
        <span className="badge green">{t('quotes.verified', { n: dealers.length })}</span>
      </div>

      <div className="grid-2" style={{ alignItems: 'start' }}>
        <QuoteForm />
        <div className="card card-pad">
          <div className="between" style={{ marginBottom: 12 }}>
            <div>
              <p className="eyebrow">{t('quotes.currentEyebrow')}</p>
              <h2 style={{ fontSize: 22 }}>{t('quotes.currentTitle')}</h2>
            </div>
            <span className="badge">1 baht</span>
          </div>
          <div className="list">
            {quotes.length === 0 ? <div className="empty">{t('quotes.noQuotes')}</div> : quotes.map((quote: any, index: number) => (
              <div className="list-item" key={quote.id}>
                <span className="badge gold">{index + 1}</span>
                <div className="grow">
                  <strong>{quote.dealer?.name ?? t('quotes.status')}</strong>
                  <small>{quote.dealer?.city} · {t('quotes.validUntil', { date: new Date(quote.expiresAt).toLocaleDateString(intl) })} · {t(`verification.${quote.verification}`)}</small>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <strong style={{ display: 'block', color: 'var(--ink)' }}>{formatMoney(quote.sellPriceMinor / 100, quote.currency, undefined, intl)}</strong>
                  <small className="tiny">{t('quotes.buyback', { value: formatMoney(quote.buybackMinor / 100, quote.currency, undefined, intl) })}</small>
                </div>
              </div>
            ))}
          </div>
          <p className="note" style={{ marginTop: 12 }}>{t('quotes.sampleNote')}</p>
        </div>
      </div>

      <section style={{ marginTop: 22 }}>
        <div className="between" style={{ marginBottom: 10 }}>
          <h2 className="section-title">{t('quotes.nearby')}</h2>
          <span className="tiny">{t('quotes.byRating')}</span>
        </div>
        <div className="dealer-grid">
          {dealers.map((dealer: any) => (
            <div className="dealer-card" key={dealer.id}>
              <div className="between"><h3>{dealer.name}</h3><span className="badge green">{t('quotes.status')}</span></div>
              <p>{dealer.city} · {t('dealers.rating', { value: dealer.rating ?? '—' })}</p>
              <div className="row"><span className="tiny">{t('dealers.verified')}</span><span className="tiny">{t('quotes.validUntil', { date: new Date(Date.now() + 7 * 864e5).toLocaleDateString(intl) })}</span></div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
