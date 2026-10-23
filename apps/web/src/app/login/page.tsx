'use client';

import { useState } from 'react';
import Link from 'next/link';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ArrowRight, LockKeyhole } from 'lucide-react';
import { useI18n } from '@/components/locale-provider';

export default function LoginPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { t } = useI18n();
  const [email, setEmail] = useState('demo@goldlens.app');
  const [password, setPassword] = useState('goldlens');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    const result = await signIn('credentials', { email, password, redirect: false });
    setBusy(false);
    if (result?.error) {
      setError(t('login.error'));
      return;
    }
    router.push('/portfolio');
    router.refresh();
  };

  if (session?.user) {
    return (
      <div className="auth">
        <div className="auth-card">
          <p className="eyebrow">SIGNED IN</p>
          <h1>{t('login.signedIn')}</h1>
          <p>{t('login.signedInBody', { email: session.user.email ?? '' })}</p>
          <Link href="/portfolio" className="btn primary">{t('login.goPortfolio')} <ArrowRight size={14} /></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth">
      <form className="auth-card" onSubmit={submit}>
        <div className="brand" style={{ padding: '0 0 18px' }}>
          <span className="brand-mark"><svg viewBox="0 0 40 40" fill="none"><path d="M20 3 34 15 20 37 6 15Z" stroke="currentColor" strokeWidth="1.6" /><path d="M6 15h28M20 3v34" stroke="currentColor" strokeWidth="1" opacity=".7" /></svg></span>
          <div><div className="brand-word">GoldLens</div><div className="brand-cn">GoldLens · 2.1</div></div>
        </div>
        <p className="eyebrow">{t('login.welcome')}</p>
        <h1>{t('login.title')}</h1>
        <p>{t('login.subtitle')}</p>
        <div className="form">
          <label className="label">{t('login.email')}<input className="input" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" /></label>
          <label className="label">{t('login.password')}<input className="input" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" /></label>
          {error ? <p className="note negative">{error}</p> : null}
          <button className="btn primary" type="submit" disabled={busy}>{busy ? t('login.signingIn') : t('login.signIn')} <LockKeyhole size={14} /></button>
        </div>
        <div className="demo-note">
          {t('login.demoTitle')}：<b>{t('login.demoLine')}</b><br />
          {t('login.adminLine')}<br />
          {t('account.prodNote')}
        </div>
      </form>
    </div>
  );
}
