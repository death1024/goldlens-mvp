'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Send } from 'lucide-react';
import { MARKETS, type MarketCode } from '@goldlens/core';

const CITIES: Record<MarketCode, string> = { TH: 'Bangkok', AE: 'Dubai', IN: 'Mumbai', US: 'New York' };

export function QuoteForm() {
  const router = useRouter();
  const [market, setMarket] = useState<MarketCode>('TH');
  const [weight, setWeight] = useState(15.244);
  const [purity, setPurity] = useState(0.965);
  const [note, setNote] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setStatus(null);
    try {
      const response = await fetch('/api/quote-requests', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ market, weightGrams: weight, purity, city: CITIES[market], note })
      });
      if (!response.ok) throw new Error('failed');
      const data = await response.json();
      setStatus(`已提交 · ${data.id.slice(0, 12)}… · Dealer 将在 24h 内响应`);
      setNote('');
      router.refresh();
    } catch {
      setStatus('提交失败，请稍后重试');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="form card card-pad" onSubmit={submit}>
      <div>
        <p className="eyebrow">REQUEST A QUOTE</p>
        <h2 style={{ fontSize: 22 }}>让门店给你一个可比较的报价</h2>
        <p className="note" style={{ marginTop: 4 }}>需求会发给已验证 Dealer；报价带有效期与验证等级。</p>
      </div>
      <div className="form-row">
        <label className="label">市场
          <select className="select" value={market} onChange={(event) => { const next = event.target.value as MarketCode; setMarket(next); setPurity(MARKETS[next].defaultPurity); setWeight(next === 'TH' ? 15.244 : 1); }}>
            {(Object.keys(MARKETS) as MarketCode[]).map((code) => <option key={code} value={code}>{MARKETS[code].name}</option>)}
          </select>
        </label>
        <label className="label">城市
          <input className="input" value={CITIES[market]} readOnly />
        </label>
      </div>
      <div className="form-row">
        <label className="label">重量（克）
          <input className="input" type="number" min="0.01" step="0.01" value={weight} onChange={(event) => setWeight(Number(event.target.value) || 0)} />
        </label>
        <label className="label">纯度
          <select className="select" value={purity} onChange={(event) => setPurity(Number(event.target.value))}>
            <option value={0.965}>96.5%</option><option value={0.999}>24K</option><option value={0.9167}>22K</option><option value={0.75}>18K</option>
          </select>
        </label>
      </div>
      <label className="label">备注
        <textarea className="textarea" value={note} onChange={(event) => setNote(event.target.value)} placeholder="例如：想要金饰、今天到店、需要回购条款" />
      </label>
      <button className="btn primary" type="submit" disabled={busy}><Send size={14} />{busy ? '提交中' : '提交询价'}</button>
      {status ? <p className={`note ${status.startsWith('已') ? 'positive' : 'negative'}`}>{status}</p> : null}
      <p className="note">不交易、不托管。Dealer 报价是商业要约，最终以门店确认为准。</p>
    </form>
  );
}
