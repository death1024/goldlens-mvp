'use client';

import { useState } from 'react';
import Link from 'next/link';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ArrowRight, LockKeyhole } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { data: session } = useSession();
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
      setError('邮箱或密码不正确。演示密码：goldlens');
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
          <h1>你已经登录。</h1>
          <p>{session.user.email}</p>
          <Link href="/portfolio" className="btn primary">进入持仓 <ArrowRight size={14} /></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth">
      <form className="auth-card" onSubmit={submit}>
        <div className="brand" style={{ padding: '0 0 18px' }}>
          <span className="brand-mark"><svg viewBox="0 0 40 40" fill="none"><path d="M20 3 34 15 20 37 6 15Z" stroke="currentColor" strokeWidth="1.6" /><path d="M6 15h28M20 3v34" stroke="currentColor" strokeWidth="1" opacity=".7" /></svg></span>
          <div><div className="brand-word">GoldLens</div><div className="brand-cn">金价透视 · 2.1</div></div>
        </div>
        <p className="eyebrow">WELCOME BACK</p>
        <h1>登录，继续算账。</h1>
        <p>同步持仓、提醒与订阅。我们不发验证码邮件，也不会给你打电话。</p>
        <div className="form">
          <label className="label">邮箱<input className="input" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" /></label>
          <label className="label">密码<input className="input" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" /></label>
          {error ? <p className="note negative">{error}</p> : null}
          <button className="btn primary" type="submit" disabled={busy}>{busy ? '登录中…' : '登录'} <LockKeyhole size={14} /></button>
        </div>
        <div className="demo-note">
          演示账号：<b>demo@goldlens.app</b> / 密码 <b>goldlens</b><br />
          Admin：<b>admin@goldlens.app</b> · Dealer：<b>dealer@goldlens.app</b>（同一密码）<br />
          生产环境请接入 Google / Apple / Passkeys，并替换演示密码。
        </div>
      </form>
    </div>
  );
}
