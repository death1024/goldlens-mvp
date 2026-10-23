import Link from 'next/link';
import { MapPin, ShieldCheck, Star } from 'lucide-react';
import { listDealers, listQuotes } from '@/lib/db-data';
import { formatMoney } from '@/lib/format';

export const dynamic = 'force-dynamic';

export default async function DealersPage() {
  const dealers = await listDealers();
  const thaiQuotes = await listQuotes('TH');

  return (
    <>
      <div className="page-head">
        <div>
          <p className="eyebrow"><span className="eyebrow-line" />VERIFIED DEALER NETWORK</p>
          <h1>找到敢把回购价写清楚的店。</h1>
          <p>验证等级、报价有效期、回购条款，和到手价一样重要。列表不按广告费排序。</p>
        </div>
        <Link href="/quotes" className="btn primary">发起询价</Link>
      </div>

      <div className="dealer-grid">
        {dealers.map((dealer: any) => {
          const quote = thaiQuotes.find((item: any) => item.dealerId === dealer.id);
          return (
            <div className="dealer-card" key={dealer.id}>
              <div className="between"><h3>{dealer.name}</h3><span className="badge green"><ShieldCheck size={11} />{dealer.status}</span></div>
              <p><MapPin size={10} style={{ display: 'inline', marginRight: 4 }} />{dealer.city} · {dealer.country}</p>
              <div className="row" style={{ marginTop: 10 }}>
                <span className="badge"><Star size={10} />{dealer.rating ?? '—'}</span>
                {quote ? <span className="badge gold">{formatMoney(quote.sellPriceMinor / 100, quote.currency)} / baht</span> : <span className="badge">待报价</span>}
              </div>
              <div className="divider" />
              <p className="note">回购 {quote ? formatMoney(quote.buybackMinor / 100, quote.currency) : '—'} · 有效期至 {quote ? new Date(quote.expiresAt).toLocaleDateString('zh-CN') : '—'}</p>
            </div>
          );
        })}
      </div>

      <section style={{ marginTop: 24 }} className="card card-pad">
        <p className="eyebrow">TRUST LAYERS</p>
        <h2 className="section-title">为什么不是“附近金店”列表</h2>
        <div className="feature-grid" style={{ marginTop: 14 }}>
          <div className="feature"><ShieldCheck /><h3>验证等级</h3><p>self-reported → verified → audited。每条报价显示验证来源。</p></div>
          <div className="feature"><Star /><h3>可解释排名</h3><p>到手价 40%、回购 25%、距离 15%、验证 10%、新鲜度 10%。</p></div>
          <div className="feature"><MapPin /><h3>门店与条款</h3><p>地址、营业时间、工费、税、回购折价，一条一条写清楚。</p></div>
        </div>
      </section>
    </>
  );
}
