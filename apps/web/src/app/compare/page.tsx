'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { calcQuote, MARKETS, type MarketCode, type WeightUnit, UNITS } from '@goldlens/core';
import { useMarket } from '@/components/market-provider';
import { formatMoney, formatNumber } from '@/lib/format';

export default function ComparePage() {
  const { snapshot, demo } = useMarket();
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
          <p className="eyebrow"><span className="eyebrow-line" />SAME UNIT · SAME PURITY</p>
          <h1>同一克，不同世界。</h1>
          <p>把四个市场放到同一单位、同一纯度、同一时间点。价差不是“哪里更便宜”，而是“哪里的总成本更低”。</p>
        </div>
        <span className={`badge ${demo ? 'warn' : 'green'}`}>{demo ? 'DEMO' : 'LIVE'}</span>
      </div>

      <section className="card card-pad" style={{ marginBottom: 16 }}>
        <div className="grid-3">
          <label className="label">重量
            <div className="input-row"><input type="number" min="0.01" step="0.01" value={weight} onChange={(event) => setWeight(Number(event.target.value) || 0)} /><select value={unit} onChange={(event) => setUnit(event.target.value as WeightUnit)}>{Object.entries(UNITS).map(([code, u]) => <option key={code} value={code}>{u.label}</option>)}</select></div>
          </label>
          <label className="label">纯度
            <select className="select" value={purity} onChange={(event) => setPurity(Number(event.target.value))}>
              <option value={0.999}>24K</option><option value={0.9167}>22K</option><option value={0.965}>96.5%</option><option value={0.75}>18K</option>
            </select>
          </label>
          <div className="label">口径
            <div className="badge" style={{ minHeight: 36 }}>{formatNumber(weight * UNITS[unit].grams, 3)} g · 含默认工费/税</div>
          </div>
        </div>
      </section>

      <div className="table-wrap">
        <table>
          <thead><tr><th>市场</th><th>到手价</th><th>对比金料</th><th>回购</th><th>回本需上涨</th><th>判断</th><th></th></tr></thead>
          <tbody>
            {rows.map(({ code, config, quote }) => (
              <tr key={code} style={best?.code === code ? { background: 'rgba(229,196,107,.045)' } : undefined}>
                <td><strong>{config.name}</strong><span className="tiny" style={{ display: 'block' }}>{config.currency} · {config.defaultPurity === 0.965 ? '96.5%' : '22K/24K 可选'}</span></td>
                <td>{quote ? <strong>{formatMoney(quote.total, config.currency)}</strong> : '—'}</td>
                <td>{quote ? `${quote.premiumPct > 0 ? '+' : ''}${quote.premiumPct.toFixed(1)}%` : '—'}</td>
                <td>{quote ? formatMoney(quote.buyback, config.currency) : '—'}</td>
                <td className={quote && quote.breakEvenPct > 5 ? 'negative' : 'positive'}>{quote ? `${quote.breakEvenPct.toFixed(1)}%` : '—'}</td>
                <td>{best?.code === code ? <span className="badge gold">本组最低到手价</span> : <span className="badge">可对比</span>}</td>
                <td><Link href="/calculate" className="btn small ghost">算细节 <ArrowUpRight size={12} /></Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="note" style={{ marginTop: 12 }}>“最低到手价”只在这组参数下成立，且不含机票、旅行成本、门店议价与回购政策差异。跨境买金前，先看回购价。</p>
    </>
  );
}
