import { getDb } from '@goldlens/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await getDb();
    return Response.json({ ok: true, service: 'goldlens-web', version: '2.1.0', time: new Date().toISOString() });
  } catch {
    return Response.json({ ok: false, service: 'goldlens-web', version: '2.1.0' }, { status: 503 });
  }
}
