'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Send } from 'lucide-react';

const DEALERS = [
  { id: 'd-siam', name: 'Siam Gold House', currency: 'THB', market: 'TH' },
  { id: 'd-charoen', name: 'Charoen Gold', currency: 'THB', market: 'TH' },
  { id: 'd-dubai', name: 'Dune Bullion', currency: 'AED', market: 'AE' }
];

export function DealerQuoteForm() {
  const router = useRouter();
  const [dealerId, setDealerId] = useState('d-siam');
  const [sell, setSell] = useState(65000);
  const [buyback, setBuyback] = useState(62716);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const dealer = DEALERS.find((item) => item.id === dealerId) ?? DEALERS[0]!;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    try {
      const response = await fetch('/api/dealer/quotes', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          dealerId, market: dealer.market, purity: dealer.market === 'AE' ? 0.9167 : 0.965, weightGrams: dealer.market === 'TH' ? 15.244 : 1,
          sellPrice: sell, buyback, currency: dealer.currency, notes: 'Dealer portal submission'
        })
      });
      if (!response.ok) throw new Error('failed');
      setMessage('报价已提交，等待 Admin 审核');
      router.refresh();
    } catch {
      setMessage('提交失败：需要 Dealer/Admin 账户');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="form card card-pad" onSubmit={submit}>
      <div className="between"><h2 style={{ fontSize: 22 }}>提交今日报价</h2><span className="badge warn">待审核</span></div>
      <label className="label">Dealer
        <select className="select" value={dealerId} onChange={(event) => setDealerId(event.target.value)}>
          {DEALERS.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </select>
      </label>
      <div className="form-row">
        <label className="label">卖出价 / baht<input className="input" type="number" value={sell} onChange={(event) => setSell(Number(event.target.value) || 0)} /></label>
        <label className="label">回购价 / baht<input className="input" type="number" value={buyback} onChange={(event) => setBuyback(Number(event.target.value) || 0)} /></label>
      </div>
      <div className="badge">有效期 24h · 币种 {dealer.currency}</div>
      <button className="btn primary" type="submit" disabled={busy}><Send size={14} />{busy ? '提交中' : '提交报价'}</button>
      {message ? <p className={`note ${message.startsWith('报价') ? 'positive' : 'negative'}`}>{message}</p> : null}
      <p className="note">生产环境需要 Dealer 身份审核、报价签名与 Admin 二次确认。</p>
    </form>
  );
}
