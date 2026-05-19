import Stripe from 'stripe';

// Stripe SDK on the Workers runtime: use the fetch-based HTTP client (the
// default uses Node's https which isn't available). Construct lazily per
// request so the secret key can come from the Cloudflare binding env rather
// than build-time import.meta.env.
export function getStripe(secretKey: string): Stripe {
  return new Stripe(secretKey, {
    apiVersion: '2026-03-25.dahlia' as any,
    httpClient: Stripe.createFetchHttpClient(),
  });
}

export const DIGITAL_BUNDLE_CURRENCY = 'usd';
export const DIGITAL_BUNDLE_PRODUCT_ID = 'pdf-epub';

// Single-book catalog for memoirs. Slug 'pdf-epub' preserves continuity
// with the Next.js-era webhook + purchases history (existing rows in the
// shared `purchases` table on D1 reference this product_id).
export interface MemoirsTitle {
  slug: string;
  name: string;
  priceCents: number;
}

export const TITLES: Record<string, MemoirsTitle> = {
  'pdf-epub': {
    slug: 'pdf-epub',
    name: "A Sailor's Reminiscences — PDF & ePub",
    priceCents: 749,
  },
};
