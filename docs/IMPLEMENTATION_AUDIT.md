# GoldLens 2.1 · 实现与需求审计

**审计日期：** 2026-10-23  
**审计对象：** `docs/TECHNICAL_PLAN.md`（v1.0）、`docs/ARCHITECTURE_UPGRADE_V1.1.md`（v1.1）、`docs/GoldLens_Google_Trends_应用机会调研与MVP报告.docx`、当前 `apps/web` 实现。  
**结论：** 核心消费闭环与四语言/RTL 已可运行；文档中属于 20 周生产化的集成项仍有明确缺口，不应宣称“全部生产完成”。

---

## 1. 本轮修复的核心问题

此前实现只把导航和首页标题接入了 i18n，计算器、持仓、询价、Dealer、Admin、知识库等仍是中文。现在：

- `zh / en / th / ar` 四语言覆盖 **全部页面 chrome、表单、按钮、空状态、错误、表格、知识库 6 篇文章**。
- `<html lang dir>` 由服务端 cookie 决定；阿拉伯语 `dir="rtl"`。
- 侧边栏、内容区、表格、range 控件做了 RTL 适配；价格数字保持 LTR 隔离。
- 货币、数字、百分比、日期按 locale 格式化。
- 顶部语言切换器实测：`zh → en → ar` 触发 cookie 持久化 + 页面重载，`lang/dir/h1` 正确。
- 增加 i18n 完整性测试：四语言 key tree 必须一致；6 篇文章四语言必须齐全。

### 验证证据

| 检查 | 结果 |
|---|---|
| 12 个页面 × en/th/ar 内容区中文泄漏 | 0（唯一 `中文` 是语言选择器自身） |
| ar `dir` | `rtl`；侧边栏在右侧 |
| ar 移动端 390px | `scrollWidth = 390`，无横向滚动 |
| 语言切换 | en `lang=en/dir=ltr`；ar `lang=ar/dir=rtl`；标题同步 |
| i18n 单测 | 四语言 key tree 一致；所有 key 有非空翻译；6 篇文章齐全 |
| 全量 E2E | 虚拟数据全流程通过 |

代码位置：

- 字典与翻译：[packages/i18n/src/index.ts](<packages/i18n/src/index.ts>)
- 文章：[packages/i18n/src/articles.ts](<packages/i18n/src/articles.ts>)
- 服务端 locale：[apps/web/src/lib/i18n-server.ts](<apps/web/src/lib/i18n-server.ts>)
- 客户端 locale：[apps/web/src/components/locale-provider.tsx](<apps/web/src/components/locale-provider.tsx>)
- RTL 样式：[apps/web/src/app/globals.css](<apps/web/src/app/globals.css>)
- 测试：[apps/web/src/lib/i18n.test.ts](<apps/web/src/lib/i18n.test.ts>)

---

## 2. 需求追溯矩阵

状态：✅ 已实现且验证；◐ 部分实现/可运行但需外部服务；✗ 未实现；— 非目标。

### 2.1 调研报告的 MVP 范围

| 需求 | 状态 | 证据 / 说明 |
|---|---|---|
| 实时金价 + 汇率 + GTA 参考价 | ✅ | `market.ts`；demo 模式使用快照，live 模式接外部源 |
| 四市场（泰/阿联酋/印度/美国） | ✅ | `@goldlens/core` + `/compare` + `/api/market` |
| 四单位（baht/g/tola/oz） | ✅ | `@goldlens/core` `UNITS`；计算器可选 |
| 四纯度 | ✅ | 96.5% / 24K / 22K / 18K |
| 到手价、工费、税费、回购、回本点 | ✅ | `calcQuote` + 计算器结果卡 |
| 30D/90D/1Y 走势与区间位置 | ◐ | 有 1 年历史数据与 30 天 sparkline；无 90D/1Y 切换 UI，无 52 周位置组件 |
| 本地持仓 + 浮动盈亏 | ✅ | IndexedDB + Postgres 同步；按回购价估值 |
| 浏览器内价格提醒 | ✅ | Dexie + Postgres + Inngest 检查函数 |
| 移动端优先响应式 Web | ✅ | 390px 实测无横向滚动；底部导航 |
| 多语言全量本地化 | ✅ | 本轮补齐；原报告列为“MVP 不做”，现已超出 MVP |
| 真实交易/下单/支付 | — | 明确非目标 |
| KYC/托管/金库 | — | 明确非目标 |
| AI 金价预测/荐股 | — | 明确非目标 |
| 原生 iOS/Android | ✗ | Expo 壳未创建；PWA 已可用 |

### 2.2 技术方案 v1.0 / v1.1

