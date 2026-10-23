import { NextResponse } from 'next/server';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { auth } from '@/auth';
import { getDb, schema } from '@goldlens/db';

export const dynamic = 'force-dynamic';

const holdingSchema = z.object({
  name: z.string().min(1).max(80),
  market: z.enum(['TH', 'AE', 'IN', 'US']),
  purity: z.number().gt(0).lte(1),
  weightGrams: z.number().positive().max(100000),
  costMinor: z.number().int().nonnegative(),
  currency: z.string().length(3),
  assetType: z.enum(['bar', 'jewelry']).default('bar')
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'AUTH_REQUIRED' }, { status: 401 });
  const db = await getDb();
  const rows = await db.select().from(schema.holdings).where(eq(schema.holdings.userId, session.user.id));
  return NextResponse.json({ holdings: rows });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'AUTH_REQUIRED' }, { status: 401 });
  const parsed = holdingSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: 'VALIDATION_ERROR', details: parsed.error.flatten() }, { status: 400 });
  const db = await getDb();
  const { market, ...rest } = parsed.data;
  const row = {
    id: `h_${crypto.randomUUID()}`,
    userId: session.user.id,
    ...rest,
    marketCode: market,
    createdAt: new Date()
  };
  await db.insert(schema.holdings).values(row);
  return NextResponse.json({ holding: row }, { status: 201 });
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'AUTH_REQUIRED' }, { status: 401 });
  const { id } = await request.json().catch(() => ({ id: null }));
  if (!id) return NextResponse.json({ error: 'VALIDATION_ERROR' }, { status: 400 });
  const db = await getDb();
  await db.delete(schema.holdings).where(eq(schema.holdings.id, id));
  return NextResponse.json({ ok: true });
}
