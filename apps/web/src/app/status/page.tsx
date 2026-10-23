import Link from 'next/link';
import { getMarket } from '@/lib/market';
import { formatNumber } from '@/lib/format';

export const dynamic = 'force-dynamic';

export default async function StatusPage() {
  const data = await getMarket();
  const sources = [
    { name: 'Gold API · XAU/USD', key: 'spot', value: `$${formatNumber(data.spot.usdOz, 2)}`, detail: data.spot.source },
    { name: 'ExchangeRate API', key: 'fx', value: `THB ${formatNumber(data.fx.rates.THB ?? 0, 3)}`, detail: data.fx.source ?? 'open.er-api.com' },
    { name: 'Yahoo Finance · GC=F', key: 'futures', value: `$${formatNumber(data.futures.price, 2)}`, detail: data.futures.source ?? 'fallback' },
    { name: 'GTA Thailand', key: 'gta', value: `฿${formatNumber(data.thai?.ornamentSell ?? 0, 0)}`, detail: data.thai?.source ?? 'fallback' }
  ];
  return (
    <>
      <div className="page-head">
        <div>
          <p className="eyebrow"><span className="eyebrow-line" />SYSTEM STATUS</p>
          <h1>数据从哪来，什么时候来的。</h1>
          <p>价格必须带来源、时间与置信度。降级不是隐藏，而是显示出来。</p>
        </div>
        <span className="badge green">operational</span>
      </div>
      <div className="grid-2">
        {sources.map((source) => {
          const degraded = data.degraded.includes(source.key);
          return (
            <div className="card card-pad" key={source.key}>
              <div className="between"><span className="panel-title">{source.name}</span><span className={`badge ${degraded ? 'warn' : 'green'}`}>{degraded ? 'degraded' : 'live'}</span></div>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 34, marginTop: 12 }}>{source.value}</div>
              <p className="note">{source.detail}</p>
            </div>
          );
        })}
      </div>
      <div className="card card-pad" style={{ marginTop: 16 }}>
        <div className="between"><span className="panel-title">UPDATED</span><span className="tiny">{new Date(data.updatedAt).toLocaleString('zh-CN')}</span></div>
        <div className="divider" />
        <p className="note">降级源：{data.degraded.length ? data.degraded.join('、') : '无'}。生产环境应加 Sentry、Checkly、OpenTelemetry 与每源 SLO。</p>
        <div className="row" style={{ marginTop: 12 }}><Link href="/" className="btn small ghost">返回首页</Link><Link href="/admin" className="btn small ghost">Admin</Link></div>
      </div>
    </>
  );
}
