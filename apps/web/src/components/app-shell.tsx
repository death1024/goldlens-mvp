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
  const { locale, setLocale, t } = useI18n();
  const { data, demo } = useMarket();
  const isPartial = !demo && data.degraded.length > 0;
  const role = (session?.user as any)?.role;

  const isActive = (href: string) => href === '/' ? pathname === '/' : pathname.startsWith(href);
  const nav = (item: typeof primary[number]) => {
    const Icon = item.icon;
    return (
      <Link key={item.href} href={item.href} className={`side-link ${isActive(item.href) ? 'active' : ''}`}>
        <Icon />
        <span>{t(`nav.${item.key}`)}</span>
      </Link>
    );
  };

  return (
    <div className="shell">
      <aside className="sidebar">
        <Link href="/" className="brand" aria-label="GoldLens">
          <span className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 40 40" fill="none"><path d="M20 3 34 15 20 37 6 15Z" stroke="currentColor" strokeWidth="1.6"/><path d="M6 15h28M20 3v34" stroke="currentColor" strokeWidth="1" opacity=".7"/></svg>
          </span>
          <div>
            <div className="brand-word">GoldLens</div>
            <div className="brand-cn">GoldLens · 2.1</div>
          </div>
        </Link>
        <nav className="side-nav" aria-label={t('common.mainNav')}>
          {primary.map(nav)}
        </nav>
        <div className="side-section">{t('common.workspace')}</div>
        <nav className="side-nav" aria-label={t('common.workspaceNav')}>
          <Link href="/dealer" className={`side-link ${isActive('/dealer') ? 'active' : ''}`}><Store /><span>{t('nav.dealer')}</span></Link>
          <Link href="/admin" className={`side-link ${isActive('/admin') ? 'active' : ''}`}><ShieldCheck /><span>{t('nav.admin')}</span></Link>
          <Link href="/status" className={`side-link ${isActive('/status') ? 'active' : ''}`}><Gauge /><span>{t('nav.status')}</span></Link>
        </nav>
        <div className="side-foot">
          <div className="row" style={{ marginBottom: 8 }}>
            <span className={`badge ${demo ? 'warn' : isPartial ? 'warn' : 'green'}`}><span className="user-dot" />{demo ? t('common.demo') : isPartial ? t('common.partial') : t('common.live')}</span>
            <span className="tiny">{t('common.refresh')}</span>
          </div>
          <p>{t('common.disclaimer')}</p>
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <div className="topbar-title">
            <span className="gold">XAU</span> / USD · {data.spot.usdOz.toFixed(2)}
            <span className={`badge ${demo ? 'warn' : isPartial ? 'warn' : 'green'}`} style={{ marginLeft: 10 }}>{demo ? t('common.demo') : isPartial ? t('common.partial') : t('common.live')}</span>
          </div>
          <div className="topbar-spacer" />
          <select
            aria-label={t('common.language')}
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
              <button className="icon-btn" title={t('common.signOut')} onClick={() => signOut({ callbackUrl: '/' })}>
                <CircleUserRound size={16} />
              </button>
            </div>
          ) : (
            <Link className="btn small primary" href="/login">{t('common.signIn')}</Link>
          )}
          <Link className="icon-btn" href="/status" title={t('nav.status')}><LifeBuoy size={16} /></Link>
        </header>
        <main className="content">{children}</main>
        <nav className="mobile-nav" aria-label={t('common.mobileNav')}>
          {primary.slice(0, 5).map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className={isActive(item.href) ? 'active' : ''}>
                <Icon /><span>{t(`nav.${item.key}`)}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
