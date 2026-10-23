'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Send } from 'lucide-react';
import { MARKETS, type MarketCode } from '@goldlens/core';
import { useI18n } from './locale-provider';

const CITIES: Record<MarketCode, string> = { TH: 'Bangkok', AE: 'Dubai', IN: 'Mumbai', US: 'New York' };

export function QuoteForm() {
  const router = useRouter();
  const { t } = useI18n();
  const [market, setMarket] = useState<MarketCode>('TH');
  const [weight, setWeight] = useState(15.244);
  const [purity, setPurity] = useState(0.965);
  const [note, setNote] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
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
      setStatus(t('quotes.submitted', { id: data.id.slice(0, 12) }));
      setOk(true);
      setNote('');
      router.refresh();
    } catch {
      setStatus(t('quotes.failed'));
      setOk(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="form card card-pad" onSubmit={submit}>
      <div>
        <p className="eyebrow">{t('quotes.formEyebrow')}</p>
        <h2 style={{ fontSize: 22 }}>{t('quotes.formTitle')}</h2>
        <p className="note" style={{ marginTop: 4 }}>{t('quotes.formSub')}</p>
      </div>
      <div className="form-row">
        <label className="label">{t('common.market')}
          <select className="select" value={market} onChange={(event) => { const next = event.target.value as MarketCode; setMarket(next); setPurity(MARKETS[next].defaultPurity); setWeight(next === 'TH' ? 15.244 : 1); }}>
            {(Object.keys(MARKETS) as MarketCode[]).map((code) => <option key={code} value={code}>{t(`markets.${code}`)}</option>)}
          </select>
        </label>
        <label className="label">{t('common.city')}
          <input className="input" value={CITIES[market]} readOnly />
        </label>
      </div>
      <div className="form-row">
        <label className="label">{t('quotes.weight')}
          <input className="input" type="number" min="0.01" step="0.01" value={weight} onChange={(event) => setWeight(Number(event.target.value) || 0)} />
        </label>
        <label className="label">{t('quotes.purity')}
          <select className="select" value={purity} onChange={(event) => setPurity(Number(event.target.value))}>
            <option value={0.965}>96.5%</option><option value={0.999}>24K</option><option value={0.9167}>22K</option><option value={0.75}>18K</option>
          </select>
        </label>
      </div>
      <label className="label">{t('quotes.note')}
        <textarea className="textarea" value={note} onChange={(event) => setNote(event.target.value)} placeholder={t('quotes.notePlaceholder')} />
      </label>
      <button className="btn primary" type="submit" disabled={busy}><Send size={14} />{busy ? t('quotes.submitting') : t('quotes.submit')}</button>
      {status ? <p className={`note ${ok ? 'positive' : 'negative'}`}>{status}</p> : null}
      <p className="note">{t('quotes.disclaimer')}</p>
    </form>
  );
}
