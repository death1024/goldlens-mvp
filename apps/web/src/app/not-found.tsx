import Link from 'next/link';
import { getI18n } from '@/lib/i18n-server';

export default async function NotFound() {
  const { t } = await getI18n();
  return (
    <div className="auth">
      <div className="auth-card">
        <p className="eyebrow">{t('errors.notFound')}</p>
        <h1>{t('common.notFoundTitle')}</h1>
        <p>{t('common.notFoundBody')}</p>
        <Link href="/" className="btn primary">{t('errors.backHome')}</Link>
      </div>
    </div>
  );
}
