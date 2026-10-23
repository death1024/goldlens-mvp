'use client';

import { useState } from 'react';
import { signOut } from 'next-auth/react';
import { ArrowUpRight, Download, LogOut, ShieldCheck } from 'lucide-react';
import { useI18n } from './locale-provider';

export function AccountClient({ email, role, plan }: { email: string; role: string; plan: string }) {
  const { t, locale } = useI18n();
  const [currentPlan, setCurrentPlan] = useState(plan);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const upgrade = async () => {
    setBusy(true);
    setMessage('');
    try {
      const response = await fetch('/api/billing/checkout', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ plan: 'pro' }) });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      setCurrentPlan('pro');
      setMessage(data.mode === 'demo' ? t('account.demoUpgrade') : t('account.upgraded'));
    } catch {
      setMessage(t('account.billingError'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="page-head">
        <div>
          <p className="eyebrow"><span className="eyebrow-line" />{t('account.eyebrow')}</p>
          <h1>{t('account.title')}</h1>
          <p>{t('account.subtitle')}</p>
        </div>
        <span className="badge gold">{currentPlan === 'pro' ? t('common.pro') : t('common.free')}</span>
      </div>

      <div className="grid-2" style={{ alignItems: 'start' }}>
        <div className="card card-pad">
          <p className="panel-title">{t('account.profile')}</p>
          <div className="divider" />
          <div className="between"><span className="muted">{t('account.email')}</span><strong style={{ fontSize: 12 }}>{email}</strong></div>
          <div className="between" style={{ marginTop: 10 }}><span className="muted">{t('account.role')}</span><span className="badge">{role}</span></div>
          <div className="between" style={{ marginTop: 10 }}><span className="muted">{t('account.defaultMarket')}</span><span className="badge">{t('markets.TH')} · THB</span></div>
          <div className="between" style={{ marginTop: 10 }}><span className="muted">{t('account.language')}</span><span className="badge">{locale.toUpperCase()}</span></div>
          <div className="divider" />
          <button className="btn ghost" onClick={() => signOut({ callbackUrl: '/' })}><LogOut size={14} />{t('account.signOut')}</button>
        </div>

        <div className="card card-pad">
          <p className="panel-title">{t('account.plan')}</p>
          <div className="divider" />
          <h2 style={{ fontSize: 26 }}>{currentPlan === 'pro' ? t('account.proTitle') : t('account.freeTitle')}</h2>
          <p className="note" style={{ marginTop: 5 }}>{currentPlan === 'pro' ? t('account.proBody') : t('account.freeBody')}</p>
          <div className="divider" />
          <button className="btn primary" onClick={upgrade} disabled={busy || currentPlan === 'pro'}>
            {currentPlan === 'pro' ? t('account.latest') : busy ? t('account.creating') : t('account.upgrade')} <ArrowUpRight size={14} />
          </button>
          {message ? <p className="note positive" style={{ marginTop: 8 }}>{message}</p> : null}
          <p className="note" style={{ marginTop: 8 }}>{t('account.demoNote')}</p>
        </div>

        <div className="card card-pad">
          <p className="panel-title">{t('account.dataTitle')}</p>
          <div className="divider" />
          <p className="note">{t('account.dataBody')}</p>
          <div className="row" style={{ marginTop: 12 }}>
            <button className="btn ghost" onClick={() => window.open('/api/holdings', '_blank')}><Download size={14} />{t('account.export')}</button>
            <span className="badge"><ShieldCheck size={11} />{t('account.privacy')}</span>
          </div>
        </div>

        <div className="card card-pad">
          <p className="panel-title">{t('account.securityTitle')}</p>
          <div className="divider" />
          <p className="note">{t('account.securityBody')}</p>
          <div className="row" style={{ marginTop: 12 }}><span className="badge green">Session JWT</span><span className="badge">HTTPS only</span></div>
        </div>
      </div>
    </>
  );
}
