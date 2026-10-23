import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/auth';
import { createQuoteRequest } from '@/lib/db-data';

export const dynamic = 'force-dynamic';

const schema = z.object({
  market: z.enum(['TH', 'AE', 'IN', 'US']),
  weightGrams: z.number().positive().max(100000),
  purity: z.number().gt(0).lte(1),
  city: z.string().min(1).max(80),
  note: z.string().max(500).optional()
});

export async function POST(request: Request) {
  const session = await auth();
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: 'VALIDATION_ERROR', details: parsed.error.flatten() }, { status: 400 });
  const id = await createQuoteRequest({ ...parsed.data, userId: session?.user?.id ?? null });
  if (process.env.INNGEST_EVENT_KEY) {
    try {
      const { inngest } = await import('@/lib/inngest');
      await inngest.send({ name: 'quote/requested', data: { id, market: parsed.data.market, city: parsed.data.city } });
    } catch {
      // Inngest is optional in local/demo mode.
    }
  }
  return NextResponse.json({ id, status: 'submitted' }, { status: 201 });
}
