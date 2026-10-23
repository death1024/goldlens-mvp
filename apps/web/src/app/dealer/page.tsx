import Link from 'next/link';
import { auth } from '@/auth';
import { DealerQuoteForm } from '@/components/dealer-quote-form';
import { listQuotes, listDealers } from '@/lib/db-data';
import { getDb, schema } from '@goldlens/db';
import { desc } from 'drizzle-orm';
import { formatMoney } from '@/lib/format';

export const dynamic = 'force-dynamic';

export default async function DealerPage() {
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (!session?.user || (role !== 'dealer' && role !== 'admin')) {
    return (
      <div className="auth">
        <div className="auth-card">
          <p className="eyebrow">DEALER PORTAL</p>
          <h1>Dealer 专属。</h1>
          <p>用 dealer@goldlens.app / goldlens 登录，或使用 admin@goldlens.app 查看管理视角。</p>
          <Link href="/login" className="btn primary">去登录</Link>
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
          <p className="eyebrow"><span className="eyebrow-line" />DEALER PORTAL</p>
          <h1>今天的报价，今天负责。</h1>
          <p>提交结构化报价，带有效期与回购价。Admin 审核后才会进入消费者排名。</p>
        </div>
        <span className="badge gold">{session.user.email} · {role}</span>
      </div>
      <div className="grid-2" style={{ alignItems: 'start' }}>
        <DealerQuoteForm />
        <div className="card card-pad">
          <div className="between" style={{ marginBottom: 12 }}><h2 style={{ fontSize: 22 }}>待响应询价</h2><span className="badge">{requests.length}</span></div>
          <div className="list">
            {requests.length === 0 ? <div className="empty">暂无新询价。消费者提交后会在这里出现。</div> : requests.map((request: any) => (
              <div className="list-item" key={request.id}>
                <span className="badge gold">{request.marketCode}</span>
                <div className="grow"><strong>{request.city} · {request.weightGrams.toFixed(2)}g</strong><small>{request.purity === 0.965 ? '96.5%' : '22K'} · {new Date(request.createdAt).toLocaleString('zh-CN')}</small></div>
                <span className="badge warn">待响应</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <section style={{ marginTop: 18 }}>
        <div className="between" style={{ marginBottom: 10 }}><h2 className="section-title">我的有效报价</h2><span className="tiny">{dealers.length} 家 Dealer</span></div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Dealer</th><th>市场</th><th>卖出</th><th>回购</th><th>验证</th><th>到期</th></tr></thead>
            <tbody>
              {quotes.map((quote: any) => (
                <tr key={quote.id}>
                  <td><strong>{quote.dealer?.name}</strong></td>
                  <td>{quote.marketCode}</td>
                  <td>{formatMoney(quote.sellPriceMinor / 100, quote.currency)}</td>
                  <td>{formatMoney(quote.buybackMinor / 100, quote.currency)}</td>
                  <td><span className={`badge ${quote.verification === 'audited' ? 'gold' : 'green'}`}>{quote.verification}</span></td>
                  <td>{new Date(quote.expiresAt).toLocaleDateString('zh-CN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
