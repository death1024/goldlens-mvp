import { NextResponse } from 'next/server';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { auth } from '@/auth';
import { getDb, schema } from '@goldlens/db';

export const dynamic = 'force-dynamic';

const alertSchema = z.object({
  metric: z.string().default('spot_usd_oz'),
  comparator: z.enum(['below', 'above']),
  threshold: z.number().positive(),
  channel: z.enum(['web', 'email', 'line']).default('web')
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'AUTH_REQUIRED' }, { status: 401 });
  const db = await getDb();
  const rows = await db.select().from(schema.alerts).where(eq(schema.alerts.userId, session.user.id));
  return NextResponse.json({ alerts: rows });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'AUTH_REQUIRED' }, { status: 401 });
  const parsed = alertSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: 'VALIDATION_ERROR', details: parsed.error.flatten() }, { status: 400 });
  const db = await getDb();
  const row = {
    id: `a_${crypto.randomUUID()}`,
    userId: session.user.id,
    ...parsed.data,
    status: 'active',
    createdAt: new Date()
  };
  await db.insert(schema.alerts).values(row);
  return NextResponse.json({ alert: row }, { status: 201 });
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'AUTH_REQUIRED' }, { status: 401 });
  const { id } = await request.json().catch(() => ({ id: null }));
  if (!id) return NextResponse.json({ error: 'VALIDATION_ERROR' }, { status: 400 });
  const db = await getDb();
  await db.delete(schema.alerts).where(eq(schema.alerts.id, id));
  return NextResponse.json({ ok: true });
}
