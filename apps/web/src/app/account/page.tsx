import Link from 'next/link';
import { auth } from '@/auth';
import { AccountClient } from '@/components/account-client';
import { getDb, schema } from '@goldlens/db';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) {
    return (
      <div className="auth">
        <div className="auth-card">
          <p className="eyebrow">ACCOUNT</p>
          <h1>先登录。</h1>
          <p>登录后同步持仓、提醒与订阅。</p>
          <Link href="/login" className="btn primary">登录 / 创建演示账户</Link>
        </div>
      </div>
    );
  }
  const db = await getDb();
  const userId = (session.user as any).id;
  const rows = await db.select().from(schema.subscriptions).where(eq(schema.subscriptions.userId, userId)).limit(1);
  return (
    <AccountClient
      email={session.user.email ?? ''}
      role={(session.user as any).role ?? 'user'}
      plan={rows[0]?.plan ?? 'free'}
    />
  );
}
