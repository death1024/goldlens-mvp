'use client';

import { useI18n } from '@/components/locale-provider';

export default function Loading() {
  const { t } = useI18n();
  return (
    <div style={{ padding: 40, color: 'var(--muted)', fontSize: 12 }}>
      <span className="badge gold">LOADING</span>
      <p style={{ marginTop: 12 }}>{t('errors.loading')}</p>
    </div>
  );
}
