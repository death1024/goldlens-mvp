import {
  boolean,
  doublePrecision,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex
} from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull(),
  name: text('name'),
  image: text('image'),
  role: text('role').notNull().default('user'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
  emailIdx: uniqueIndex('users_email_idx').on(table.email)
}));

export const profiles = pgTable('profiles', {
  userId: text('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  market: text('market').notNull().default('TH'),
  goal: text('goal').notNull().default('buy'),
  units: text('units').notNull().default('baht'),
  locale: text('locale').notNull().default('zh'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
});

export const markets = pgTable('markets', {
  code: text('code').primaryKey(),
  name: text('name').notNull(),
  currency: text('currency').notNull(),
  taxBps: integer('tax_bps').notNull().default(0),
  active: boolean('active').notNull().default(true)
});

export const priceSnapshots = pgTable('price_snapshots', {
  id: text('id').primaryKey(),
  marketCode: text('market_code').notNull(),
  source: text('source').notNull(),
  kind: text('kind').notNull(),
  price: doublePrecision('price').notNull(),
  currency: text('currency').notNull(),
  unit: text('unit').notNull(),
  purity: doublePrecision('purity'),
  observedAt: timestamp('observed_at', { withTimezone: true }).notNull(),
  confidence: doublePrecision('confidence').notNull().default(1),
  raw: jsonb('raw'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
  marketTimeIdx: index('price_snapshots_market_time_idx').on(table.marketCode, table.observedAt)
}));

export const dealers = pgTable('dealers', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  status: text('status').notNull().default('verified'),
  city: text('city').notNull(),
  country: text('country').notNull(),
  verifiedAt: timestamp('verified_at', { withTimezone: true }),
  rating: doublePrecision('rating').default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});

export const dealerBranches = pgTable('dealer_branches', {
  id: text('id').primaryKey(),
  dealerId: text('dealer_id').notNull().references(() => dealers.id, { onDelete: 'cascade' }),
  address: text('address').notNull(),
  lat: doublePrecision('lat'),
  lng: doublePrecision('lng'),
  hours: text('hours')
}, (table) => ({
  dealerIdx: index('dealer_branches_dealer_idx').on(table.dealerId)
}));

export const dealerQuotes = pgTable('dealer_quotes', {
  id: text('id').primaryKey(),
  dealerId: text('dealer_id').notNull().references(() => dealers.id, { onDelete: 'cascade' }),
  branchId: text('branch_id').references(() => dealerBranches.id),
  marketCode: text('market_code').notNull(),
  productType: text('product_type').notNull().default('jewelry'),
  purity: doublePrecision('purity').notNull(),
  weightGrams: doublePrecision('weight_grams').notNull(),
  sellPriceMinor: integer('sell_price_minor').notNull(),
  buybackMinor: integer('buyback_minor').notNull(),
  makingChargeBps: integer('making_charge_bps').notNull().default(0),
  taxBps: integer('tax_bps').notNull().default(0),
  currency: text('currency').notNull(),
  effectiveAt: timestamp('effective_at', { withTimezone: true }).notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  verification: text('verification').notNull().default('self_reported'),
  source: text('source').notNull().default('portal'),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
  dealerExpiryIdx: index('dealer_quotes_dealer_expiry_idx').on(table.dealerId, table.expiresAt),
  marketIdx: index('dealer_quotes_market_idx').on(table.marketCode)
}));

export const quoteRequests = pgTable('quote_requests', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id, { onDelete: 'set null' }),
  marketCode: text('market_code').notNull(),
  weightGrams: doublePrecision('weight_grams').notNull(),
  purity: doublePrecision('purity').notNull(),
  city: text('city').notNull(),
  status: text('status').notNull().default('submitted'),
  note: text('note'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull()
}, (table) => ({
  userIdx: index('quote_requests_user_idx').on(table.userId, table.createdAt)
}));

export const quoteRankings = pgTable('quote_rankings', {
  quoteId: text('quote_id').primaryKey().references(() => dealerQuotes.id, { onDelete: 'cascade' }),
  requestId: text('request_id').references(() => quoteRequests.id, { onDelete: 'cascade' }),
  score: doublePrecision('score').notNull(),
  reasons: jsonb('reasons').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});

export const holdings = pgTable('holdings', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  marketCode: text('market_code').notNull(),
  purity: doublePrecision('purity').notNull(),
  weightGrams: doublePrecision('weight_grams').notNull(),
  costMinor: integer('cost_minor').notNull(),
  currency: text('currency').notNull(),
  assetType: text('asset_type').notNull().default('bar'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
  userIdx: index('holdings_user_idx').on(table.userId)
}));

export const alerts = pgTable('alerts', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  metric: text('metric').notNull().default('spot_usd_oz'),
  comparator: text('comparator').notNull().default('below'),
  threshold: doublePrecision('threshold').notNull(),
  channel: text('channel').notNull().default('web'),
  status: text('status').notNull().default('active'),
  lastTriggeredAt: timestamp('last_triggered_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
  userIdx: index('alerts_user_idx').on(table.userId)
}));

export const subscriptions = pgTable('subscriptions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  plan: text('plan').notNull().default('free'),
  status: text('status').notNull().default('active'),
  periodEnd: timestamp('period_end', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
  userIdx: uniqueIndex('subscriptions_user_idx').on(table.userId)
}));

export const auditLogs = pgTable('audit_logs', {
  id: text('id').primaryKey(),
  actor: text('actor'),
  action: text('action').notNull(),
  entity: text('entity').notNull(),
  entityId: text('entity_id'),
  before: jsonb('before'),
  after: jsonb('after'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
  entityIdx: index('audit_logs_entity_idx').on(table.entity, table.createdAt)
}));

export const aiExtractions = pgTable('ai_extractions', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id, { onDelete: 'set null' }),
  kind: text('kind').notNull(),
  model: text('model'),
  promptVersion: text('prompt_version'),
  inputHash: text('input_hash'),
  output: jsonb('output'),
  confidence: doublePrecision('confidence'),
  status: text('status').notNull().default('pending_review'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});
