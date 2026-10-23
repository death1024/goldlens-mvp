import Link from 'next/link';

const articles = [
  { slug: 'true-cost', tag: '基础', title: '金价 ≠ 到手价：一张账单的五个部分', excerpt: '金料、工费、税、品牌溢价、回购折价。看懂这五项，就不会被“今日金价”误导。' },
  { slug: 'buyback', tag: '回购', title: '为什么一买一卖就亏 3%–15%？', excerpt: '回购价通常按金料价减折价，工费和税不会回来。回本点是可以算出来的。' },
  { slug: 'units', tag: '单位', title: 'บาท、克、托拉、盎司：先统一单位', excerpt: '泰国 1 baht = 15.244g，印度 1 tola = 11.664g。单位错一次，预算错一倍。' },
  { slug: 'purity', tag: '纯度', title: '24K、22K、96.5% 到底差在哪', excerpt: '纯度影响金料价值，也影响硬度、工艺和回购。不是越高越适合佩戴。' },
  { slug: 'making', tag: '工费', title: '工费是消费，不是投资', excerpt: '设计、工艺、品牌、渠道都计入工费。买金饰时，工费占比比金价波动更重要。' },
  { slug: 'cross-border', tag: '跨境', title: '去迪拜买金真的更便宜吗？', excerpt: '把机票、税、回购、汇率和携带风险放进同一张表，再回答这个问题。' }
];

export default function LearnPage() {
  return (
    <>
      <div className="page-head">
        <div>
          <p className="eyebrow"><span className="eyebrow-line" />FIELD NOTES</p>
          <h1>先懂，再买。</h1>
          <p>不预测金价。只把影响你钱包的结构讲清楚。</p>
        </div>
        <span className="badge">6 篇 · 持续更新</span>
      </div>
      <div className="learn-grid">
        {articles.map((article) => (
          <Link href={`/learn/${article.slug}`} className="learn-card" key={article.slug}>
            <span className="badge gold">{article.tag}</span>
            <h3 style={{ marginTop: 12 }}>{article.title}</h3>
            <p>{article.excerpt}</p>
            <span>阅读 →</span>
          </Link>
        ))}
      </div>
    </>
  );
}
