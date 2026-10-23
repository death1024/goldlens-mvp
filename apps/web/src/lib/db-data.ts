import { and, desc, eq, gt } from 'drizzle-orm';
import { getDb, schema } from '@goldlens/db';

export async function listDealers(market?: string) {
  const db = await getDb();
  const all = await db.select().from(schema.dealers).orderBy(desc(schema.dealers.rating));
  return market ? all.filter((dealer: any) => dealer.country === market) : all;
}

export async function listQuotes(market = 'TH') {
  const db = await getDb();
  const rows = await db
    .select()
    .from(schema.dealerQuotes)
    .where(and(eq(schema.dealerQuotes.marketCode, market), gt(schema.dealerQuotes.expiresAt, new Date())))
    .orderBy(desc(schema.dealerQuotes.createdAt))
    .limit(12);
  const dealers = await db.select().from(schema.dealers);
  const map = new Map(dealers.map((dealer: any) => [dealer.id, dealer]));
  return rows.map((quote: any) => ({ ...quote, dealer: map.get(quote.dealerId) }));
}

export async function getAdminStats() {
  const db = await getDb();
  const [dealers, quotes, requests, users] = await Promise.all([
    db.select().from(schema.dealers),
    db.select().from(schema.dealerQuotes),
    db.select().from(schema.quoteRequests),
    db.select().from(schema.users)
  ]);
  return {
    dealers: dealers.length,
    verifiedDealers: dealers.filter((d: any) => d.status === 'verified').length,
    quotes: quotes.length,
    activeQuotes: quotes.filter((q: any) => new Date(q.expiresAt).getTime() > Date.now()).length,
    requests: requests.length,
    users: users.length
  };
}

export async function createQuoteRequest(input: {
  userId?: string | null;
  market: string;
  weightGrams: number;
  purity: number;
  city: string;
  note?: string;
}) {
  const db = await getDb();
  const id = `qr_${crypto.randomUUID()}`;
  await db.insert(schema.quoteRequests).values({
    id,
    userId: input.userId ?? null,
    marketCode: input.market,
    weightGrams: input.weightGrams,
    purity: input.purity,
    city: input.city,
    note: input.note ?? null,
    status: 'submitted',
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  });
  return id;
}
