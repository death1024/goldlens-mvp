import Link from 'next/link';
import { getArticles } from '@goldlens/i18n';
import { getI18n } from '@/lib/i18n-server';

export default async function LearnPage() {
  const { t, locale } = await getI18n();
  const articles = getArticles(locale);
  return (
    <>
      <div className="page-head">
        <div>
          <p className="eyebrow"><span className="eyebrow-line" />{t('learn.eyebrow')}</p>
          <h1>{t('learn.title')}</h1>
          <p>{t('learn.subtitle')}</p>
        </div>
        <span className="badge">{t('learn.count')}</span>
      </div>
      <div className="learn-grid">
        {articles.map((article) => (
          <Link href={`/learn/${article.slug}`} className="learn-card" key={article.slug}>
            <span className="badge gold">{article.tag}</span>
            <h3 style={{ marginTop: 12 }}>{article.title}</h3>
            <p>{article.excerpt}</p>
            <span>{t('learn.read')} →</span>
          </Link>
        ))}
      </div>
    </>
  );
}
