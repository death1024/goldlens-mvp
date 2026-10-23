import Link from 'next/link';
import { auth } from '@/auth';
import { AccountClient } from '@/components/account-client';
import { getDb, schema } from '@goldlens/db';
import { eq } from 'drizzle-orm';
import { getI18n } from '@/lib/i18n-server';

export const dynamic = 'force-dynamic';

export default async function AccountPage() {
  const { t } = await getI18n();
  const session = await auth();
  if (!session?.user) {
    return (
      <div className="auth">
        <div className="auth-card">
          <p className="eyebrow">{t('account.eyebrow')}</p>
          <h1>{t('account.loginTitle')}</h1>
          <p>{t('account.loginBody')}</p>
          <Link href="/login" className="btn primary">{t('account.loginCta')}</Link>
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
