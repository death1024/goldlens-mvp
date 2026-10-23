'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Bell, Trash2 } from 'lucide-react';
import { useMarket } from '@/components/market-provider';
import { localDb, type LocalAlert } from '@/lib/local-db';
import { formatNumber } from '@/lib/format';

export function AlertsClient() {
  const { data: session } = useSession();
  const { data } = useMarket();
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
      id: `la_${crypto.randomUUID()}`,
      metric: 'spot_usd_oz',
      comparator,
      threshold,
      channel: 'web',
      status: 'active',
      createdAt: new Date().toISOString()
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
    setMessage('提醒已创建');
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
          <p className="eyebrow"><span className="eyebrow-line" />PRICE ALERTS</p>
          <h1>不用一直刷价格。</h1>
          <p>设一个目标价。到达时在应用内提醒；登录后可扩展到邮件 / LINE。提醒不是交易指令。</p>
        </div>
        <span className="badge gold">XAU ${formatNumber(data.spot.usdOz, 2)}</span>
      </div>

      <div className="grid-2" style={{ alignItems: 'start' }}>
        <form className="form card card-pad" onSubmit={add}>
          <div className="between"><h2 style={{ fontSize: 22 }}>新建提醒</h2><Bell size={18} className="gold" /></div>
          <div className="form-row">
            <label className="label">方向
              <select className="select" value={comparator} onChange={(event) => setComparator(event.target.value as any)}>
                <option value="below">跌破</option><option value="above">涨破</option>
              </select>
            </label>
            <label className="label">目标价（USD / oz）
              <input className="input" type="number" min="1" step="1" value={threshold} onChange={(event) => setThreshold(Number(event.target.value) || 0)} />
            </label>
          </div>
          <div className="badge">当前 ${formatNumber(data.spot.usdOz, 2)} · 触发距离 {(((threshold / data.spot.usdOz) - 1) * 100).toFixed(1)}%</div>
          <button className="btn primary" type="submit">创建提醒</button>
          {message ? <p className="note positive">{message}</p> : null}
          <p className="note">未登录时仅保存在本机；登录后写入 Postgres，由 Inngest 调度检查。</p>
        </form>

        <div className="card card-pad">
          <div className="between" style={{ marginBottom: 12 }}><h2 style={{ fontSize: 22 }}>我的提醒</h2><span className="badge">{checked.length} 条</span></div>
          <div className="list">
            {checked.length === 0 ? <div className="empty">还没有提醒。设一个你真正愿意出手的价格。</div> : checked.map((item) => (
              <div className="list-item" key={item.id}>
                <span className={`badge ${item.hit ? 'green' : 'warn'}`}>{item.hit ? '已触发' : '监控中'}</span>
                <div className="grow">
                  <strong>XAU {item.comparator === 'below' ? '≤' : '≥'} ${formatNumber(item.threshold, 2)}</strong>
                  <small>{item.channel === 'web' ? '应用内' : item.channel} · {new Date(item.createdAt).toLocaleDateString('zh-CN')}</small>
                </div>
                <button className="delete" onClick={() => remove(item)} aria-label="删除提醒"><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
          <p className="note" style={{ marginTop: 12 }}>提醒在打开应用时即时校验；后台推送需要登录与通知权限。</p>
        </div>
      </div>
    </>
  );
}
