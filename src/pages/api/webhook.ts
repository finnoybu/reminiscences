// Stripe webhook handler. Inserts a purchase row when checkout completes.
//
// On the Workers runtime we must use `constructEventAsync` (not the sync
// variant) — signature verification uses Web Crypto, not Node crypto.

import type { APIRoute } from 'astro';
import { getDb, schema } from '~/db';
import { getEnv } from '~/lib/env';
import { getStripe } from '~/lib/stripe';

export const prerender = false;

export const POST: APIRoute = async (ctx) => {
  const env = getEnv(ctx);
  const sig = ctx.request.headers.get('stripe-signature');

  if (!sig || !env.STRIPE_WEBHOOK_SECRET || !env.STRIPE_SECRET_KEY) {
    return Response.json({ error: 'Webhook not configured' }, { status: 400 });
  }

  const body = await ctx.request.text();
  const stripe = getStripe(env.STRIPE_SECRET_KEY);

  let event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      sig,
      env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err: any) {
    return Response.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  if (event.type !== 'checkout.session.completed') {
    return Response.json({ received: true });
  }

  const session: any = event.data.object;
  const userId = session.metadata?.user_id;
  const productId = session.metadata?.product_id;
  if (!userId || !productId) return Response.json({ received: true });

  const db = getDb(ctx);

  try {
    await db
      .insert(schema.purchases)
      .values({
        userId,
        productId,
        stripeSessionId: session.id,
        amountCents: session.amount_total || 0,
        currency: session.currency || 'usd',
      })
      .onConflictDoNothing({
        target: [schema.purchases.stripeSessionId],
      });
  } catch (err: any) {
    console.error('[webhook] insert failed', err);
    return Response.json({ error: err?.message ?? 'DB insert failed' }, { status: 500 });
  }

  return Response.json({ received: true });
};
