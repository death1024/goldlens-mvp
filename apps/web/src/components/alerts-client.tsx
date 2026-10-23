'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Bell, Trash2 } from 'lucide-react';
import { getIntlLocale } from '@goldlens/i18n';
import { useMarket } from '@/components/market-provider';
import { useI18n } from '@/components/locale-provider';
import { localDb, type LocalAlert } from '@/lib/local-db';
import { formatNumber } from '@/lib/format';

export function AlertsClient() {
  const { data: session } = useSession();
  const { data } = useMarket();
  const { t, locale } = useI18n();
  const intl = getIntlLocale(locale);
  const [items, setItems] = useState<LocalAlert[]>([]);
  const [threshold, setThreshold] = useState(Math.round(data.spot.usdOz * 0.97));
  const [comparator, setComparator] = useState<'below' | 'above'>('below');
  const [message, setMessage] = useState('');

  const load = async () => setItems(await localDb.alerts.orderBy('createdAt').reverse().toArray());
  useEffect(() => { load(); }, []);
  useEffect(() => {
    if (!session?.user) return;
    fetch('/api/alerts').then((response) => response.ok ? response.json() : null).then(async (payload) => {
      if (!payload?.alerts) return;
      for (const row of payload.alerts) {
        await localDb.alerts.put({
          id: row.id, serverId: row.id, metric: row.metric, comparator: row.comparator,
          threshold: row.threshold, channel: row.channel, status: row.status, createdAt: new Date(row.createdAt).toISOString()
        });
      }
      await load();
    }).catch(() => undefined);
  }, [session?.user?.id]);

  const checked = useMemo(() => items.map((item) => {
    const hit = item.comparator === 'below' ? data.spot.usdOz <= item.threshold : data.spot.usdOz >= item.threshold;
    return { ...item, hit };
  }), [items, data.spot.usdOz]);

  const add = async (event: React.FormEvent) => {
    event.preventDefault();
    if (threshold <= 0) return;
    const item: LocalAlert = {
      id: `la_${crypto.randomUUID()}`, metric: 'spot_usd_oz', comparator, threshold,
      channel: 'web', status: 'active', createdAt: new Date().toISOString()
    };
    await localDb.alerts.put(item);
    if (session?.user) {
      fetch('/api/alerts', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ metric: 'spot_usd_oz', comparator, threshold, channel: 'web' })
      }).then(async (response) => {
        if (response.ok) {
          const payload = await response.json();
          await localDb.alerts.update(item.id, { serverId: payload.alert.id });
        }
      }).catch(() => undefined);
    }
    setMessage(t('alerts.created'));
    await load();
  };

  const remove = async (item: LocalAlert) => {
    await localDb.alerts.delete(item.id);
    if (item.serverId) fetch('/api/alerts', { method: 'DELETE', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id: item.serverId }) }).catch(() => undefined);
    await load();
  };

  return (
    <>
      <div className="page-head">
        <div>
          <p className="eyebrow"><span className="eyebrow-line" />{t('alerts.eyebrow')}</p>
          <h1>{t('alerts.title')}</h1>
          <p>{t('alerts.subtitle')}</p>
        </div>
        <span className="badge gold">{t('alerts.current', { price: formatNumber(data.spot.usdOz, 2, intl) })}</span>
      </div>

      <div className="grid-2" style={{ alignItems: 'start' }}>
        <form className="form card card-pad" onSubmit={add}>
          <div className="between"><h2 style={{ fontSize: 22 }}>{t('alerts.newTitle')}</h2><Bell size={18} className="gold" /></div>
          <div className="form-row">
            <label className="label">{t('alerts.direction')}
              <select className="select" value={comparator} onChange={(event) => setComparator(event.target.value as any)}>
                <option value="below">{t('alerts.below')}</option><option value="above">{t('alerts.above')}</option>
              </select>
            </label>
            <label className="label">{t('alerts.target')}
              <input className="input" type="number" min="1" step="1" value={threshold} onChange={(event) => setThreshold(Number(event.target.value) || 0)} />
            </label>
          </div>
          <div className="badge">{t('alerts.distance', { current: formatNumber(data.spot.usdOz, 2, intl), pct: (((threshold / data.spot.usdOz) - 1) * 100).toFixed(1) })}</div>
          <button className="btn primary" type="submit">{t('alerts.create')}</button>
          {message ? <p className="note positive">{message}</p> : null}
          <p className="note">{t('alerts.note')}</p>
        </form>

        <div className="card card-pad">
          <div className="between" style={{ marginBottom: 12 }}><h2 style={{ fontSize: 22 }}>{t('alerts.listTitle')}</h2><span className="badge">{t('alerts.count', { n: checked.length })}</span></div>
          <div className="list">
            {checked.length === 0 ? <div className="empty">{t('alerts.empty')}</div> : checked.map((item) => (
              <div className="list-item" key={item.id}>
                <span className={`badge ${item.hit ? 'green' : 'warn'}`}>{item.hit ? t('alerts.triggered') : t('alerts.monitoring')}</span>
                <div className="grow">
                  <strong>XAU {item.comparator === 'below' ? '≤' : '≥'} ${formatNumber(item.threshold, 2, intl)}</strong>
                  <small>{item.channel === 'web' ? t('alerts.app') : item.channel === 'email' ? t('alerts.email') : t('alerts.line')} · {new Date(item.createdAt).toLocaleDateString(intl)}</small>
                </div>
                <button className="delete" onClick={() => remove(item)} aria-label={t('common.delete')}><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
          <p className="note" style={{ marginTop: 12 }}>{t('alerts.listNote')}</p>
        </div>
      </div>
    </>
  );
}
