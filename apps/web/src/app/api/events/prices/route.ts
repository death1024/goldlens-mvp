import { getMarket } from '@/lib/market';

export const dynamic = 'force-dynamic';

export async function GET() {
  const encoder = new TextEncoder();
  let timer: ReturnType<typeof setInterval> | null = null;

  const stream = new ReadableStream({
    async start(controller) {
      const send = async () => {
        try {
          const data = await getMarket();
          controller.enqueue(encoder.encode(`event: price\ndata: ${JSON.stringify({
            spot: data.spot,
            futures: { price: data.futures.price, changePct: data.futures.changePct },
            updatedAt: data.updatedAt
          })}\n\n`));
        } catch {
          controller.enqueue(encoder.encode('event: error\ndata: {"message":"market unavailable"}\n\n'));
        }
      };
      await send();
      timer = setInterval(send, 30_000);
    },
    cancel() {
      if (timer) clearInterval(timer);
    }
  });

  return new Response(stream, {
    headers: {
      'content-type': 'text/event-stream; charset=utf-8',
      'cache-control': 'no-cache, no-transform',
      connection: 'keep-alive'
    }
  });
}
