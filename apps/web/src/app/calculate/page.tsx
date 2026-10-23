import { Calculator } from '@/components/calculator';
import { getI18n } from '@/lib/i18n-server';

export default async function CalculatePage() {
  const { t } = await getI18n();
  return (
    <>
      <div className="page-head">
        <div>
          <p className="eyebrow"><span className="eyebrow-line" />{t('calc.eyebrow')}</p>
          <h1>{t('calc.title')}</h1>
          <p>{t('calc.subtitle')}</p>
        </div>
        <span className="badge gold">{t('calc.reference')}</span>
      </div>
      <Calculator />
      <p className="note" style={{ marginTop: 14 }}>{t('calc.note')}</p>
    </>
  );
}
