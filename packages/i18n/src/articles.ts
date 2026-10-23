import type { Locale } from './index';

export type Article = {
  slug: string;
  tag: string;
  title: string;
  excerpt: string;
  body: string[];
};

const zh: Article[] = [
  { slug: 'true-cost', tag: '基础', title: '金价 ≠ 到手价：一张账单的五个部分', excerpt: '金料、工费、税、品牌溢价、回购折价。看懂这五项，就不会被“今日金价”误导。', body: [
    '你看到的“今日金价”通常指金料价，不是金饰的到手价。到手价 = 金料 + 工费 + 税费 + 品牌/渠道溢价。',
    '卖出时，门店按回购价回收，通常低于金料价，且工费和税不会退回。所以一买一卖之间，有一个确定的“摩擦成本”。',
    'GoldLens 把五项拆开：金料、工费、税、回购、回本点。你不需要记住公式，只需要看结果里哪一项最贵。把“我喜欢”单独列一行：它是消费，不是投资回报。'
  ] },
  { slug: 'buyback', tag: '回购', title: '为什么一买一卖就亏 3%–15%？', excerpt: '回购价通常按金料价减折价，工费和税不会回来。回本点是可以算出来的。', body: [
    '金饰的工费在买入时支付，回购时通常按金料计，工费归零。税也一样。',
    '泰国 96.5% 金饰的挂牌卖出价与回购价之间，常见价差约 3%–5%；再加上工费，实际摩擦成本更高。',
    '回本点 = 回购价恢复到你的到手价所需的涨幅。它不是“金价涨多少”，而是“回购价涨多少”。买之前先问：如果我明天卖掉，能拿回多少？'
  ] },
  { slug: 'units', tag: '单位', title: 'บาท、克、托拉、盎司：先统一单位', excerpt: '泰国 1 baht = 15.244g，印度 1 tola = 11.664g。单位错一次，预算错一倍。', body: [
    '泰国黄金交易用 baht（บาท），1 baht = 15.244 克。印度常用 tola，1 tola = 11.6638125 克。国际金价用 troy ounce，1 oz = 31.1034768 克。',
    '单位不统一时，“便宜”可能只是分母不同。GoldLens 先把所有单位转成克，再比总价。',
    '注意：泰国的 baht 既是货币也是重量单位。看到“1 baht 金价”时，先确认它指的是重量。'
  ] },
  { slug: 'purity', tag: '纯度', title: '24K、22K、96.5% 到底差在哪', excerpt: '纯度影响金料价值，也影响硬度、工艺和回购。不是越高越适合佩戴。', body: [
    '24K ≈ 99.9% 金，22K ≈ 91.67%，18K = 75%。泰国金饰常见 96.5%。',
    '纯度越高，金料价值越高，但硬度越低，越不适合复杂镶嵌和日常佩戴。',
    '回购时按纯度和重量折算金料价。买 18K 的“设计款”，工费占比通常更高，回本更难。'
  ] },
  { slug: 'making', tag: '工费', title: '工费是消费，不是投资', excerpt: '设计、工艺、品牌、渠道都计入工费。买金饰时，工费占比比金价波动更重要。', body: [
    '工费覆盖设计、铸造、打磨、品牌、门店与售后。它是你为“这件作品”付的钱，不是金料价值。',
    '同样 10 克金，素圈和复杂镶嵌的工费可能差 3–10 倍。回购时，工费通常不返还。',
    '如果你把金饰当投资，先看工费占比；如果你把它当消费，就为设计买单，但别骗自己在投资。'
  ] },
  { slug: 'cross-border', tag: '跨境', title: '去迪拜买金真的更便宜吗？', excerpt: '把机票、税、回购、汇率和携带风险放进同一张表，再回答这个问题。', body: [
    '迪拜金价通常接近国际金料价，但加上了工费、5% VAT、机票、住宿、汇率和携带风险。',
    '更关键的是回购：你在迪拜买的金，回到曼谷或孟买能否按当地价格回购？多数门店只回购自家产品，或按更低折价。',
    '把“到手价差”与“回购价差”同时算进去，再减去旅行成本。大多数情况下，跨境买金是旅行体验，不是套利。'
  ] }
];

