'use client';

import { useState } from 'react';
import { signOut } from 'next-auth/react';
import { ArrowUpRight, Download, LogOut, ShieldCheck } from 'lucide-react';

export function AccountClient({ email, role, plan }: { email: string; role: string; plan: string }) {
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
      setMessage(data.mode === 'demo' ? '演示环境：已模拟升级到 Pro（未扣款）' : '已升级');
    } catch {
      setMessage('暂时无法创建订阅，请稍后重试');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="page-head">
        <div>
          <p className="eyebrow"><span className="eyebrow-line" />ACCOUNT</p>
          <h1>你的账户。</h1>
          <p>偏好、订阅、数据。没有暗黑模式套餐，也没有“猜你喜欢”的贷款。</p>
        </div>
        <span className="badge gold">{currentPlan.toUpperCase()}</span>
      </div>

      <div className="grid-2" style={{ alignItems: 'start' }}>
        <div className="card card-pad">
          <p className="panel-title">PROFILE</p>
          <div className="divider" />
          <div className="between"><span className="muted">邮箱</span><strong style={{ fontSize: 12 }}>{email}</strong></div>
          <div className="between" style={{ marginTop: 10 }}><span className="muted">角色</span><span className="badge">{role}</span></div>
          <div className="between" style={{ marginTop: 10 }}><span className="muted">默认市场</span><span className="badge">泰国 · THB</span></div>
          <div className="between" style={{ marginTop: 10 }}><span className="muted">语言</span><span className="badge">中文 / EN / ไทย / العربية</span></div>
          <div className="divider" />
          <button className="btn ghost" onClick={() => signOut({ callbackUrl: '/' })}><LogOut size={14} />退出登录</button>
        </div>

        <div className="card card-pad">
          <p className="panel-title">PLAN</p>
          <div className="divider" />
          <h2 style={{ fontSize: 26 }}>{currentPlan === 'pro' ? 'GoldLens Pro' : 'GoldLens Free'}</h2>
          <p className="note" style={{ marginTop: 5 }}>{currentPlan === 'pro' ? '多市场提醒、Dealer 优先询价、导出与 API。' : '计算器、价格看板、本地持仓与 3 条提醒。'}</p>
          <div className="divider" />
          <button className="btn primary" onClick={upgrade} disabled={busy || currentPlan === 'pro'}>
            {currentPlan === 'pro' ? '已是最新' : busy ? '创建中…' : '升级到 Pro'} <ArrowUpRight size={14} />
          </button>
          {message ? <p className="note positive" style={{ marginTop: 8 }}>{message}</p> : null}
          <p className="note" style={{ marginTop: 8 }}>演示环境不扣款；生产环境使用 Stripe / Omise Checkout。</p>
        </div>

        <div className="card card-pad">
          <p className="panel-title">DATA & PRIVACY</p>
          <div className="divider" />
          <p className="note">持仓与提醒优先存本机；登录后同步到 Postgres。收据原图不长期缓存，AI 抽取前脱敏。</p>
          <div className="row" style={{ marginTop: 12 }}>
            <button className="btn ghost" onClick={() => window.open('/api/holdings', '_blank')}><Download size={14} />导出持仓 JSON</button>
            <span className="badge"><ShieldCheck size={11} />本地优先</span>
          </div>
        </div>

        <div className="card card-pad">
          <p className="panel-title">SECURITY</p>
          <div className="divider" />
          <p className="note">当前演示使用邮箱 + 演示密码。生产接入 Auth.js + Passkeys/WebAuthn、Turnstile 与速率限制。</p>
          <div className="row" style={{ marginTop: 12 }}><span className="badge green">Session JWT</span><span className="badge">HTTPS only</span></div>
        </div>
      </div>
    </>
  );
}
