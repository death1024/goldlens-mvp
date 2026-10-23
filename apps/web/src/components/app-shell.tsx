'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import {
  Bell, BookOpen, Calculator, ChartNoAxesCombined, CircleUserRound,
  Gauge, LayoutDashboard, LifeBuoy, MessageSquareQuote, Scale, ShieldCheck,
  Store, WalletCards
} from 'lucide-react';
import { LOCALES } from '@goldlens/i18n';
import { useI18n } from './locale-provider';
import { useMarket } from './market-provider';

const primary = [
  { href: '/', key: 'home', icon: LayoutDashboard },
  { href: '/calculate', key: 'calculate', icon: Calculator },
  { href: '/compare', key: 'compare', icon: Scale },
  { href: '/quotes', key: 'quotes', icon: MessageSquareQuote },
  { href: '/portfolio', key: 'portfolio', icon: WalletCards },
  { href: '/alerts', key: 'alerts', icon: Bell },
  { href: '/learn', key: 'learn', icon: BookOpen },
  { href: '/account', key: 'account', icon: CircleUserRound }
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { locale, setLocale, dict } = useI18n();
  const { data, demo } = useMarket();
  const role = (session?.user as any)?.role;

  const isActive = (href: string) => href === '/' ? pathname === '/' : pathname.startsWith(href);
  const nav = (item: typeof primary[number]) => {
    const Icon = item.icon;
    return (
      <Link key={item.href} href={item.href} className={`side-link ${isActive(item.href) ? 'active' : ''}`}>
        <Icon />
        <span>{dict.nav[item.key]}</span>
      </Link>
    );
  };

  return (
    <div className="shell">
      <aside className="sidebar">
        <Link href="/" className="brand" aria-label="GoldLens 首页">
          <span className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 40 40" fill="none"><path d="M20 3 34 15 20 37 6 15Z" stroke="currentColor" strokeWidth="1.6"/><path d="M6 15h28M20 3v34" stroke="currentColor" strokeWidth="1" opacity=".7"/></svg>
          </span>
          <div>
            <div className="brand-word">GoldLens</div>
            <div className="brand-cn">金价透视 · 2.1</div>
          </div>
        </Link>
        <nav className="side-nav" aria-label="主导航">
          {primary.map(nav)}
        </nav>
        <div className="side-section">Workspace</div>
        <nav className="side-nav" aria-label="工作区">
          <Link href="/dealer" className={`side-link ${isActive('/dealer') ? 'active' : ''}`}><Store /><span>Dealer Portal</span></Link>
          <Link href="/admin" className={`side-link ${isActive('/admin') ? 'active' : ''}`}><ShieldCheck /><span>Admin Console</span></Link>
          <Link href="/status" className={`side-link ${isActive('/status') ? 'active' : ''}`}><Gauge /><span>System Status</span></Link>
        </nav>
        <div className="side-foot">
          <div className="row" style={{ marginBottom: 8 }}>
            <span className={`badge ${demo ? 'warn' : 'green'}`}><span className="user-dot" />{demo ? 'DEMO' : 'LIVE'}</span>
            <span className="tiny">1m refresh</span>
          </div>
          <p>不交易、不托管、不提供投资建议。价格以来源与时间戳为准。</p>
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <div className="topbar-title">
            <span className="gold">XAU</span> / USD · {data.spot.usdOz.toFixed(2)}
            <span className={`badge ${demo ? 'warn' : 'green'}`} style={{ marginLeft: 10 }}>{demo ? 'DEMO' : 'LIVE'}</span>
          </div>
          <div className="topbar-spacer" />
          <select
            aria-label="Language"
            className="select"
            style={{ width: 82, padding: '7px 8px' }}
            value={locale}
            onChange={(event) => setLocale(event.target.value as any)}
          >
            {LOCALES.map((item) => <option key={item.code} value={item.code}>{item.label}</option>)}
          </select>
          {session?.user ? (
            <div className="row">
              <span className="user-pill"><span className="user-dot" />{session.user.email}</span>
              <button className="icon-btn" title={dict.common.signOut} onClick={() => signOut({ callbackUrl: '/' })}>
                <CircleUserRound size={16} />
              </button>
            </div>
          ) : (
            <Link className="btn small primary" href="/login">{dict.common.signIn}</Link>
          )}
          <Link className="icon-btn" href="/status" title="Status"><LifeBuoy size={16} /></Link>
        </header>
        <main className="content">{children}</main>
        <nav className="mobile-nav" aria-label="移动导航">
          {primary.slice(0, 5).map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className={isActive(item.href) ? 'active' : ''}>
                <Icon /><span>{dict.nav[item.key]}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