const en: Article[] = [
  { slug: 'true-cost', tag: 'Basics', title: 'Gold price ≠ landed cost: the five lines on a bill', excerpt: 'Metal, making, tax, brand premium and buyback. Understand these five and “today’s gold price” stops misleading you.', body: [
    'The “gold price” you see is usually the metal price, not the landed cost of jewelry. Landed cost = metal + making + tax + brand/channel premium.',
    'When you sell, the store buys back below the metal price, and making and tax do not return. That is a certain round-trip friction cost.',
    'GoldLens splits the bill into metal, making, tax, buyback and break-even. You do not need the formula; just see which line is largest. Put “I like it” on its own line: that is consumption, not investment return.'
  ] },
  { slug: 'buyback', tag: 'Buyback', title: 'Why a round trip loses 3%–15%', excerpt: 'Buyback usually applies a discount to metal; making and tax do not come back. Break-even can be calculated.', body: [
    'Making is paid at purchase. Buyback usually values only the metal, so making goes to zero. Tax behaves the same way.',
    'For Thai 96.5% jewelry, the listed sell-to-buyback spread is often about 3%–5%; add making and the real friction is higher.',
    'Break-even is the rise in buyback value needed to recover your landed cost. Not “how much gold rises”, but “how much buyback rises”. Ask before buying: if I sell tomorrow, what do I get back?'
  ] },
  { slug: 'units', tag: 'Units', title: 'Baht, grams, tola, ounces: unify first', excerpt: 'Thailand 1 baht = 15.244g; India 1 tola = 11.664g. One unit mistake can double your budget.', body: [
    'Thai gold trades in baht: 1 baht = 15.244 grams. India often uses tola: 1 tola = 11.6638125 grams. International gold uses troy ounces: 1 oz = 31.1034768 grams.',
    'Without a common unit, “cheaper” may only mean a different denominator. GoldLens converts everything to grams before comparing total cost.',
    'In Thailand, baht is both a currency and a weight. When you see “1 baht gold price”, confirm it means weight.'
  ] },
  { slug: 'purity', tag: 'Purity', title: '24K, 22K and 96.5%: what actually differs', excerpt: 'Purity changes metal value, hardness, craft and buyback. Higher is not always better for wearing.', body: [
    '24K is about 99.9% gold, 22K about 91.67%, 18K is 75%. Thai jewelry commonly uses 96.5%.',
    'Higher purity means more metal value but lower hardness, which is less suitable for complex settings and daily wear.',
    'Buyback converts purity and weight into metal value. On 18K design pieces, making often takes a larger share, making break-even harder.'
  ] },
  { slug: 'making', tag: 'Making', title: 'Making is consumption, not investment', excerpt: 'Design, craft, brand and channel are all in the making charge. On jewelry, its share matters more than gold’s daily move.', body: [
    'Making covers design, casting, finishing, brand, store and after-sales. It is what you pay for the object, not for the metal.',
    'For the same 10 grams, a plain band and a complex setting can differ 3–10× in making. Buyback usually returns none of it.',
    'If you treat jewelry as an investment, check the making share first. If you treat it as consumption, pay for the design — but do not call it investing.'
  ] },
  { slug: 'cross-border', tag: 'Cross-border', title: 'Is buying gold in Dubai really cheaper?', excerpt: 'Put flights, tax, buyback, FX and carrying risk on one table before answering.', body: [
    'Dubai gold is usually close to international metal, but add making, 5% VAT, flights, hotels, FX and carrying risk.',
    'The bigger issue is buyback: can gold bought in Dubai be sold back in Bangkok or Mumbai at local prices? Many stores only buy back their own products, or at a deeper discount.',
    'Count both the landed-price gap and the buyback gap, then subtract travel cost. In most cases, cross-border gold is a travel experience, not arbitrage.'
  ] }
];

