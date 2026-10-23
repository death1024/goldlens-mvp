import Link from 'next/link';
import { auth } from '@/auth';
import { getAdminStats } from '@/lib/db-data';
import { getI18n } from '@/lib/i18n-server';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const { t } = await getI18n();
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (!session?.user || role !== 'admin') {
    return (
      <div className="auth">
        <div className="auth-card">
          <p className="eyebrow">{t('admin.eyebrow')}</p>
          <h1>{t('admin.loginTitle')}</h1>
          <p>{t('admin.loginBody')}</p>
          <Link href="/login" className="btn primary">{t('admin.loginCta')}</Link>
        </div>
      </div>
    );
  }
  const stats = await getAdminStats();

  return (
    <>
      <div className="page-head">
        <div>
          <p className="eyebrow"><span className="eyebrow-line" />{t('admin.eyebrow')}</p>
          <h1>{t('admin.title')}</h1>
          <p>{t('admin.subtitle')}</p>
        </div>
        <span className="badge green">RBAC · admin</span>
      </div>
      <div className="grid-4" style={{ marginBottom: 16 }}>
        <div className="stat"><span>{t('admin.dealers')}</span><strong>{stats.dealers}</strong></div>
        <div className="stat"><span>{t('admin.verified')}</span><strong>{stats.verifiedDealers}</strong></div>
        <div className="stat"><span>{t('admin.activeQuotes')}</span><strong>{stats.activeQuotes}</strong></div>
        <div className="stat"><span>{t('admin.requests')}</span><strong>{stats.requests}</strong></div>
      </div>
      <div className="grid-2">
        <div className="card card-pad">
          <p className="panel-title">{t('admin.dataHealth')}</p>
          <div className="divider" />
          <div className="between"><span className="muted">{t('admin.db')}</span><span className="badge green">{t('admin.connected')}</span></div>
          <div className="between" style={{ marginTop: 9 }}><span className="muted">{t('admin.expiry')}</span><span className="badge">{t('admin.expiryValue')}</span></div>
          <div className="between" style={{ marginTop: 9 }}><span className="muted">{t('admin.inngest')}</span><span className="badge warn">{t('admin.devMode')}</span></div>
          <div className="between" style={{ marginTop: 9 }}><span className="muted">{t('admin.aiGateway')}</span><span className="badge">{process.env.AI_GATEWAY_API_KEY ? t('admin.configured') : t('admin.fallback')}</span></div>
        </div>
        <div className="card card-pad">
          <p className="panel-title">{t('admin.next')}</p>
          <div className="divider" />
          <p className="note">{t('admin.nextBody')}</p>
          <div className="row" style={{ marginTop: 12 }}><Link href="/dealer" className="btn small ghost">{t('admin.dealerPortal')}</Link><Link href="/status" className="btn small ghost">{t('admin.status')}</Link></div>
        </div>
      </div>
    </>
  );
}
