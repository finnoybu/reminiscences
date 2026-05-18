// Stripe checkout: creates a session for a single fiction title and returns
// the hosted-checkout URL. Webhook (api/webhook.ts) records the purchase on
// session completion. No cart — fiction has a single direct-purchase SKU.

import type { APIRoute } from 'astro';
import { getEnv } from '~/lib/env';
import {
  getStripe,
  TITLES,
  DIGITAL_BUNDLE_CURRENCY,
} from '~/lib/stripe';

export const prerender = false;

interface CheckoutBody {
  slug?: string;
}

export const POST: APIRoute = async (ctx) => {
  const user = ctx.locals.user;
  if (!user) {
    return Response.json({ error: 'Sign in to checkout' }, { status: 401 });
  }

  const env = getEnv(ctx);
  if (!env.STRIPE_SECRET_KEY) {
    return Response.json({ error: 'Stripe not configured' }, { status: 503 });
  }

  let payload: CheckoutBody = {};
  try {
    payload = await ctx.request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const slug = payload.slug ?? 'salt-and-silence';
  const title = TITLES[slug];
  if (!title) {
    return Response.json({ error: `Unknown title: ${slug}` }, { status: 400 });
  }

  const origin = new URL(ctx.request.url).origin;
  const stripe = getStripe(env.STRIPE_SECRET_KEY);

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    customer_email: user.email,
    metadata: {
      user_id: user.id,
      // Slug grant for the webhook — single-item case, no need for a JSON
      // grants array like Press uses.
      product_id: title.slug,
    },
    line_items: [
      {
        price_data: {
          currency: DIGITAL_BUNDLE_CURRENCY,
          unit_amount: title.priceCents,
          product_data: {
            name: title.name,
            metadata: { item_slug: title.slug, item_kind: 'book' },
          },
        },
        quantity: 1,
      },
    ],
    success_url: `${origin}/shop/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/shop`,
  });

  return Response.json({ url: session.url });
};
