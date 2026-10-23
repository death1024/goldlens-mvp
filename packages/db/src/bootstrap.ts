export const BOOTSTRAP_SQL = `
CREATE TABLE IF NOT EXISTS users (
  id text PRIMARY KEY,
  email text NOT NULL,
  name text,
  image text,
  role text NOT NULL DEFAULT 'user',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS users_email_idx ON users (email);

CREATE TABLE IF NOT EXISTS profiles (
  user_id text PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  market text NOT NULL DEFAULT 'TH',
  goal text NOT NULL DEFAULT 'buy',
  units text NOT NULL DEFAULT 'baht',
  locale text NOT NULL DEFAULT 'zh',
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS markets (
  code text PRIMARY KEY,
  name text NOT NULL,
  currency text NOT NULL,
  tax_bps integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS price_snapshots (
  id text PRIMARY KEY,
  market_code text NOT NULL,
  source text NOT NULL,
  kind text NOT NULL,
  price double precision NOT NULL,
  currency text NOT NULL,
  unit text NOT NULL,
  purity double precision,
  observed_at timestamptz NOT NULL,
  confidence double precision NOT NULL DEFAULT 1,
  raw jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS price_snapshots_market_time_idx ON price_snapshots (market_code, observed_at);

CREATE TABLE IF NOT EXISTS dealers (
  id text PRIMARY KEY,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'verified',
  city text NOT NULL,
  country text NOT NULL,
  verified_at timestamptz,
  rating double precision DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS dealer_branches (
  id text PRIMARY KEY,
  dealer_id text NOT NULL REFERENCES dealers(id) ON DELETE CASCADE,
  address text NOT NULL,
  lat double precision,
  lng double precision,
  hours text
);
CREATE INDEX IF NOT EXISTS dealer_branches_dealer_idx ON dealer_branches (dealer_id);

CREATE TABLE IF NOT EXISTS dealer_quotes (
  id text PRIMARY KEY,
  dealer_id text NOT NULL REFERENCES dealers(id) ON DELETE CASCADE,
  branch_id text REFERENCES dealer_branches(id),
  market_code text NOT NULL,
  product_type text NOT NULL DEFAULT 'jewelry',
  purity double precision NOT NULL,
  weight_grams double precision NOT NULL,
  sell_price_minor integer NOT NULL,
  buyback_minor integer NOT NULL,
  making_charge_bps integer NOT NULL DEFAULT 0,
  tax_bps integer NOT NULL DEFAULT 0,
  currency text NOT NULL,
  effective_at timestamptz NOT NULL,
  expires_at timestamptz NOT NULL,
  verification text NOT NULL DEFAULT 'self_reported',
  source text NOT NULL DEFAULT 'portal',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS dealer_quotes_dealer_expiry_idx ON dealer_quotes (dealer_id, expires_at);
CREATE INDEX IF NOT EXISTS dealer_quotes_market_idx ON dealer_quotes (market_code);

CREATE TABLE IF NOT EXISTS quote_requests (
  id text PRIMARY KEY,
  user_id text REFERENCES users(id) ON DELETE SET NULL,
  market_code text NOT NULL,
  weight_grams double precision NOT NULL,
  purity double precision NOT NULL,
  city text NOT NULL,
  status text NOT NULL DEFAULT 'submitted',
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL
);
CREATE INDEX IF NOT EXISTS quote_requests_user_idx ON quote_requests (user_id, created_at);

CREATE TABLE IF NOT EXISTS quote_rankings (
  quote_id text PRIMARY KEY REFERENCES dealer_quotes(id) ON DELETE CASCADE,
  request_id text REFERENCES quote_requests(id) ON DELETE CASCADE,
  score double precision NOT NULL,
  reasons jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS holdings (
  id text PRIMARY KEY,
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  market_code text NOT NULL,
  purity double precision NOT NULL,
  weight_grams double precision NOT NULL,
  cost_minor integer NOT NULL,
  currency text NOT NULL,
  asset_type text NOT NULL DEFAULT 'bar',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS holdings_user_idx ON holdings (user_id);

CREATE TABLE IF NOT EXISTS alerts (
  id text PRIMARY KEY,
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  metric text NOT NULL DEFAULT 'spot_usd_oz',
  comparator text NOT NULL DEFAULT 'below',
  threshold double precision NOT NULL,
  channel text NOT NULL DEFAULT 'web',
  status text NOT NULL DEFAULT 'active',
  last_triggered_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS alerts_user_idx ON alerts (user_id);

CREATE TABLE IF NOT EXISTS subscriptions (
  id text PRIMARY KEY,
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan text NOT NULL DEFAULT 'free',
  status text NOT NULL DEFAULT 'active',
  period_end timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS subscriptions_user_idx ON subscriptions (user_id);

CREATE TABLE IF NOT EXISTS audit_logs (
  id text PRIMARY KEY,
  actor text,
  action text NOT NULL,
  entity text NOT NULL,
  entity_id text,
  before jsonb,
  after jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS audit_logs_entity_idx ON audit_logs (entity, created_at);

CREATE TABLE IF NOT EXISTS ai_extractions (
  id text PRIMARY KEY,
  user_id text REFERENCES users(id) ON DELETE SET NULL,
  kind text NOT NULL,
  model text,
  prompt_version text,
  input_hash text,
  output jsonb,
  confidence double precision,
  status text NOT NULL DEFAULT 'pending_review',
  created_at timestamptz NOT NULL DEFAULT now()
);
`;
