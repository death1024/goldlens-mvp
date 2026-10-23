'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Plus, Trash2 } from 'lucide-react';
import { calcQuote, MARKETS, type MarketCode } from '@goldlens/core';
import { getIntlLocale } from '@goldlens/i18n';
import { useMarket } from '@/components/market-provider';
import { useI18n } from '@/components/locale-provider';
import { localDb, type LocalHolding } from '@/lib/local-db';
import { formatMoney, formatNumber } from '@/lib/format';

export function PortfolioClient() {
  const { data: session } = useSession();
  const { snapshot, data } = useMarket();
  const { t, locale } = useI18n();
  const intl = getIntlLocale(locale);
  const [items, setItems] = useState<LocalHolding[]>([]);
  const [name, setName] = useState(t('portfolio.jewelry'));
  const [market, setMarket] = useState<MarketCode>('TH');
  const [grams, setGrams] = useState(15.244);
  const [cost, setCost] = useState(65000);
  const [purity, setPurity] = useState(0.965);
  const [assetType, setAssetType] = useState<'bar' | 'jewelry'>('jewelry');
  const [message, setMessage] = useState('');

  const load = async () => setItems(await localDb.holdings.orderBy('createdAt').reverse().toArray());

  useEffect(() => { load(); }, []);
  useEffect(() => {
    if (!session?.user) return;
    fetch('/api/holdings').then((response) => response.ok ? response.json() : null).then(async (payload) => {
      if (!payload?.holdings) return;
      for (const row of payload.holdings) {
        await localDb.holdings.put({
          id: row.id, serverId: row.id, name: row.name, market: row.marketCode,
          purity: row.purity, grams: row.weightGrams, costMinor: row.costMinor,
          currency: row.currency, assetType: row.assetType, createdAt: new Date(row.createdAt).toISOString()
        });
      }
      await load();
    }).catch(() => undefined);
  }, [session?.user?.id]);

  const rows = useMemo(() => items.map((item) => {
    const quote = calcQuote({ market: item.market, purity: item.purity, weight: item.grams, unit: 'g' }, snapshot);
    let value = quote.buyback;
    if (item.market === 'TH' && item.purity === 0.965 && data.thai) {
      value = item.assetType === 'jewelry' ? data.thai.ornamentBuy * (item.grams / 15.244) : data.thai.barBuy * (item.grams / 15.244);
    }
    const fx = data.fx.rates[MARKETS[item.market as MarketCode].currency] ?? 1;
    const costValue = item.costMinor / 100;
    const pnl = value - costValue;
    return { item, value, costValue, pnl, pnlPct: costValue > 0 ? (pnl / costValue) * 100 : 0, usd: value / fx };
  }), [items, snapshot, data]);

  const totalUsd = rows.reduce((sum, row) => sum + row.usd, 0);
  const totalCostUsd = rows.reduce((sum, row) => sum + (row.costValue / (data.fx.rates[MARKETS[row.item.market as MarketCode].currency] ?? 1)), 0);
  const totalGrams = rows.reduce((sum, row) => sum + row.item.grams, 0);
  const pnlUsd = totalUsd - totalCostUsd;

  const add = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name || grams <= 0) return;
    const item: LocalHolding = {
      id: `l_${crypto.randomUUID()}`, name, market, purity, grams,
      costMinor: Math.round(cost * 100), currency: MARKETS[market].currency, assetType, createdAt: new Date().toISOString()
    };
    await localDb.holdings.put(item);
    if (session?.user) {
      fetch('/api/holdings', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name: item.name, market: item.market, purity: item.purity, weightGrams: item.grams,
          costMinor: item.costMinor, currency: item.currency, assetType: item.assetType
        })
      }).then(async (response) => {
        if (response.ok) {
          const payload = await response.json();
          await localDb.holdings.delete(item.id);
          await localDb.holdings.put({ ...item, id: payload.holding.id, serverId: payload.holding.id });
        }
      }).catch(() => undefined);
    }
    setMessage(t('portfolio.added'));
    await load();
  };

  const remove = async (item: LocalHolding) => {
    await localDb.holdings.delete(item.id);
    if (item.serverId) fetch('/api/holdings', { method: 'DELETE', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id: item.serverId }) }).catch(() => undefined);
    await load();
  };

  return (
    <>
      <div className="page-head">
        <div>
          <p className="eyebrow"><span className="eyebrow-line" />{t('portfolio.eyebrow')}</p>
          <h1>{t('portfolio.title')}</h1>
          <p>{t('portfolio.subtitle')}</p>
        </div>
        {session?.user ? <span className="badge green">{t('portfolio.syncedAs', { email: session.user.email ?? '' })}</span> : <span className="badge warn">{t('common.localMode')}</span>}
      </div>

      <div className="grid-4" style={{ marginBottom: 16 }}>
        <div className="stat"><span>{t('portfolio.statValue')}</span><strong>{formatMoney(totalUsd, 'USD', 2, intl)}</strong></div>
        <div className="stat"><span>{t('portfolio.statCost')}</span><strong>{formatMoney(totalCostUsd, 'USD', 2, intl)}</strong></div>
        <div className="stat"><span>{t('portfolio.statPnl')}</span><strong className={pnlUsd >= 0 ? 'positive' : 'negative'}>{pnlUsd >= 0 ? '+' : ''}{formatMoney(pnlUsd, 'USD', 2, intl)}</strong></div>
        <div className="stat"><span>{t('portfolio.statGrams')}</span><strong>{formatNumber(totalGrams, 2, intl)} g</strong></div>
      </div>

      <div className="grid-2" style={{ alignItems: 'start' }}>
        <form className="form card card-pad" onSubmit={add}>
          <div className="between"><h2 style={{ fontSize: 22 }}>{t('portfolio.addTitle')}</h2><span className="badge">{t('portfolio.indexeddb')}</span></div>
          <label className="label">{t('portfolio.name')}<input className="input" value={name} onChange={(event) => setName(event.target.value)} /></label>
          <div className="form-row">
            <label className="label">{t('portfolio.market')}<select className="select" value={market} onChange={(event) => { const next = event.target.value as MarketCode; setMarket(next); setPurity(MARKETS[next].defaultPurity); setGrams(next === 'TH' ? 15.244 : 1); }}>{(Object.keys(MARKETS) as MarketCode[]).map((code) => <option key={code} value={code}>{t(`markets.${code}`)}</option>)}</select></label>
            <label className="label">{t('portfolio.type')}<select className="select" value={assetType} onChange={(event) => setAssetType(event.target.value as any)}><option value="jewelry">{t('portfolio.jewelry')}</option><option value="bar">{t('portfolio.bar')}</option></select></label>
          </div>
          <div className="form-row">
            <label className="label">{t('portfolio.grams')}<input className="input" type="number" min="0.01" step="0.01" value={grams} onChange={(event) => setGrams(Number(event.target.value) || 0)} /></label>
            <label className="label">{t('portfolio.cost')}<input className="input" type="number" min="0" step="0.01" value={cost} onChange={(event) => setCost(Number(event.target.value) || 0)} /></label>
          </div>
          <label className="label">{t('portfolio.purity')}<select className="select" value={purity} onChange={(event) => setPurity(Number(event.target.value))}><option value={0.965}>96.5%</option><option value={0.999}>24K</option><option value={0.9167}>22K</option><option value={0.75}>18K</option></select></label>
          <button className="btn primary" type="submit"><Plus size={14} />{t('portfolio.add')}</button>
          {message ? <p className="note positive">{message}</p> : null}
          <p className="note">{t('portfolio.note')}</p>
        </form>

        <div className="table-wrap">
          <table>
            <thead><tr><th>{t('portfolio.tableAsset')}</th><th>{t('portfolio.tableMarket')}</th><th>{t('portfolio.tableGrams')}</th><th>{t('portfolio.tableCost')}</th><th>{t('portfolio.tableValue')}</th><th>{t('portfolio.tablePnl')}</th><th /></tr></thead>
            <tbody>
              {rows.length === 0 ? <tr><td colSpan={7}><div className="empty">{t('portfolio.empty')}</div></td></tr> : rows.map(({ item, value, pnl, pnlPct }) => (
                <tr key={item.id}>
                  <td><strong>{item.name}</strong><span className="tiny" style={{ display: 'block' }}>{item.assetType === 'jewelry' ? t('portfolio.jewelry') : t('portfolio.bar')}</span></td>
                  <td>{t(`markets.${item.market}`)}<span className="tiny" style={{ display: 'block' }}>{item.purity === 0.965 ? '96.5%' : item.purity === 0.999 ? '24K' : item.purity === 0.9167 ? '22K' : '18K'}</span></td>
                  <td>{formatNumber(item.grams, 2, intl)} g</td>
                  <td>{formatMoney(item.costMinor / 100, item.currency, undefined, intl)}</td>
                  <td><strong>{formatMoney(value, item.currency, undefined, intl)}</strong></td>
                  <td className={pnl >= 0 ? 'positive' : 'negative'}>{pnl >= 0 ? '+' : ''}{formatMoney(pnl, item.currency, undefined, intl)}<span className="tiny" style={{ display: 'block' }}>{pnlPct.toFixed(1)}%</span></td>
                  <td><button className="delete" onClick={() => remove(item)} aria-label={t('portfolio.delete')}><Trash2 size={14} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
