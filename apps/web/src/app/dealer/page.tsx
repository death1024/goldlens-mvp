import Link from 'next/link';
import { auth } from '@/auth';
import { DealerQuoteForm } from '@/components/dealer-quote-form';
import { listQuotes, listDealers } from '@/lib/db-data';
import { getDb, schema } from '@goldlens/db';
import { desc } from 'drizzle-orm';
import { formatMoney } from '@/lib/format';
import { getI18n } from '@/lib/i18n-server';
import { getIntlLocale } from '@goldlens/i18n';

export const dynamic = 'force-dynamic';

export default async function DealerPage() {
  const { t, locale } = await getI18n();
  const intl = getIntlLocale(locale);
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (!session?.user || (role !== 'dealer' && role !== 'admin')) {
    return (
      <div className="auth">
        <div className="auth-card">
          <p className="eyebrow">{t('dealer.eyebrow')}</p>
          <h1>{t('dealer.loginTitle')}</h1>
          <p>{t('dealer.loginBody')}</p>
          <Link href="/login" className="btn primary">{t('dealer.loginCta')}</Link>
        </div>
      </div>
    );
  }

  const [quotes, dealers] = await Promise.all([listQuotes('TH'), listDealers()]);
  const db = await getDb();
  const requests = await db.select().from(schema.quoteRequests).orderBy(desc(schema.quoteRequests.createdAt)).limit(8);

  return (
    <>
      <div className="page-head">
        <div>
          <p className="eyebrow"><span className="eyebrow-line" />{t('dealer.eyebrow')}</p>
          <h1>{t('dealer.title')}</h1>
          <p>{t('dealer.subtitle')}</p>
        </div>
        <span className="badge gold">{session.user.email} · {role}</span>
      </div>
      <div className="grid-2" style={{ alignItems: 'start' }}>
        <DealerQuoteForm />
        <div className="card card-pad">
          <div className="between" style={{ marginBottom: 12 }}><h2 style={{ fontSize: 22 }}>{t('dealer.requests')}</h2><span className="badge">{requests.length}</span></div>
          <div className="list">
            {requests.length === 0 ? <div className="empty">{t('dealer.noRequests')}</div> : requests.map((request: any) => (
              <div className="list-item" key={request.id}>
                <span className="badge gold">{request.marketCode}</span>
                <div className="grow"><strong>{request.city} · {request.weightGrams.toFixed(2)}g</strong><small>{request.purity === 0.965 ? '96.5%' : '22K'} · {new Date(request.createdAt).toLocaleString(intl)}</small></div>
                <span className="badge warn">{t('dealer.awaiting')}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <section style={{ marginTop: 18 }}>
        <div className="between" style={{ marginBottom: 10 }}><h2 className="section-title">{t('dealer.myQuotes')}</h2><span className="tiny">{t('quotes.verified', { n: dealers.length })}</span></div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>{t('dealer.dealerCol')}</th><th>{t('dealer.marketCol')}</th><th>{t('dealer.sellCol')}</th><th>{t('dealer.buybackCol')}</th><th>{t('dealer.verifyCol')}</th><th>{t('dealer.expiryCol')}</th></tr></thead>
            <tbody>
              {quotes.map((quote: any) => (
                <tr key={quote.id}>
                  <td><strong>{quote.dealer?.name}</strong></td>
                  <td>{t(`markets.${quote.marketCode}`)}</td>
                  <td>{formatMoney(quote.sellPriceMinor / 100, quote.currency, undefined, intl)}</td>
                  <td>{formatMoney(quote.buybackMinor / 100, quote.currency, undefined, intl)}</td>
                  <td><span className={`badge ${quote.verification === 'audited' ? 'gold' : 'green'}`}>{t(`verification.${quote.verification}`)}</span></td>
                  <td>{new Date(quote.expiresAt).toLocaleDateString(intl)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
