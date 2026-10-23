import { getMarket } from '@/lib/market';

export const dynamic = 'force-dynamic';

export async function GET() {
  const data = await getMarket();
  return Response.json(data, { headers: { 'cache-control': 'no-store' } });
}
