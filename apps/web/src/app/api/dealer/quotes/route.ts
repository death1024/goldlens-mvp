import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/auth';
import { getDb, schema } from '@goldlens/db';

export const dynamic = 'force-dynamic';

const schemaInput = z.object({
  dealerId: z.string().min(1),
  market: z.enum(['TH', 'AE', 'IN', 'US']),
  purity: z.number().gt(0).lte(1),
  weightGrams: z.number().positive(),
  sellPrice: z.number().positive(),
  buyback: z.number().positive(),
  currency: z.string().length(3),
  notes: z.string().max(300).optional()
});

export async function POST(request: Request) {
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (!session?.user || (role !== 'dealer' && role !== 'admin')) {
    return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
  }
  const parsed = schemaInput.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: 'VALIDATION_ERROR', details: parsed.error.flatten() }, { status: 400 });
  if (role === 'dealer' && !['d-siam', 'd-charoen', 'd-dubai'].includes(parsed.data.dealerId)) {
    return NextResponse.json({ error: 'FORBIDDEN_DEALER' }, { status: 403 });
  }
  const db = await getDb();
  const id = `dq_${crypto.randomUUID()}`;
  await db.insert(schema.dealerQuotes).values({
    id,
    dealerId: parsed.data.dealerId,
    marketCode: parsed.data.market,
    productType: 'jewelry',
    purity: parsed.data.purity,
    weightGrams: parsed.data.weightGrams,
    sellPriceMinor: Math.round(parsed.data.sellPrice * 100),
    buybackMinor: Math.round(parsed.data.buyback * 100),
    makingChargeBps: 0,
    taxBps: 0,
    currency: parsed.data.currency,
    effectiveAt: new Date(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    verification: 'self_reported',
    source: 'dealer_portal',
    notes: parsed.data.notes ?? null
  });
  return NextResponse.json({ id, status: 'submitted_for_verification' }, { status: 201 });
}
