# GoldLens 金价透视

[![CI](https://github.com/death1024/goldlens-mvp/actions/workflows/ci.yml/badge.svg)](https://github.com/death1024/goldlens-mvp/actions/workflows/ci.yml)

> 买金之前，先看清真实成本。

**GoldLens 2.1** 是一个可运行的黄金购买决策应用：把国际金价、泰国 GTA 柜台价、工费、税费、回购折价和回本点，放进同一张账单。它不托管、不交易、不提供投资建议。

- **v2.1 App**：Next.js 16 + React 19 + Postgres/PGlite + Auth.js + IndexedDB + Inngest + AI SDK 6
- **v1.1 架构方案**：[PDF](docs/GoldLens_2.1_架构优化方案.pdf) · [Markdown](docs/ARCHITECTURE_UPGRADE_V1.1.md)
- **v1.0 技术方案**：[PDF](docs/GoldLens_2.0_技术方案.pdf) · [Markdown](docs/TECHNICAL_PLAN.md)
- **调研报告**：[PDF](docs/GoldLens_Google_Trends_应用机会调研与MVP报告.pdf)
- **旧版静态 Demo**：https://death1024.github.io/goldlens-mvp/

![GoldLens 首页](docs/screenshots/v21-home.png)

---

## 快速开始

要求：Node.js 24+、pnpm 11+。

```bash
pnpm install
pnpm dev
# http://localhost:3000
```

本地开发默认使用 **PGlite**（WASM Postgres），首次启动自动建表并 seed，数据在 `.data/pglite/`。无需安装 Postgres、无需 API key。

默认 `GOLDLENS_MODE=demo`：行情使用内置快照、AI 使用规则解析、Stripe 走 demo 升级，不会调用任何外部计费服务，也不会消耗你的 API key。确认全流程后再切换到 `live`。

### 演示账号

| 角色 | 邮箱 | 密码 |
|---|---|---|
| 消费者 | `demo@goldlens.app` | `goldlens` |
| Dealer | `dealer@goldlens.app` | `goldlens` |
| Admin | `admin@goldlens.app` | `goldlens` |

登录页也支持任意新邮箱 + 密码 `goldlens` 创建演示消费者账户。生产环境替换为 Google / Apple / Passkeys。

### 生产模式

```bash
pnpm build
pnpm start
```

生产数据库：

```bash
DATABASE_URL=postgres://user:pass@host:5432/goldlens
```

启动时会自动执行 `BOOTSTRAP_SQL`（`CREATE TABLE IF NOT EXISTS`），并 seed 市场/Dealer/示例报价。正式环境建议改为 Drizzle migration + 审核流程。

### Docker

```bash
docker compose up --build
# http://localhost:3000
```

`docker-compose.yml` 使用 Postgres 18；`apps/web/Dockerfile` 为 Next standalone 构建。

---

## 已实现的功能

| 模块 | 状态 | 说明 |
|---|---|---|
| 真实成本计算器 | ✅ | 金料、工费、税、到手价、回购、回本点；`@goldlens/core` 纯函数 + 测试向量 |
| 四市场 | ✅ | 泰国 96.5%/THB、阿联酋 22K/AED、印度 22K/INR、美国 24K/USD |
| 四单位 | ✅ | 克、baht（15.244g）、tola（11.6638g）、troy oz |
| 实时行情 | ✅ | gold-api XAU/USD、open.er-api FX、Yahoo GC=F、GTA 抓取；逐源降级 |
| 本地化 | ✅ | 中/英/泰/阿语导航与首页文案；RTL `dir`；locale cookie |
| PWA | ✅ | manifest、Service Worker、离线 shell、安装元数据 |
| 账户 | ✅ | Auth.js Credentials（演示）+ JWT session；Google OAuth 可选 |
| 持仓 | ✅ | IndexedDB 本地优先 + 登录后 Postgres 同步；按回购价估值 |
| 提醒 | ✅ | 本地 + 服务端存储；页面内校验；Inngest 定时检查函数已定义 |
| Dealer 网络 | ✅ | Dealer 列表、报价表、询价表单、Dealer Portal 提交 |
| Admin | ✅ | 统计、Dealer/报价/询价概览、RBAC |
| 询价 | ✅ | `/api/quote-requests` 写入 Postgres，Dealer Portal 可见 |
| AI 解析 | ✅ | AI SDK 6 + AI Gateway（配置 key 时）；无 key 时确定性规则解析 |
| 订阅 | ✅ | Stripe Checkout（配置 key 时）；无 key 时 demo 升级，不扣款 |
| Inngest | ✅ | 价格采集、报价分发、提醒检查、每日摘要函数；`/api/inngest` 服务端点 |
| 可观测性 | ◐ | `/api/health`、`/status` 数据源健康；Sentry/OTel 需接 key |
| ElectricSQL | ◐ | 当前以 IndexedDB + Server Action 实现 local-first；Electric shape 适配待接服务 |

> ✅ 已实现并可在本地运行；◐ 代码/接口已就绪，生产需外部服务或凭据。

### 页面

`/` 首页 · `/calculate` 计算器 · `/compare` 四市场对比 · `/quotes` 询价 · `/dealers` Dealer 列表 · `/portfolio` 持仓 · `/alerts` 提醒 · `/learn` 知识库 · `/account` 账户 · `/login` 登录 · `/dealer` Dealer Portal · `/admin` Admin · `/status` 数据健康。

### API

`GET /api/market` · `GET /api/events/prices`（SSE）· `GET/POST/DELETE /api/holdings` · `GET/POST/DELETE /api/alerts` · `POST /api/quote-requests` · `POST /api/dealer/quotes` · `POST /api/ai/parse` · `POST /api/billing/checkout` · `ALL /api/inngest` · `GET /api/health`.

---

## 技术栈

- **应用**：Next.js 16 App Router、React 19、TypeScript strict、React Compiler、Server Actions/Route Handlers
- **样式**：Tailwind CSS v4（设计 token + 自定义组件层），深色黄金视觉，响应式 + RTL
- **领域**：`packages/core`，Decimal.js，纯函数，Vitest 测试向量
- **数据**：PostgreSQL 18 / PGlite、Drizzle ORM、`BOOTSTRAP_SQL` 自动建表、seed
- **认证**：Auth.js v5（JWT）、Credentials 演示、Google OAuth 可选
- **本地优先**：Dexie（IndexedDB）、本地持仓/提醒、登录后同步
- **异步**：Inngest durable functions（cron + event），`/api/inngest`
- **AI**：AI SDK 6 + AI Gateway（OpenAI-compatible）；规则解析兜底
- **支付**：Stripe Checkout（可选）；demo 模式
- **部署**：Vercel/Node standalone、Docker Compose、GitHub Actions

---

## 目录

```
apps/web/                    Next.js 应用
  src/app/                   页面 + API routes
  src/components/            AppShell、Calculator、Portfolio、Alerts、QuoteForm...
  src/lib/                   market、db-data、local-db、inngest、format
  public/                    manifest、sw.js、icons
packages/core/               纯计算引擎 + 测试
packages/db/                 Drizzle schema、PGlite/Postgres client、seed
packages/i18n/               zh/en/th/ar 字典
packages/ui/                 cn() 工具
mvp/                         旧版静态 MVP（保留，不删）
tests/smoke.mjs              旧版冒烟测试
docs/                        调研报告、技术方案、图表
.github/workflows/ci.yml     新 CI：pnpm + core/web tests + build + legacy smoke
docker-compose.yml           Postgres 18 + app
.env.example                 环境变量模板
```

---

## 环境变量

复制 `.env.example` 为 `apps/web/.env.local`（Next 从 app 目录加载）：

```bash
GOLDLENS_MODE=demo             # demo: 快照 + 规则 + demo 支付；live: 外部行情/AI/Stripe
DATABASE_URL=                 # 留空则使用 PGlite
AUTH_SECRET=                  # 生产必须设置
DEMO_PASSWORD=goldlens
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
AI_GATEWAY_API_KEY=           # 留空则规则解析
AI_GATEWAY_URL=https://ai-gateway.vercel.sh/v1
AI_MODEL=openai/gpt-4.1-mini
STRIPE_SECRET_KEY=            # 留空则 demo 升级
STRIPE_PRICE_ID=
INNGEST_EVENT_KEY=
INNGEST_SIGNING_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### API Key 安全

- 所有密钥只通过服务端环境变量读取：`AI_GATEWAY_API_KEY`、`STRIPE_SECRET_KEY`、`AUTH_SECRET`、`DATABASE_URL`。没有 `NEXT_PUBLIC_*KEY`，不会进入客户端 bundle。
- `GOLDLENS_MODE=demo` 时，AI/Stripe/外部行情都不会被调用；默认就是 demo。
- `.env`、`.env.local`、`.env.*` 已被 `.gitignore` 忽略；仓库只保留空的 `.env.example`。
- 如果曾经把 key 写进代码、截图、Issue 或提交历史，请立即在对应平台 **rotate/revoke**，再清理历史。GitHub 公共仓库一旦推送就无法假设“没人看到”。

完整规则见 [SECURITY.md](SECURITY.md)。

---

## 测试与质量

```bash
pnpm test          # core + web unit + legacy smoke
pnpm test:e2e      # 需要先 pnpm dev（或 pnpm start）；跑完整虚拟数据流程
pnpm --filter @goldlens/core test
pnpm --filter @goldlens/web test
pnpm build
```

CI：pnpm install → core tests → web tests → Next build → legacy smoke。

本地已做冒烟：

- 首页、计算器、对比、询价、持仓、提醒、Dealer、Admin、Learn、Login、Status 全部 200
- 登录 / session / holdings POST/GET / quote-request 写入验证通过
- 移动端 390px 无横向滚动
- 真实行情与 GTA 抓取；失败逐源降级

---

## 边界与未完成项

- **不托管、不交易、不提供投资建议**；没有 KYC、资金账户、订单执行。
- **ElectricSQL**：当前 local-first 由 IndexedDB + 服务端权威写实现；接 Electric 服务后可替换为 shape 同步。
- **Expo 原生壳**：未创建；PWA 已验证。
- **Passkeys/Turnstile/Web Push/LINE**：接口预留，生产需接服务。
- **Sentry/OpenTelemetry/PostHog**：`/status` 已展示数据源健康，正式观测需接 key。
- **Dealer 报价审核**：Admin 审核、签名、过期任务的生产流程待接。
- 旧版 `mvp/` 与 GitHub Pages 静态 Demo 保留，作为回退基线。

---

## 调研与技术方案

- [Google Trends 应用机会调研与 MVP 报告（32 页）](docs/GoldLens_Google_Trends_应用机会调研与MVP报告.pdf)
- [GoldLens 2.0 技术方案（36 页）](docs/GoldLens_2.0_技术方案.pdf)
- [GoldLens 2.1 体验优先架构（16 页）](docs/GoldLens_2.1_架构优化方案.pdf)
- [架构优化 Markdown](docs/ARCHITECTURE_UPGRADE_V1.1.md)

核心结论：日热搜被体育、天气、娱乐占据；黄金只有少量条目，但泰国、阿联酋、印度有明确的高意图搜索。竞品分成行情、持仓、交易、估价四类，没有人把“到手价 + 回购价 + 回本点 + 跨市场单位”连起来。GoldLens 从“购买决策层”切入，先做泰国 96.5% / baht，再扩阿联酋 22K、印度 10 克/GST。
