# -*- coding: utf-8 -*-
"""Technical plan, part 2: stack, data, core, API, frontend."""


def add(P):
    P.h1('05', '技术栈', '用一套类型系统，把前端、BFF、worker 和数据库连起来。')

    P.h2('5.1', '前端')
    P.table(
        '表 5-1 · 前端栈',
        ['能力', '选择', '用途', '注意'],
        [
            ['框架', 'Next.js 16 App Router', 'RSC、路由、ISR、BFF', '避免把全部页面做成 client component'],
            ['UI', 'React 19 + TypeScript strict', '组件、并发、类型安全', '禁止 any 进入 core'],
            ['样式', 'Tailwind CSS v4 + CSS variables', '设计 token、暗/亮主题', '不要散落 magic color'],
            ['组件', 'shadcn/ui + Radix', 'Dialog、Select、Tabs、Toast', '二次封装成 GoldLens primitives'],
            ['数据', 'TanStack Query', '客户端缓存、重试、乐观更新', '价格用 SSE 推送，不轮询'],
            ['表单', 'React Hook Form + Zod', '计算器/报价/登录表单', '前后端共用 schema'],
            ['图表', 'Recharts / visx', '价格、成本瀑布、区间', '首屏不加载大图表库'],
            ['动效', 'Motion', '页面转场、数字滚动', '尊重 prefers-reduced-motion'],
            ['国际化', 'next-intl', 'zh/en/th/ar、RTL', '文案不写在组件里'],
            ['PWA', 'Serwist', '离线 shell、安装、缓存策略', 'API 不做 cache-first'],
        ],
        [2.0, 5.0, 5.4, 4.2],
        font_size=7.7
    )

    P.h2('5.2', '后端与数据')
    P.table(
        '表 5-2 · 后端栈',
        ['能力', '选择', '用途'],
        [
            ['API/BFF', 'Next.js Route Handlers', 'REST v1、SSE、webhook、文件签名'],
            ['校验', 'Zod + OpenAPI', '请求/响应契约、SDK 生成'],
            ['ORM', 'Drizzle ORM + drizzle-kit', '类型安全 SQL、迁移、seed'],
            ['数据库', 'PostgreSQL 17（Neon）', '事实源、分区、PITR、只读副本'],
            ['缓存', 'Upstash Redis', '价格缓存、限流、幂等键、会话'],
            ['队列', 'QStash / BullMQ', '报价分发、提醒、重算、导出'],
            ['对象存储', 'Cloudflare R2', '收据、报价单、导出、图片'],
            ['Worker', 'Node 24 + TypeScript', '抓取、归一化、通知、排名'],
        ],
        [2.6, 6.0, 8.0],
        font_size=7.9
    )

    P.h2('5.3', '认证、支付与通知')
    P.table(
        '表 5-3 · 外部能力',
        ['能力', '选择', '首期范围', '后续'],
        [
            ['认证', 'Auth.js v5', 'Google/Apple/Email magic link', 'Phone OTP、Passkey'],
            ['订阅', 'Stripe Billing', 'Pro 月/年付、发票、webhook', '本地支付方式'],
            ['泰国支付', 'Omise / Stripe', 'PromptPay、卡', 'TrueMoney'],
            ['邮件', 'Resend', '登录、提醒、收据', '模板本地化'],
            ['推送', 'Web Push（VAPID）', '价格提醒', 'iOS PWA 限制处理'],
            ['即时消息', 'LINE Messaging API', '泰国提醒/分享', 'WhatsApp Cloud API'],
            ['客服', 'Intercom / Crisp', '帮助中心、工单', 'Dealer 专属 SLA'],
        ],
        [2.6, 5.0, 5.4, 3.6],
        font_size=7.8
    )

    P.h2('5.4', '可观测性与分析')
    P.table(
        '表 5-4 · 观测栈',
        ['层', '工具', '用途'],
        [
            ['错误', 'Sentry', '前端/后端异常、release 关联'],
            ['指标/追踪', 'OpenTelemetry + Axiom/Grafana', 'p95、错误率、队列积压'],
            ['合成监控', 'Checkly', '关键路径每分钟探测'],
            ['产品分析', 'PostHog', '漏斗、cohort、实验'],
            ['日志', '结构化 JSON + trace_id', '请求链路、审计'],
            ['告警', 'PagerDuty / Slack', 'SLO 燃烧率、数据源失败'],
        ],
        [2.6, 6.0, 8.0],
        font_size=7.9
    )

    P.h2('5.5', '工程工具')
    P.bullets([
        '包管理：pnpm + Turborepo；锁文件提交，CI 使用 frozen lockfile。',
        '代码质量：TypeScript strict、Biome（lint+format）、import 边界规则。',
        '测试：Vitest、Testing Library、Playwright、axe、k6。',
        '提交：Conventional Commits、Changesets、release-please。',
        '安全：Dependabot、CodeQL、secret scanning、npm audit（仅阻断 high）。',
        '文档：ADR、OpenAPI、Storybook、runbook。',
    ])

    P.h2('5.6', '版本与升级策略')
    P.p('每季度一次依赖升级窗口；Next.js/React/Postgres 只升一个 major，先在 preview 跑 1 周。所有第三方 SDK 用适配器隔离，避免供应商锁定。Node 版本固定在 24 LTS，CI 与生产一致。')


    P.h1('06', '数据架构', '价格不是一条记录，而是一条有来源、有时间的证据链。')

    P.p('GoldLens 的数据模型以“可追溯的价格”为中心：价格快照保留来源、抓取时间、置信度；门店报价保留有效期、验证状态与排名理由；用户持仓保留成本、来源与收据。所有金额、重量、纯度都有规范单位，展示层再做本地化。')
    P.image('data-model.png', '图 6-1 · 核心数据模型：用户、市场、价格快照、门店报价、持仓、提醒与审计。', 16.4)

    P.h2('6.1', '规范单位与金额')
    P.table(
        '表 6-1 · 数据规范',
        ['字段', '规范', '示例', '禁止'],
        [
            ['重量', 'weight_g numeric(18,6)，克', '15.244000', '在 DB 存 baht/tola'],
            ['纯度', 'purity numeric(6,5)，0–1', '0.96500', '存 “96.5%” 字符串'],
            ['金额', 'amount_minor bigint + currency', '6500000 THB minor', 'float/double'],
            ['价格', 'price numeric(18,6) + quote_currency', '4024.10 USD/oz', '混用盎司/克'],
            ['时间', 'timestamptz，UTC', '2026-10-23T05:11:00Z', '本地时间无时区'],
            ['单位', 'unit enum: g / baht / tola / oz', 'baht', '前端自由字符串'],
        ],
        [2.4, 7.0, 4.2, 3.0],
        font_size=7.9
    )

    P.h2('6.2', '核心表')
    P.table(
        '表 6-2 · 核心表与关键字段',
        ['表', '作用', '关键字段', '索引/约束'],
        [
            ['users', '账户', 'id, email, locale, created_at', 'unique(email)'],
            ['profiles', '偏好', 'user_id, market, goal, units', 'unique(user_id)'],
            ['markets', '市场规则', 'code, currency, tax_rule, active', 'unique(code)'],
            ['price_snapshots', '价格快照', 'market, source, price, unit, observed_at, confidence', '(market, observed_at desc)'],
            ['dealers', '经销商', 'name, status, city, verified_at', 'index(city, status)'],
            ['dealer_branches', '门店', 'dealer_id, geo, hours', 'gist(geo)'],
            ['dealer_quotes', '门店报价', 'dealer_id, purity, buy/sell, making, tax, expires_at', '(dealer_id, expires_at)'],
            ['quote_requests', '用户询价', 'user_id, market, weight_g, purity, status', '(user_id, created_at)'],
            ['quote_rankings', '排名快照', 'quote_id, score, reasons', 'unique(quote_id)'],
            ['holdings', '持仓', 'user_id, grams, purity, cost_minor, dealer_id', '(user_id)'],
            ['alerts', '提醒', 'user_id, metric, comparator, threshold, channels', '(user_id, status)'],
            ['subscriptions', '订阅', 'user_id, plan, status, period_end', '(user_id, status)'],
            ['audit_logs', '审计', 'actor, action, entity, before/after', '(entity, created_at)'],
        ],
        [2.8, 3.4, 7.2, 3.2],
        font_size=7.4
    )

    P.h2('6.3', '价格快照')
    P.p('价格快照是 append-only 的。每次抓取写一条，不做 update；对外只读“最新有效快照”。这样可以回溯“当时为什么算出这个价”，也可以做数据质量分析。')
    P.code('''price_snapshots
  id              uuid pk
  market_code     text fk markets.code
  source          text            -- gold-api / gta / dealer_x
  source_url      text
  kind            text            -- spot / local_bar / local_ornament / fx
  price           numeric(18,6)
  currency        char(3)
  unit            text            -- oz / g / baht / tola
  purity          numeric(6,5)
  observed_at     timestamptz
  ingested_at     timestamptz
  confidence      numeric(4,3)    -- 0–1
  raw_payload     jsonb
  checksum        text
  created_at      timestamptz default now()''')

    P.h2('6.4', '门店报价')
    P.p('门店报价不是“价格表”，而是一份有有效期的商业要约。每条报价必须能回答：谁报的、什么时候有效、含不含工费/税、回购价是多少、是否验证过。')
    P.code('''dealer_quotes
  id              uuid pk
  dealer_id       uuid fk dealers.id
  branch_id       uuid fk dealer_branches.id
  market_code     text
  product_type    text            -- bar / jewelry / coin
  purity          numeric(6,5)
  weight_g        numeric(18,6)
  sell_price_minor bigint
  buyback_minor   bigint
  making_charge_bps integer       -- 基点，避免浮点
  tax_bps         integer
  currency        char(3)
  effective_at    timestamptz
  expires_at      timestamptz
  verification    text            -- self_reported / verified / audited
  source          text            -- portal / csv / api
  notes           text''')

    P.h2('6.5', '数据接入管线')
    P.bullets([
        'Scheduler：spot 每 60 秒，FX 每小时，GTA 每 5 分钟，Dealer feed 每 15 分钟；全部带 jitter。',
        'Fetch：每个 source 独立 adapter，统一输出 RawPrice；超时 8 秒、重试 3 次、指数退避。',
        'Normalize：单位/纯度/币种归一化到克、0–1、ISO 货币；记录原始 payload 与 checksum。',
        'Validate：非空、正数、时间新鲜、跨源偏差、异常跳变；不通过进 quarantine。',
        'Persist：append-only 写 price_snapshots；冲突用 (source, observed_at) 幂等。',
        'Publish：刷新 Redis、发事件、更新 SSE；失败重试 + DLQ。',
        'Observe：source health、freshness、outlier rate、DLQ 深度进仪表盘。',
    ], numbered=True)

    P.h2('6.6', '新鲜度与数据质量')
    P.table(
        '表 6-3 · 数据 SLO',
        ['数据', '目标新鲜度', '告警阈值', '降级'],
        [
            ['XAU/USD spot', '< 60s', '> 3min', '显示最近快照 + “延迟”'],
            ['USD/THB / AED / INR', '< 2h', '> 12h', '使用上一日中间价'],
            ['GTA 泰国', '< 10min', '> 30min', '显示“GTA 快照”'],
            ['Dealer 报价', '< 24h', '> 48h', '标记过期，不参与排名'],
            ['历史日线', '每日 1 次', '缺 2 天', '使用缓存，标注'],
        ],
        [4.0, 3.4, 3.2, 5.4],
        font_size=8.0,
        align_center={1, 2}
    )
    P.bullets([
        '异常跳变：5 分钟内 > 8% 的价格变动需要二次源确认，否则只记录不对外。',
        '跨源偏差：spot 与 GTA 折算价偏差 > 3% 时，前端显示“数据分歧”，不选一个假装正确。',
        '缺失值：不允许用 0 或上一日价格静默填充；必须标记 `stale` 与 `source`。',
    ])

    P.h2('6.7', '缓存、分区与保留')
    P.table(
        '表 6-4 · 缓存与保留',
        ['对象', '策略', 'TTL', '说明'],
        [
            ['market:latest:{market}', 'Redis string', '60s', '最新快照 JSON'],
            ['fx:latest', 'Redis hash', '1h', '币种表'],
            ['quote:{id}', 'Redis string', '5min', '报价详情'],
            ['rate:{ip}:{route}', 'Redis counter', '60s', '限流'],
            ['price_snapshots', '按月分区', '24 个月', '归档到 R2'],
            ['audit_logs', '按季度分区', '7 年', '合规/审计'],
            ['receipts', 'R2 生命周期', '7 年', '用户可删除'],
        ],
        [5.0, 4.2, 2.6, 4.4],
        font_size=7.9
    )

    P.callout('数据原则', '宁可显示“快照/延迟/分歧”，也不要显示一个看起来精确、实际错误的数字。黄金是钱，信任只有一次。')


    P.h1('07', '领域核心', '把“算得对”从 UI 里拿出来，变成可测试的资产。')

    P.h2('7.1', '@goldlens/core 的边界')
    P.code('''packages/core/
├── units.ts          # g / baht / tola / oz 转换
├── purity.ts         # 24K / 22K / 18K / 96.5%
├── money.ts          # Decimal 运算、舍入、币种
├── quote.ts          # 到手价、工费、税、回购、回本
├── ranking.ts        # dealer quote 排名
├── rules/
│   ├── th.ts         # 泰国 96.5% / GTA
│   ├── ae.ts         # 阿联酋 22K / VAT
│   ├── in.ts         # 印度 22K / GST
│   └── us.ts         # 美国 24K
└── index.ts''')

    P.h2('7.2', '计算口径')
    P.code('''金料价值 = 金价(USD/oz) ÷ 31.1034768 × 汇率 × 克重 × 纯度
到手价   = 金料价值 + 工费/溢价 + 税费
即时回购 = 本地回购价 × 重量（或 金料价值 × (1 − 回购折价)）
回本涨幅 = 到手价 ÷ 即时回购 − 1''')
    P.p('实现上使用 decimal.js（或 big.js），禁止 JavaScript float 直接做金额。所有中间结果保留 6 位小数，最终按币种最小单位舍入；舍入规则显式写在 rules 里，并在测试中锁定。')

    P.h2('7.3', '市场规则配置')
    P.code('''{
  "market": "TH",
  "currency": "THB",
  "purityDefault": 0.965,
  "unitDefault": "baht",
  "tax": { "type": "none", "bps": 0 },
  "making": { "mode": "gta_implied", "defaultBps": 0 },
  "buyback": { "mode": "gta_ornament", "spreadBps": 350 },
  "fairness": { "lowBps": 200, "midBps": 500, "highBps": 1000 },
  "disclaimerKey": "th.gold.reference"
}''')
    P.p('规则是版本化的：`rules/th@2026-10.json`；每次修改都要有生效日期、变更原因、测试向量。计算结果里带 `rule_version`，便于审计与回放。')

    P.h2('7.4', '测试向量')
    P.table(
        '表 7-1 · 核心测试向量（2026-10-23 12:11 GTA）',
        ['用例', '输入', '期望', '说明'],
        [
            ['泰国金饰', '1 baht, 96.5%, GTA ornament', '65,000 THB', '到手价锚'],
            ['泰国回购', '1 baht, 96.5%, GTA buy', '62,716.92 THB', '回购价'],
            ['泰国隐形成本', '标价 − 回购', '2,283.08 THB / 3.5%', '一买一卖'],
            ['泰国回本', '65,000 / 62,716.92 − 1', '3.64%', '金价需上涨'],
            ['阿联酋', '1g, 22K, AED, making 12%, VAT 5%', '≈ AED 512', '估算'],
            ['印度', '10g, 24K, INR, making 12%, GST 3%', '≈ ₹141,523', '估算'],
            ['单位', '1 baht', '15.244 g', '规范转换'],
            ['单位', '1 tola', '11.6638125 g', '规范转换'],
        ],
        [3.4, 6.6, 4.0, 2.6],
        font_size=7.7
    )

    P.h2('7.5', '边界情况')
    P.bullets([
        '重量为 0 / 负数 / 超过 1000g：拒绝，返回 `VALIDATION_ERROR`。',
        '纯度不在支持列表：拒绝；不要“四舍五入到 22K”。',
        '报价过期：不参与排名，前端标“已过期”。',
        '回购价为 0：显示“暂无回购价”，不回退到金料价。',
        '汇率缺失：整笔计算不可用，显示“汇率暂不可用”，不猜。',
        '舍入：先按最小单位四舍五入，再展示；避免 0.01 的累计误差。',
    ])

    P.h2('7.6', '排名算法（可解释）')
    P.p('Dealer 报价排名不按佣金。V1 使用五项加权：到手价 40%、回购价 25%、距离/便利 15%、验证等级 10%、新鲜度 10%。每项归一化到 0–100，输出 `score` 与 `reasons`，前端展示“为什么排第一”。')
    P.code('''score = 0.40 * priceScore
      + 0.25 * buybackScore
      + 0.15 * proximityScore
      + 0.10 * verificationScore
      + 0.10 * freshnessScore
// priceScore = 100 * (maxAllIn - quoteAllIn) / (maxAllIn - minAllIn)''')
    P.p('付费推广只能出现在明确标注的“赞助”位，不改变自然排名。这条规则写进 Dealer 合同与 Admin 审计。')


    P.h1('08', 'API 与集成', '前后端共用一份契约，第三方永远隔在 adapter 后面。')

    P.h2('8.1', 'API 原则')
    P.bullets([
        'REST/JSON，版本前缀 `/api/v1`；破坏性变更升 v2，不静默改字段。',
        'Zod 定义请求/响应，生成 OpenAPI 与 TypeScript SDK。',
        '统一错误 envelope：`{ error: { code, message, requestId, details } }`。',
        '所有写操作支持 `Idempotency-Key`；报价/提醒/支付 webhook 必须幂等。',
        '读接口用 ETag + `Cache-Control`；价格读走 SSE，不轮询。',
        '服务端永远重新计算价格/权限，不信任前端传来的金额。',
    ])

    P.h2('8.2', '核心端点')
    P.table(
        '表 8-1 · API v1',
        ['方法', '路径', '鉴权', '用途'],
        [
            ['GET', '/api/v1/market/overview', 'public', '市场、spot、FX、GTA、更新时间'],
            ['GET', '/api/v1/market/history', 'public', '30D/90D/1Y 日线'],
            ['POST', '/api/v1/quote/calculate', 'public', '纯计算，不落库'],
            ['GET', '/api/v1/dealers', 'public', '按城市/纯度/重量筛选'],
            ['POST', '/api/v1/quote-requests', 'user', '提交询价'],
            ['GET', '/api/v1/quote-requests/:id', 'user', '查看报价与排名'],
            ['POST', '/api/v1/dealer/quotes', 'dealer', 'Dealer 提交报价'],
            ['GET/POST', '/api/v1/holdings', 'user', '持仓 CRUD'],
            ['GET/POST', '/api/v1/alerts', 'user', '提醒 CRUD'],
            ['POST', '/api/v1/billing/checkout', 'user', 'Stripe Checkout'],
            ['POST', '/api/v1/webhooks/stripe', 'signature', '订阅事件'],
            ['GET', '/api/v1/events/prices', 'public', 'SSE 价格流'],
        ],
        [1.4, 6.4, 2.4, 6.4],
        font_size=7.6
    )

    P.h2('8.3', '计算请求示例')
    P.code('''POST /api/v1/quote/calculate
{
  "market": "TH",
  "purity": 0.965,
  "weight": 1,
  "unit": "baht",
  "makingBps": 0,
  "taxBps": 0
}

200 OK
{
  "input": { "...": "..." },
  "money": {
    "currency": "THB",
    "metalMinor": 6420000,
    "makingMinor": 80000,
    "taxMinor": 0,
    "totalMinor": 6500000,
    "buybackMinor": 6271692
  },
  "percent": {
    "premiumBps": 135,
    "instantLossBps": 351,
    "breakEvenBps": 364
  },
  "provenance": {
    "spotSource": "gold-api.com",
    "localSource": "GTA",
    "observedAt": "2026-10-23T05:11:00Z",
    "ruleVersion": "th@2026-10"
  }
}''')

    P.h2('8.4', '实时价格：SSE 而不是轮询')
    P.p('`GET /api/v1/events/prices?market=TH` 返回 `text/event-stream`，每 30 秒或价格变化时推送 `market.tick`。BFF 从 Redis 读最新快照；连接断开自动重连；页面隐藏时降频。SSE 比 WebSocket 简单，足够覆盖价格看板。')

    P.h2('8.5', 'Webhook 与外部集成')
    P.table(
        '表 8-2 · 集成边界',
        ['集成', '方向', '安全', '失败处理'],
        [
            ['Stripe', '入站 webhook', '签名校验 + 重放保护', '幂等 + 重试'],
            ['LINE / WhatsApp', '出站', 'token 轮换', '队列重试 + 降级邮件'],
            ['Dealer CSV/API', '入站', '签名/白名单 + 字段校验', '隔离 + 人工审核'],
            ['GTA', '入站抓取', '限频 + UA + 缓存', '快照 + 告警'],
            ['Gold/FX', '入站 API', 'key + timeout', '快照 + 降级'],
        ],
        [3.0, 2.2, 5.6, 5.8],
        font_size=7.8
    )

    P.h2('8.6', '限流、幂等与错误码')
    P.table(
        '表 8-3 · 错误码',
        ['HTTP', 'code', '场景', '前端动作'],
        [
            ['400', 'VALIDATION_ERROR', '参数不合法', '字段级提示'],
            ['401', 'AUTH_REQUIRED', '未登录', '打开登录'],
            ['402', 'ENTITLEMENT_REQUIRED', 'Pro 权益', '展示升级'],
            ['404', 'MARKET_UNSUPPORTED', '市场未开放', '切换市场'],
            ['409', 'QUOTE_EXPIRED', '报价过期', '刷新报价'],
            ['429', 'RATE_LIMITED', '限流', '退避 + 提示'],
            ['503', 'UPSTREAM_UNAVAILABLE', '数据源/支付不可用', '显示快照/重试'],
        ],
        [1.6, 5.2, 6.0, 3.8],
        font_size=7.9,
        align_center={0}
    )


    P.h1('09', '前端与体验', '把“贵金属”做成“安静的信任”，不是“金色的喧嚣”。')

    P.h2('9.1', '设计方向')
    P.p('关键词：安静、克制、可读、有触感。80% 中性色（墨黑/米白/石灰），20% 金色只用于价格、关键动作和状态；数据用无衬线，叙事用衬线；动效只用于解释变化，不用于装饰。')
    P.bullets([
        '视觉：深色为默认，提供浅色；金色是“证据”，不是背景。',
        '排版：大数字用 tabular-nums；单位、币种、更新时间永远紧跟数字。',
        '信息：先给结论，再给拆解；先给“到手价/回购价”，再给公式。',
        '语气：不承诺、不恐吓、不喊单；用“参考/估算/以门店为准”。',
    ])

    P.h2('9.2', '设计 token')
    P.table(
        '表 9-1 · 设计 token（节选）',
        ['Token', '值', '用途'],
        [
            ['--bg', '#0A0C0B', '页面背景'],
            ['--surface', '#121512', '卡片'],
            ['--ink', '#F4F0E6', '主文字'],
            ['--muted', '#A9A99C', '次文字'],
            ['--gold', '#E5C46B', '价格/主 CTA'],
            ['--positive', '#8FBD9A', '上涨/正向'],
            ['--negative', '#D98D7C', '下跌/风险'],
            ['--radius-lg', '22px', '卡片'],
            ['--shadow', '0 30px 80px rgba(0,0,0,.35)', '浮层'],
        ],
        [3.4, 7.2, 6.0],
        font_size=8.0
    )

    P.h2('9.3', '信息架构')
    P.code('''/                         今日金价 + 快速计算 + 市场脉搏
/calculate                真实成本计算器
/compare                  跨市场 / 跨纯度 / 跨门店
/quotes                   询价与报价对比
/dealers/[city]           门店目录与详情
/portfolio                持仓与盈亏
/alerts                   价格提醒
/learn/[slug]             单位/纯度/税/回购/防坑
/account                  偏好/订阅/数据权利
/dealer/*                 Dealer Portal
/admin/*                  Admin Console''')

    P.h2('9.4', '页面规格')
    P.table(
        '表 9-2 · 关键页面',
        ['页面', '主任务', '核心组件', '成功事件'],
        [
            ['Home', '30 秒内理解“今天买金贵不贵”', '价格头图、市场切换、迷你计算器、趋势', 'start_calc'],
            ['Calculate', '算出到手价/回购/回本', '市场/纯度/重量、成本瀑布、结果卡', 'calc_complete'],
            ['Compare', '同口径比较', '对比表、价差、到店 CTA', 'compare_view'],
            ['Quotes', '拿到可比较报价', '需求表单、报价卡、排名理由', 'quote_request'],
            ['Portfolio', '知道手里的金值多少', '汇总、持仓表、回购估值', 'holding_add'],
            ['Alerts', '不用一直刷', '目标价、渠道、触发历史', 'alert_create'],
            ['Learn', '建立信任/SEO', '长文、FAQ、结构化数据', 'learn_read'],
            ['Account', '偏好/订阅/数据', '登录、语言、货币、导出/删除', 'subscription_start'],
        ],
        [2.0, 5.0, 5.6, 4.0],
        font_size=7.8
    )

    P.h2('9.5', '组件与状态')
    P.bullets([
        'Primitives：Button、Input、Select、Tabs、Dialog、Sheet、Toast、Tooltip、Skeleton。',
        'Domain：PriceTicker、MarketSwitcher、CostWaterfall、BuybackCard、QuoteCard、HoldingRow。',
        '状态：loading（骨架）、empty（解释 + 下一步）、error（可重试）、offline（本地数据）、stale（时间戳）。',
        '乐观更新：持仓/提醒先本地写入，失败回滚并提示。',
    ])

    P.h2('9.6', '移动端与 PWA')
    P.p('移动端是主战场：底部导航（首页/计算/对比/持仓/我的），计算器单列，结果卡 sticky；安装引导在第二次访问后出现；分享卡生成 1080×1350 的“标价 vs 回购”图。PWA 缓存 shell 与最近市场快照，离线可计算、可看持仓。')

    P.h2('9.7', '可访问性与性能预算')
    P.table(
        '表 9-3 · 体验预算',
        ['维度', '目标', '验证'],
        [
            ['LCP', '< 2.5s（4G）', 'Lighthouse CI'],
            ['INP', '< 200ms', 'RUM + Playwright'],
            ['CLS', '< 0.1', 'Lighthouse'],
            ['JS（首屏）', '< 180KB gzip', 'bundle analyzer'],
            ['可访问性', 'WCAG 2.2 AA', 'axe + 手动键盘'],
            ['对比度', '≥ 4.5:1', 'token 审查'],
            ['减少动效', 'prefers-reduced-motion', 'E2E'],
        ],
        [3.0, 6.0, 7.6],
        font_size=8.0
    )

    P.h2('9.8', 'SEO、i18n 与内容')
    P.bullets([
        '程序化落地页：市场 × 纯度 × 单位 × 场景（如 `/th/gold-price-22k-per-gram`）。',
        'JSON-LD：FAQPage、Product/Offer（仅对真实报价）、BreadcrumbList。',
        'hreflang：zh-CN / en / th / ar；RTL 从 day 1 用 logical properties。',
        '内容：单位解释、工费谈判、回购折价、以旧换新、旅游买金防坑。',
        '每页必须有：来源、更新时间、免责声明、最后审核人。',
    ])

    P.h2('9.9', '分析事件')
    P.table(
        '表 9-4 · 事件 schema（节选）',
        ['事件', '属性', '用途'],
        [
            ['market_view', 'market, source', '市场偏好'],
            ['calc_complete', 'market, purity, unit, total, premium_bps', '激活/定价'],
            ['compare_view', 'markets, spread_bps', '比较价值'],
            ['quote_request', 'market, weight, purity, dealers', '供给需求'],
            ['holding_add', 'market, grams, cost', '留存'],
            ['alert_create', 'metric, threshold, channel', '订阅意向'],
            ['subscription_start', 'plan, market, trial', '收入'],
        ],
        [3.6, 8.0, 5.0],
        font_size=7.9
    )

