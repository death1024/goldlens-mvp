import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getArticle } from '@goldlens/i18n';
import { getI18n } from '@/lib/i18n-server';

export default async function LearnArticle({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { t, locale } = await getI18n();
  const article = getArticle(locale, slug);
  if (!article) notFound();
  return (
    <article style={{ maxWidth: 760 }}>
      <Link href="/learn" className="tiny">{t('learn.back')}</Link>
      <p className="eyebrow" style={{ marginTop: 24 }}>{article.tag}</p>
      <h1 style={{ fontSize: 'clamp(34px, 5vw, 54px)', lineHeight: 1.05 }}>{article.title}</h1>
      <div className="divider" />
      {article.body.map((paragraph) => <p key={paragraph} style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.9, marginBottom: 16 }}>{paragraph}</p>)}
      <div className="card card-pad" style={{ marginTop: 24 }}>
        <p className="eyebrow">{t('learn.nextStep')}</p>
        <h3 style={{ fontSize: 22 }}>{t('learn.nextTitle')}</h3>
        <Link href="/calculate" className="btn primary" style={{ marginTop: 12 }}>{t('learn.openCalc')}</Link>
      </div>
    </article>
  );
}
