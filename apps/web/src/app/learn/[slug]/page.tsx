import Link from 'next/link';
import { notFound } from 'next/navigation';

const content: Record<string, { title: string; tag: string; body: string[] }> = {
  'true-cost': {
    title: '金价 ≠ 到手价：一张账单的五个部分',
    tag: '基础',
    body: [
      '你看到的“今日金价”通常指金料价，不是金饰的到手价。到手价 = 金料 + 工费 + 税费 + 品牌/渠道溢价。',
      '卖出时，门店按回购价回收，通常低于金料价，且工费和税不会退回。所以一买一卖之间，有一个确定的“摩擦成本”。',
      'GoldLens 把五项拆开：金料、工费、税、回购、回本点。你不需要记住公式，只需要看结果里哪一项最贵。',
      '最后一条：把“我喜欢”单独列一行。它是消费，不是投资回报。'
    ]
  },
  buyback: {
    title: '为什么一买一卖就亏 3%–15%？',
    tag: '回购',
    body: [
      '金饰的工费在买入时支付，回购时通常按金料计，工费归零。税也一样。',
      '泰国 96.5% 金饰的挂牌卖出价与回购价之间，常见价差约 3%–5%；再加上工费，实际摩擦成本更高。',
      '回本点 = 回购价恢复到你的到手价所需的涨幅。它不是“金价涨多少”，而是“回购价涨多少”。',
      '买之前先问：如果我明天卖掉，能拿回多少？如果答案让你不舒服，这笔交易可能不适合你。'
    ]
  },
  units: {
    title: 'บาท、克、托拉、盎司：先统一单位',
    tag: '单位',
    body: [
      '泰国黄金交易用 baht（บาท），1 baht = 15.244 克。印度常用 tola，1 tola = 11.6638125 克。国际金价用 troy ounce，1 oz = 31.1034768 克。',
      '单位不统一时，“便宜”可能只是分母不同。GoldLens 先把所有单位转成克，再比总价。',
      '注意：泰国的 baht 既是货币也是重量单位。看到“1 baht 金价”时，先确认它指的是重量。'
    ]
  },
  purity: {
    title: '24K、22K、96.5% 到底差在哪',
    tag: '纯度',
    body: [
      '24K ≈ 99.9% 金，22K ≈ 91.67%，18K = 75%。泰国金饰常见 96.5%。',
      '纯度越高，金料价值越高，但硬度越低，越不适合复杂镶嵌和日常佩戴。',
      '回购时按纯度和重量折算金料价。买 18K 的“设计款”，工费占比通常更高，回本更难。'
    ]
  },
  making: {
    title: '工费是消费，不是投资',
    tag: '工费',
    body: [
      '工费覆盖设计、铸造、打磨、品牌、门店与售后。它是你为“这件作品”付的钱，不是金料价值。',
      '同样 10 克金，素圈和复杂镶嵌的工费可能差 3–10 倍。回购时，工费通常不返还。',
      '如果你把金饰当投资，先看工费占比；如果你把它当消费，就为设计买单，但别骗自己在投资。'
    ]
  },
  'cross-border': {
    title: '去迪拜买金真的更便宜吗？',
    tag: '跨境',
    body: [
      '迪拜金价通常接近国际金料价，但加上了工费、5% VAT、机票、住宿、汇率和携带风险。',
      '更关键的是回购：你在迪拜买的金，回到曼谷或孟买能否按当地价格回购？多数门店只回购自家产品，或按更低折价。',
      '把“到手价差”与“回购价差”同时算进去，再减去旅行成本。大多数情况下，跨境买金是旅行体验，不是套利。'
    ]
  }
};

export default async function LearnArticle({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = content[slug];
  if (!article) notFound();
  return (
    <article style={{ maxWidth: 760 }}>
      <Link href="/learn" className="tiny">← 返回知识库</Link>
      <p className="eyebrow" style={{ marginTop: 24 }}>{article.tag}</p>
      <h1 style={{ fontSize: 'clamp(34px, 5vw, 54px)', lineHeight: 1.05 }}>{article.title}</h1>
      <div className="divider" />
      {article.body.map((paragraph) => <p key={paragraph} style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.9, marginBottom: 16 }}>{paragraph}</p>)}
      <div className="card card-pad" style={{ marginTop: 24 }}>
        <p className="eyebrow">NEXT STEP</p>
        <h3 style={{ fontSize: 22 }}>把刚学的，算一遍。</h3>
        <Link href="/calculate" className="btn primary" style={{ marginTop: 12 }}>打开计算器</Link>
      </div>
    </article>
  );
}
