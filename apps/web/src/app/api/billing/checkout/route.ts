import { NextResponse } from 'next/server';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'AUTH_REQUIRED' }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_PRICE_ID) {
    return NextResponse.json({ mode: 'demo', plan: body.plan ?? 'pro', url: null });
  }
  try {
    const { default: Stripe } = await import('stripe');
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const origin = new URL(request.url).origin;
    const checkout = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
      success_url: `${origin}/account?upgraded=1`,
      cancel_url: `${origin}/account`,
      customer_email: session.user.email ?? undefined
    });
    return NextResponse.json({ url: checkout.url });
  } catch {
    return NextResponse.json({ error: 'BILLING_UNAVAILABLE' }, { status: 503 });
  }
}
