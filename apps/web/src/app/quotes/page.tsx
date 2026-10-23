import { QuoteForm } from '@/components/quote-form';
import { listDealers, listQuotes } from '@/lib/db-data';
import { formatMoney } from '@/lib/format';

export const dynamic = 'force-dynamic';

export default async function QuotesPage() {
  const [quotes, dealers] = await Promise.all([listQuotes('TH'), listDealers('TH')]);

  return (
    <>
      <div className="page-head">
        <div>
          <p className="eyebrow"><span className="eyebrow-line" />DEALER QUOTES</p>
          <h1>拿到可比较的报价。</h1>
          <p>先把需求结构化，再让已验证门店在 24 小时内报价。排名不按佣金，按到手价、回购、距离与验证等级。</p>
        </div>
        <span className="badge green">{dealers.length} 家已验证 Dealer</span>
      </div>

      <div className="grid-2" style={{ alignItems: 'start' }}>
        <QuoteForm />
        <div className="card card-pad">
          <div className="between" style={{ marginBottom: 12 }}>
            <div>
              <p className="eyebrow">THAILAND · 96.5%</p>
              <h2 style={{ fontSize: 22 }}>当前可比较报价</h2>
            </div>
            <span className="badge">1 baht</span>
          </div>
          <div className="list">
            {quotes.length === 0 ? <div className="empty">暂无有效报价。提交询价后，Dealer 会在这里出现。</div> : quotes.map((quote: any, index: number) => (
              <div className="list-item" key={quote.id}>
                <span className="badge gold">{index + 1}</span>
                <div className="grow">
                  <strong>{quote.dealer?.name ?? 'Verified dealer'}</strong>
                  <small>{quote.dealer?.city} · 到期 {new Date(quote.expiresAt).toLocaleDateString('zh-CN')} · {quote.verification}</small>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <strong style={{ display: 'block', color: 'var(--ink)' }}>{formatMoney(quote.sellPriceMinor / 100, quote.currency)}</strong>
                  <small className="tiny">回购 {formatMoney(quote.buybackMinor / 100, quote.currency)}</small>
                </div>
              </div>
            ))}
          </div>
          <p className="note" style={{ marginTop: 12 }}>示例报价来自 seed 数据，用于演示报价结构与排名；生产环境需 Dealer 提交、验证与过期管理。</p>
        </div>
      </div>

      <section style={{ marginTop: 22 }}>
        <div className="between" style={{ marginBottom: 10 }}>
          <h2 className="section-title">曼谷附近门店</h2>
          <span className="tiny">按评分排序 · 非广告</span>
        </div>
        <div className="dealer-grid">
          {dealers.map((dealer: any) => (
            <div className="dealer-card" key={dealer.id}>
              <div className="between"><h3>{dealer.name}</h3><span className="badge green">{dealer.status}</span></div>
              <p>{dealer.city} · 评分 {dealer.rating ?? '—'}</p>
              <div className="row"><span className="tiny">已验证</span><span className="tiny">报价有效期 7 天</span></div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
