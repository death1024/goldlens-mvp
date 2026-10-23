import { Inngest } from 'inngest';
import { and, eq, gt } from 'drizzle-orm';
import { getDb, schema } from '@goldlens/db';
import { getMarket, getSnapshot } from '@/lib/market';

export const inngest = new Inngest({ id: 'goldlens', name: 'GoldLens' });

export const ingestPrices = inngest.createFunction(
  { id: 'ingest-prices', name: 'Ingest market prices' },
  { cron: '*/1 * * * *' },
  async ({ step }) => {
    const data = await step.run('fetch-market', async () => getMarket());
    await step.run('persist-snapshot', async () => {
      const db = await getDb();
      const snap = getSnapshot(data);
      await db.insert(schema.priceSnapshots).values({
        id: `ps_${crypto.randomUUID()}`,
        marketCode: 'TH',
        source: data.spot.source,
        kind: 'spot',
        price: snap.spotUsdOz,
        currency: 'USD',
        unit: 'oz',
        observedAt: new Date(data.spot.updatedAt),
        confidence: data.degraded.includes('spot') ? 0.5 : 0.95,
        raw: data.spot
      });
    });
    return { spot: data.spot.usdOz, degraded: data.degraded };
  }
);

export const dispatchQuote = inngest.createFunction(
  { id: 'dispatch-quote', name: 'Dispatch quote request' },
  { event: 'quote/requested' },
  async ({ event, step }) => {
    const request = event.data as { id: string; market: string; city: string };
    const dealers = await step.run('load-dealers', async () => {
      const db = await getDb();
      return db.select().from(schema.dealers).where(eq(schema.dealers.country, request.market));
    });
    return { requestId: request.id, dealers: dealers.length };
  }
);

export const checkAlerts = inngest.createFunction(
  { id: 'check-alerts', name: 'Check price alerts' },
  { cron: '*/1 * * * *' },
  async ({ step }) => {
    const data = await step.run('load-price', async () => getMarket());
    const current = data.spot.usdOz;
    const db = await getDb();
    const alerts = await db.select().from(schema.alerts).where(and(eq(schema.alerts.status, 'active'), gt(schema.alerts.createdAt, new Date(0))));
    const triggered = alerts.filter((alert: any) => alert.comparator === 'below' ? current <= alert.threshold : current >= alert.threshold);
    if (triggered.length > 0) {
      await step.run('mark-triggered', async () => {
        for (const alert of triggered) {
          await db.update(schema.alerts).set({ lastTriggeredAt: new Date() }).where(eq(schema.alerts.id, alert.id));
        }
      });
    }
    return { current, triggered: triggered.length };
  }
);

export const dailyDigest = inngest.createFunction(
  { id: 'daily-digest', name: 'Daily market digest' },
  { cron: '0 1 * * *' },
  async ({ step }) => {
    const data = await step.run('load-market', async () => getMarket());
    return { spot: data.spot.usdOz, chg: data.futures.changePct };
  }
);

export const functions = [ingestPrices, dispatchQuote, checkAlerts, dailyDigest];
