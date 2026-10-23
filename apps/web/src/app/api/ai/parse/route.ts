import { NextResponse } from 'next/server';
import { z } from 'zod';
import { calcQuote, parseNaturalQuery } from '@goldlens/core';
import { getMarket, getSnapshot } from '@/lib/market';

export const runtime = 'nodejs';

const schema = z.object({ text: z.string().min(2).max(300) });
const parsedSchema = z.object({
  market: z.enum(['TH', 'AE', 'IN', 'US']),
  weight: z.number().positive(),
  unit: z.enum(['g', 'baht', 'tola', 'oz']),
  purity: z.number().gt(0).lte(1)
});

export async function POST(request: Request) {
  const input = schema.safeParse(await request.json());
  if (!input.success) return NextResponse.json({ error: 'VALIDATION_ERROR' }, { status: 400 });

  let parsed = parseNaturalQuery(input.data.text);
  let source: 'rules' | 'ai' = 'rules';

  if (process.env.AI_GATEWAY_API_KEY || process.env.OPENAI_API_KEY) {
    try {
      const { generateObject } = await import('ai');
      const { createOpenAI } = await import('@ai-sdk/openai');
      const gatewayKey = process.env.AI_GATEWAY_API_KEY;
      const provider = createOpenAI({
        apiKey: gatewayKey ?? process.env.OPENAI_API_KEY,
        baseURL: process.env.AI_GATEWAY_URL ?? (gatewayKey ? 'https://ai-gateway.vercel.sh/v1' : undefined)
      });
      const { object } = await generateObject({
        model: provider(process.env.AI_MODEL ?? (gatewayKey ? 'openai/gpt-4.1-mini' : 'gpt-4.1-mini')),
        schema: parsedSchema,
        prompt: `Extract a gold purchase query. Only return fields. Query: ${input.data.text}`
      });
      parsed = object;
      source = 'ai';
    } catch {
      source = 'rules';
    }
  }

  const market = await getMarket();
  const normalized = {
    market: parsed.market ?? 'TH',
    weight: parsed.weight ?? 1,
    unit: parsed.unit ?? 'baht',
    purity: parsed.purity ?? 0.965
  };
  const quote = calcQuote(normalized, getSnapshot(market));
  return NextResponse.json({ parsed: normalized, quote, source });
}