| 需求 | 状态 | 证据 / 说明 |
|---|---|---|
| Next.js 16 模块化单体 | ✅ | `apps/web` + `packages/*` |
| 共享 core 包 | ✅ | `packages/core`，Decimal 计算 + 5 条测试 |
| PostgreSQL + Drizzle | ◐ | PGlite 本地 / `DATABASE_URL` 生产；schema 与 `BOOTSTRAP_SQL`；未接 Drizzle migration 流程 |
| Auth.js + 账户 | ◐ | Credentials + JWT + Google 可选；Passkeys/2FA 未接 |
| RBAC（user/dealer/admin） | ✅ | 页面与 `/api/dealer/quotes` 检查角色；无独立策略引擎 |
| Local-first | ◐ | IndexedDB + 服务端权威写；ElectricSQL shape 未接 |
| Inngest durable workflows | ◐ | 4 个函数 + `/api/inngest` + CI 构建；未连 Inngest Cloud/Dev Server |
| AI Gateway | ◐ | AI SDK 6 + Gateway 代码路径；demo 下强制规则解析；无 OCR/收据上传 UI |
| Dealer Portal | ✅ | 报价提交、待响应询价、有效报价表 |
| Admin Console | ✅ | 统计、数据健康、RBAC |
| 订阅/支付 | ◐ | Stripe Checkout 代码 + demo 模式；未用真实 key 验证 |
| PWA | ✅ | manifest、SW、离线 shell、安装元数据；Web Push 未接 |
| 四语言 + RTL | ✅ | 本轮补齐；cookie 持久化；文章也翻译 |
| next-intl / 路径式 locale | ✗ | 当前是轻量字典 + cookie，不是 next-intl，也没有 `/en`、`/th`、`/ar` 路径 |
| hreflang / 程序化落地页 | ✗ | 只有 sitemap/robots；没有 locale 路径与市场×纯度落地页 |
| JSON-LD | ✗ | 未接 FAQPage/Product/Breadcrumb |
| 暗/亮主题 | ◐ | 只有深色主题；文档要求提供浅色 |
| shadcn/Base UI/Motion | ◐ | 使用自定义 CSS 组件与原生交互；未引入这些库 |
| 分享卡（1080×1350） | ✗ | 未实现 |
| 分析事件（calc_complete 等） | ✗ | 未接 PostHog/事件表 |
| 可观测性（Sentry/OTel/Checkly） | ◐ | `/api/health`、`/status`；未接 APM |
| 安全（CSP/限流/Turnstile/审计） | ◐ | 安全头、CSP、角色检查、密钥隔离；限流/Turnstile/审计查询未接 |
| ElectricSQL | ✗ | 本地优先用 Dexie + API；未接 Electric 服务 |
| Expo 原生壳 | ✗ | 未创建 |
| 20 周交付/10 家 Dealer | ✗ | 代码切片完成，不是 20 周日历交付；只有 seed Dealer |

---

## 3. 已修复的文档不一致

| 文档要求 | 之前 | 现在 |
|---|---|---|
| 文案不写在组件里 | 大量中文硬编码 | 全部 UI 文案走字典；源码扫描无中文 UI 字面量 |
| zh/en/th/ar + RTL | 只有 nav/home | 全页面 + 文章 + RTL |
| 数字/货币/日期按 locale | 固定 en-US/zh-CN | `formatMoney/Number/Pct/Date` 接受 locale；页面传 `intl` |
| 账户页语言偏好 | 只显示文案 | 显示当前 locale；顶部切换器持久化 |
| 阿拉伯语布局 | 未测试 | 1440/390 实测；侧边栏右侧、range LTR、价格 LTR |
| 文章多语言 | 仅中文 | 6 篇 × 4 语言 |

---

## 4. 仍缺的生产化项（按优先级）

### P0 — 上线前必须

1. **真实 Postgres migration**：当前 `BOOTSTRAP_SQL` 适合本地/POC，生产应改为 Drizzle migration + 审核 + 回滚。
2. **限流 / Turnstile / 审计查询**：`/api/ai/parse`、`/api/quote-requests`、登录需要速率限制；Admin 需要审计日志页面。
3. **Dealer 审核闭环**：报价签名、Admin 审核、过期任务、争议处理。
4. **可观测性**：Sentry + OpenTelemetry + 每源 SLO；当前只有 health/status。
5. **真实 key 验证**：Stripe、AI Gateway、Inngest Cloud 尚未用真实凭据验收。

### P1 — 体验与增长

1. 路径式 locale（`/en`、`/th`、`/ar`）+ hreflang + canonical。
2. JSON-LD（FAQPage、BreadcrumbList；真实报价才加 Product/Offer）。
3. 程序化落地页（市场 × 纯度 × 单位 × 场景）。
4. 90D/1Y 走势切换、52 周区间位置。
5. 分享卡 / OG 图生成。
6. 浅色主题与设计 token 双主题验收。
7. PostHog 事件：`calc_complete`、`compare_view`、`quote_request`、`holding_add`、`alert_create`。

### P2 — 规模化

1. ElectricSQL shape 同步（公开价格/报价）。
2. Expo 原生壳 + Web Push。
3. Passkeys/WebAuthn + 2FA。
4. 真实 Dealer 10 家试点、24h 响应 SLA。
5. 多市场税务/合规内容审校（泰/阿/印/美）。

---

## 5. 验收命令

```bash
pnpm test
pnpm --filter @goldlens/web test
pnpm test:e2e          # 需先 pnpm dev / pnpm start
pnpm build
```

本轮新增/更新的验收：

- `apps/web/src/lib/i18n.test.ts`：四语言 key tree 一致性、非空翻译、6 篇文章齐全。
- `scripts/visual-i18n.mjs`：en/th/ar 截图 + `lang/dir/CJK` 检查。
- 语言切换实测：zh → en → ar。

---

## 6. 结论

“多语言”不是加一个下拉框，而是 **文案、格式化、RTL、知识库、测试** 全部到位。本轮已补齐这些代码侧项；但技术方案中的生产化集成（ElectricSQL、Passkeys、Sentry、真实 Dealer 审核、路径式 SEO）仍未完成，不能把“可运行切片”说成“20 周生产版全部交付”。这份审计用于把剩余工作显式化，而不是用“已完成”掩盖缺口。