const th: Article[] = [
  { slug: 'true-cost', tag: 'พื้นฐาน', title: 'ราคาทอง ≠ ราคารวม: ห้าบรรทัดในบิล', excerpt: 'เนื้อทอง ค่ากำเหน็จ ภาษี พรีเมียมแบรนด์ และส่วนต่างรับซื้อ เข้าใจห้าอย่างนี้ราคาทองวันนี้จะไม่หลอกคุณ', body: [
    'ราคาทองที่เห็นมักเป็นราคาเนื้อทอง ไม่ใช่ราคารวมของทองรูปพรรณ ราคารวม = เนื้อทอง + ค่ากำเหน็จ + ภาษี + พรีเมียมแบรนด์/ช่องทาง',
    'เมื่อขายคืน ร้านรับซื้อต่ำกว่าราคาเนื้อทอง และค่ากำเหน็จกับภาษีไม่คืน นี่คือต้นทุนเสียดทานที่แน่นอน',
    'GoldLens แยกบิลเป็นเนื้อทอง ค่ากำเหน็จ ภาษี รับซื้อ และจุดคุ้มทุน ไม่ต้องจำสูตร แค่ดูว่าบรรทัดไหนใหญ่ที่สุด และแยก “ฉันชอบ” ไว้อีกบรรทัด เพราะเป็นการบริโภค ไม่ใช่ผลตอบแทนลงทุน'
  ] },
  { slug: 'buyback', tag: 'รับซื้อ', title: 'ทำไมซื้อขายรอบเดียวขาดทุน 3%–15%', excerpt: 'รับซื้อมักหักจากราคาเนื้อทอง ค่ากำเหน็จและภาษีไม่คืน จุดคุ้มทุนคำนวณได้', body: [
    'ค่ากำเหน็จจ่ายตอนซื้อ ตอนรับซื้อมักคิดเฉพาะเนื้อทอง ค่ากำเหน็จจึงเหลือศูนย์ ภาษีก็เช่นกัน',
    'ทองรูปพรรณไทย 96.5% ราคาขายกับรับซื้อมักต่างกันประมาณ 3%–5% บวกค่ากำเหน็จยิ่งสูง',
    'จุดคุ้มทุนคือราคารับซื้อต้องขึ้นเท่าไรจึงคืนทุน ไม่ใช่ราคาทองขึ้นเท่าไร ก่อนซื้อถามว่า ถ้าขายพรุ่งนี้จะได้คืนเท่าไร'
  ] },
  { slug: 'units', tag: 'หน่วย', title: 'บาท กรัม โตลา ออนซ์: รวมหน่วยก่อน', excerpt: 'ไทย 1 บาท = 15.244 กรัม อินเดีย 1 โตลา = 11.664 กรัม ผิดหน่วยครั้งเดียวงบอาจ double', body: [
    'ทองไทยซื้อขายเป็นบาท 1 บาท = 15.244 กรัม อินเดียมักใช้โตลา 1 โตลา = 11.6638125 กรัม ราคาโลกใช้ทรอยออนซ์ 1 ออนซ์ = 31.1034768 กรัม',
    'ถ้าหน่วยไม่ตรง “ถูกกว่า” อาจเป็นแค่ตัวหารต่างกัน GoldLens แปลงทุกอย่างเป็นกรัมก่อนเทียบราคารวม',
    'ในไทย บาทเป็นทั้งสกุลเงินและหน่วยน้ำหนัก เมื่อเห็น “ราคาทอง 1 บาท” ให้ยืนยันว่าเป็นน้ำหนัก'
  ] },
  { slug: 'purity', tag: 'ความบริสุทธิ์', title: '24K 22K 96.5% ต่างกันอย่างไร', excerpt: 'ความบริสุทธิ์กระทบมูลค่า ความแข็ง งานฝีมือ และการรับซื้อ ไม่ใช่ยิ่งสูงยิ่งเหมาะใส่', body: [
    '24K ประมาณ 99.9% ทอง 22K ประมาณ 91.67% 18K คือ 75% ทองรูปพรรณไทยมักใช้ 96.5%',
    'ความบริสุทธิ์สูงขึ้นมูลค่าเนื้อทองสูงขึ้น แต่ความแข็งลดลง ไม่เหมาะงานฝังซับซ้อนและใส่ทุกวัน',
    'รับซื้อคิดจากความบริสุทธิ์และน้ำหนัก งาน 18K มักมีค่ากำเหน็จสูงกว่า จึงคุ้มทุนยากกว่า'
  ] },
  { slug: 'making', tag: 'ค่ากำเหน็จ', title: 'ค่ากำเหน็จคือการบริโภค ไม่ใช่การลงทุน', excerpt: 'ดีไซน์ งานฝีมือ แบรนด์ ช่องทาง รวมในค่ากำเหน็จ สำหรับทองรูปพรรณ สัดส่วนนี้สำคัญกว่าราคาทองรายวัน', body: [
    'ค่ากำเหน็จครอบคลุมดีไซน์ หล่อ ขัด แบรนด์ ร้าน และบริการหลังการขาย เป็นเงินที่จ่ายเพื่อชิ้นงาน ไม่ใช่เนื้อทอง',
    'ทอง 10 กรัมเท่ากัน วงเรียบกับงานฝังซับซ้อนอาจต่างกัน 3–10 เท่า ตอนรับซื้อมักไม่ได้คืน',
    'ถ้ามองเป็นลงทุน ดูสัดส่วนค่ากำเหน็จก่อน ถ้ามองเป็นการบริโภค จ่ายเพื่อดีไซน์ได้ แต่อย่าเรียกมันว่าลงทุน'
  ] },
  { slug: 'cross-border', tag: 'ข้ามประเทศ', title: 'ซื้อทองที่ดูไบถูกกว่าจริงหรือ?', excerpt: 'ใส่ตั๋วเครื่องบิน ภาษี รับซื้อ อัตราแลกเปลี่ยน และความเสี่ยงในการพกในตารางเดียว', body: [
    'ราคาทองดูไบมักใกล้ราคาเนื้อทองโลก แต่บวกค่ากำเหน็จ VAT 5% ตั๋ว ที่พัก อัตราแลกเปลี่ยน และความเสี่ยงพกพา',
    'สำคัญกว่าคือรับซื้อ: ทองที่ซื้อดูไบ ขายคืนที่กรุงเทพฯ หรือมุมไบได้ราคาท้องถิ่นไหม หลายร้านรับซื้อเฉพาะสินค้าตัวเองหรือหักลึกกว่า',
    'คิดทั้งส่วนต่างราคารวมและส่วนต่างรับซื้อ ลบค่าเดินทาง ส่วนใหญ่ซื้อทองข้ามประเทศคือประสบการณ์ท่องเที่ยว ไม่ใช่ arbitrage'
  ] }
];

