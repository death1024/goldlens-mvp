# Security & API Keys

GoldLens is a public repository. Treat every commit as public.

## Rules

- Never commit `.env`, `.env.local`, `.env.*`, API keys, tokens, cookies, or screenshots containing them.
- Only `.env.example` is tracked, and it must contain empty values or placeholders — never real credentials.
- All secrets are read server-side only:
  - `AI_GATEWAY_API_KEY` / `OPENAI_API_KEY`
  - `STRIPE_SECRET_KEY` / `STRIPE_PRICE_ID`
  - `AUTH_SECRET`
  - `DATABASE_URL`
  - `INNGEST_EVENT_KEY` / `INNGEST_SIGNING_KEY`
- No secret may use a `NEXT_PUBLIC_*` prefix. `NEXT_PUBLIC_SITE_URL` is the only public variable.
- Default `GOLDLENS_MODE=demo` does not call AI, Stripe, or external market APIs. It uses the bundled snapshot, deterministic rules, seeded Dealer data, and demo billing.
- The `AUTH_SECRET` fallback in `apps/web/src/auth.ts` is for local demo only. Set a real random secret before any public deployment.

## If a key is exposed

1. Revoke/rotate it immediately at the provider (OpenAI, Vercel AI Gateway, Stripe, GitHub, database, etc.).
2. Remove it from the working tree and from the current commit.
3. If it reached GitHub, rewrite history (e.g. `git filter-repo`) or contact GitHub Support for cached views; force-push carefully.
4. Check CI logs, issues, PRs, screenshots, and release assets — not only source files.
5. Add a secret-scanning step (GitHub Secret Scanning / gitleaks) before the next push.

## Demo accounts

The demo accounts (`demo@`, `dealer@`, `admin@` with password `goldlens`) are intentionally public for local evaluation. They are not production credentials and must be removed or disabled before a real launch.

## Reporting

If you find a vulnerability or leaked credential in this repository, open a private security advisory rather than a public issue.
