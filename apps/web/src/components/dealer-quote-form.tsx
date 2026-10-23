'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Send } from 'lucide-react';
import { useI18n } from './locale-provider';

const DEALERS = [
  { id: 'd-siam', name: 'Siam Gold House', currency: 'THB', market: 'TH' },
  { id: 'd-charoen', name: 'Charoen Gold', currency: 'THB', market: 'TH' },
  { id: 'd-dubai', name: 'Dune Bullion', currency: 'AED', market: 'AE' }
];

export function DealerQuoteForm() {
  const router = useRouter();
  const { t } = useI18n();
  const [dealerId, setDealerId] = useState('d-siam');
  const [sell, setSell] = useState(65000);
  const [buyback, setBuyback] = useState(62716);
  const [message, setMessage] = useState('');
  const [ok, setOk] = useState(false);
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
      setMessage(t('dealer.submitted'));
      setOk(true);
      router.refresh();
    } catch {
      setMessage(t('dealer.failed'));
      setOk(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="form card card-pad" onSubmit={submit}>
      <div className="between"><h2 style={{ fontSize: 22 }}>{t('dealer.formTitle')}</h2><span className="badge warn">{t('dealer.pending')}</span></div>
      <label className="label">{t('dealer.dealerLabel')}
        <select className="select" value={dealerId} onChange={(event) => setDealerId(event.target.value)}>
          {DEALERS.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </select>
      </label>
      <div className="form-row">
        <label className="label">{t('dealer.sell')}<input className="input" type="number" value={sell} onChange={(event) => setSell(Number(event.target.value) || 0)} /></label>
        <label className="label">{t('dealer.buyback')}<input className="input" type="number" value={buyback} onChange={(event) => setBuyback(Number(event.target.value) || 0)} /></label>
      </div>
      <div className="badge">{t('dealer.validity', { currency: dealer.currency })}</div>
      <button className="btn primary" type="submit" disabled={busy}><Send size={14} />{busy ? t('dealer.submitting') : t('dealer.submit')}</button>
      {message ? <p className={`note ${ok ? 'positive' : 'negative'}`}>{message}</p> : null}
      <p className="note">{t('dealer.note')}</p>
    </form>
  );
}