const ar: Article[] = [
  { slug: 'true-cost', tag: 'الأساسيات', title: 'سعر الذهب ≠ التكلفة النهائية: خمسة بنود', excerpt: 'المعدن والمصنعية والضريبة وعلاوة العلامة وخصم إعادة الشراء. افهم هذه الخمسة ولن يخدعك “سعر اليوم”.', body: [
    'سعر الذهب الذي تراه عادة هو سعر المعدن لا التكلفة النهائية للمشغولات. التكلفة = المعدن + المصنعية + الضريبة + علاوة العلامة/القناة.',
    'عند البيع يعيد المتجر الشراء بأقل من سعر المعدن، ولا تعود المصنعية والضريبة. هذا احتكاك مؤكد في دورة البيع والشراء.',
    'يفصل GoldLens الفاتورة إلى معدن ومصنعية وضريبة وإعادة شراء ونقطة تعادل. لا تحتاج المعادلة؛ انظر إلى أكبر بند. وضع “أعجبني” في بند منفصل: هذه استهلاك لا عائد استثمار.'
  ] },
  { slug: 'buyback', tag: 'إعادة الشراء', title: 'لماذا تخسر الدورة 3%–15%؟', excerpt: 'إعادة الشراء تخصم من المعدن، والمصنعية والضريبة لا تعودان. نقطة التعادل قابلة للحساب.', body: [
    'تدفع المصنعية عند الشراء. عند إعادة الشراء تُقيّم عادةً المعدن فقط، فتصبح المصنعية صفراً. والضريبة كذلك.',
    'في مشغولات تايلاند 96.5% يكون فرق البيع وإعادة الشراء عادة 3%–5%؛ وبإضافة المصنعية يرتفع الاحتكاك.',
    'نقطة التعادل هي ارتفاع قيمة إعادة الشراء اللازم لاسترداد تكلفتك، وليس ارتفاع سعر الذهب. اسأل قبل الشراء: إن بعت غداً، كم أسترد؟'
  ] },
  { slug: 'units', tag: 'الوحدات', title: 'بات وغرام وتولا وأونصة: وحد أولاً', excerpt: 'تايلاند 1 بات = 15.244 غرام؛ الهند 1 تولا = 11.664 غرام. خطأ وحدة قد يضاعف ميزانيتك.', body: [
    'يتداول الذهب التايلندي بالبات: 1 بات = 15.244 غرام. الهند تستخدم التولا: 1 تولا = 11.6638125 غرام. العالمي بالأونصة: 1 أونصة = 31.1034768 غرام.',
    'بدون وحدة موحدة قد يعني “أرخص” مقاماً مختلفاً فقط. يحوّل GoldLens كل شيء إلى غرامات قبل مقارنة التكلفة.',
    'في تايلاند البات عملة ووزن معاً. عند رؤية “سعر 1 بات” تأكد أنه وزن.'
  ] },
  { slug: 'purity', tag: 'النقاء', title: '24K و22K و96.5%: ما الفرق فعلاً', excerpt: 'النقاء يغير قيمة المعدن والصلابة والحرفة وإعادة الشراء. الأعلى ليس دائماً أفضل للارتداء.', body: [
    '24K نحو 99.9% ذهب، 22K نحو 91.67%، 18K يساوي 75%. مشغولات تايلاند تستخدم 96.5% كثيراً.',
    'النقاء الأعلى يعني قيمة معدن أعلى لكن صلابة أقل، وغير مناسب للتركيبات المعقدة والاستخدام اليومي.',
    'إعادة الشراء تحول النقاء والوزن إلى قيمة معدن. في قطع 18K التصميمية تكون المصنعية أكبر، فيصعب التعادل.'
  ] },
  { slug: 'making', tag: 'المصنعية', title: 'المصنعية استهلاك لا استثمار', excerpt: 'التصميم والحرفة والعلامة والقناة كلها في المصنعية. في المشغولات نسبتها أهم من تحرك الذهب اليومي.', body: [
    'تغطي المصنعية التصميم والصب والتشطيب والعلامة والمتجر وخدمة ما بعد البيع. إنها ما تدفعه للقطعة لا للمعدن.',
    'لنفس 10 غرامات، قد تختلف حلقة بسيطة وتركيب معقد 3–10 أضعاف. إعادة الشراء لا تعيدها عادة.',
    'إن تعاملت معها كاستثمار فافحص نسبة المصنعية أولاً. وإن تعاملت معها كاستهلاك فادفع للتصميم، لكن لا تسمِّه استثماراً.'
  ] },
  { slug: 'cross-border', tag: 'عبر الحدود', title: 'هل شراء الذهب في دبي أرخص فعلاً؟', excerpt: 'ضع الطيران والضريبة وإعادة الشراء والصرف ومخاطر الحمل في جدول واحد قبل الإجابة.', body: [
    'سعر دبي قريب عادة من المعدن العالمي، لكن أضف المصنعية وضريبة 5% والطيران والإقامة والصرف ومخاطر الحمل.',
    'الأهم هو إعادة الشراء: هل يُشترى ذهب دبي في بانكوك أو مومباي بسعر محلي؟ كثير من المتاجر تشتري منتجاتها فقط أو بخصم أعمق.',
    'احسب فرق التكلفة النهائية وفرق إعادة الشراء ثم اطرح السفر. في معظم الحالات شراء الذهب عبر الحدود تجربة سفر لا مراجحة.'
  ] }
];

const articles: Record<Locale, Article[]> = { zh, en, th, ar };

export function getArticles(locale: Locale): Article[] {
  return articles[locale] ?? articles.zh;
}

export function getArticle(locale: Locale, slug: string): Article | undefined {
  return getArticles(locale).find((article) => article.slug === slug);
}
