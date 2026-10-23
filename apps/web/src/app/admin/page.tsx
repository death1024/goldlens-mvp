import Link from 'next/link';
import { auth } from '@/auth';
import { getAdminStats } from '@/lib/db-data';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (!session?.user || role !== 'admin') {
    return (
      <div className="auth">
        <div className="auth-card">
          <p className="eyebrow">ADMIN CONSOLE</p>
          <h1>Admin 专属。</h1>
          <p>用 admin@goldlens.app / goldlens 登录。生产环境需要 RBAC、审计日志与二次验证。</p>
          <Link href="/login" className="btn primary">去登录</Link>
        </div>
      </div>
    );
  }
  const stats = await getAdminStats();

  return (
    <>
      <div className="page-head">
        <div>
          <p className="eyebrow"><span className="eyebrow-line" />ADMIN CONSOLE</p>
          <h1>系统今天怎么样？</h1>
          <p>Dealer、报价、询价、用户。先看可信度，再看增长。</p>
        </div>
        <span className="badge green">RBAC · admin</span>
      </div>
      <div className="grid-4" style={{ marginBottom: 16 }}>
        <div className="stat"><span>Dealer</span><strong>{stats.dealers}</strong></div>
        <div className="stat"><span>已验证</span><strong>{stats.verifiedDealers}</strong></div>
        <div className="stat"><span>有效报价</span><strong>{stats.activeQuotes}</strong></div>
        <div className="stat"><span>询价请求</span><strong>{stats.requests}</strong></div>
      </div>
      <div className="grid-2">
        <div className="card card-pad">
          <p className="panel-title">DATA HEALTH</p>
          <div className="divider" />
          <div className="between"><span className="muted">Postgres / PGlite</span><span className="badge green">connected</span></div>
          <div className="between" style={{ marginTop: 9 }}><span className="muted">报价过期策略</span><span className="badge">24h / 7d</span></div>
          <div className="between" style={{ marginTop: 9 }}><span className="muted">Inngest</span><span className="badge warn">dev mode</span></div>
          <div className="between" style={{ marginTop: 9 }}><span className="muted">AI Gateway</span><span className="badge">{process.env.AI_GATEWAY_API_KEY ? 'configured' : 'rules fallback'}</span></div>
        </div>
        <div className="card card-pad">
          <p className="panel-title">NEXT ACTIONS</p>
          <div className="divider" />
          <p className="note">接入真实 Dealer 报价审核流；为过期报价加 Inngest 定时任务；把 AI 抽取结果进入 `ai_extractions` 审核队列。</p>
          <div className="row" style={{ marginTop: 12 }}><Link href="/dealer" className="btn small ghost">Dealer Portal</Link><Link href="/status" className="btn small ghost">System Status</Link></div>
        </div>
      </div>
    </>
  );
}
