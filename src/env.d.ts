/// <reference path="../.astro/types.d.ts" />
/// <reference types="@cloudflare/workers-types" />

type Runtime = import('@astrojs/cloudflare').Runtime<Env>;

interface Env {
  // Cloudflare bindings (wrangler.toml)
  DB: D1Database;
  FILES: R2Bucket;

  // Better Auth
  BETTER_AUTH_SECRET: string;

  // Cross-subdomain cookie domain (e.g. ".finnoybu.com"). When set, sessions
  // span fiction + memoirs. Leave unset for localhost.
  COOKIE_DOMAIN?: string;

  // OAuth providers (presence-driven — Better Auth only enables a provider
  // when both clientId + clientSecret are populated).
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  FACEBOOK_CLIENT_ID?: string;
  FACEBOOK_CLIENT_SECRET?: string;
  APPLE_CLIENT_ID?: string;
  APPLE_CLIENT_SECRET?: string;
  GITHUB_CLIENT_ID?: string;
  GITHUB_CLIENT_SECRET?: string;

  // Outbound email (AWS SES via SigV4) — used for verification + password reset
  AWS_ACCESS_KEY_ID?: string;
  AWS_SECRET_ACCESS_KEY?: string;
  AWS_REGION?: string;
  EMAIL_FROM?: string;

  // Stripe
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;

  // Site config
  PUBLIC_SITE_URL?: string;
}

declare namespace App {
  interface Locals extends Runtime {
    // Set by middleware on every non-prerendered request.
    user: {
      id: string;
      email: string;
      name: string | null;
    } | null;
  }
}

interface ImportMetaEnv {
  readonly PUBLIC_SITE_URL?: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
