'use client';

import Link from 'next/link';
import { useI18n } from '@/components/locale-provider';

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const { t } = useI18n();
  return (
    <div className="auth">
      <div className="auth-card">
        <p className="eyebrow">{t('errors.error')}</p>
        <h1>{t('common.errorTitle')}</h1>
        <p>{t('common.errorBody')}</p>
        <div className="row">
          <button className="btn primary" onClick={reset}>{t('errors.retry')}</button>
          <Link href="/" className="btn ghost">{t('errors.backHome')}</Link>
        </div>
      </div>
    </div>
  );
}
