import { defineMiddleware } from 'astro:middleware';
import { createAuth } from '~/lib/auth';
import { getEnv, isAuthConfigured } from '~/lib/env';
import { isDbConfigured } from '~/db';

let warnedMissingConfig = false;

function authOptionsFromEnv(env: Env, baseUrl: string) {
  return {
    d1: env.DB,
    baseUrl,
    authSecret: env.BETTER_AUTH_SECRET,
    cookieDomain: env.COOKIE_DOMAIN,
    google:
      env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
        ? { clientId: env.GOOGLE_CLIENT_ID, clientSecret: env.GOOGLE_CLIENT_SECRET }
        : undefined,
    facebook:
      env.FACEBOOK_CLIENT_ID && env.FACEBOOK_CLIENT_SECRET
        ? { clientId: env.FACEBOOK_CLIENT_ID, clientSecret: env.FACEBOOK_CLIENT_SECRET }
        : undefined,
    apple:
      env.APPLE_CLIENT_ID && env.APPLE_CLIENT_SECRET
        ? { clientId: env.APPLE_CLIENT_ID, clientSecret: env.APPLE_CLIENT_SECRET }
        : undefined,
    github:
      env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET
        ? { clientId: env.GITHUB_CLIENT_ID, clientSecret: env.GITHUB_CLIENT_SECRET }
        : undefined,
    awsAccessKeyId: env.AWS_ACCESS_KEY_ID,
    awsSecretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    awsRegion: env.AWS_REGION,
    fromAddress: env.EMAIL_FROM,
  };
}

// Populates Astro.locals.user on every non-prerendered request. Pages opt in
// to dynamic rendering with `export const prerender = false`.
export const onRequest = defineMiddleware(async (ctx, next) => {
  ctx.locals.user = null;

  if (ctx.isPrerendered) return next();

  const env = getEnv(ctx);

  if (!isDbConfigured(ctx) || !isAuthConfigured(env)) {
    if (!warnedMissingConfig) {
      console.warn(
        '[middleware] D1 or BETTER_AUTH_SECRET not configured; auth disabled.',
      );
      warnedMissingConfig = true;
    }
    return next();
  }

  try {
    // baseURL is the request's actual origin (not PUBLIC_SITE_URL) so OAuth
    // redirect_uris and reset-link domains match whichever hostname the user
    // is on — pages.dev pre-cutover, fiction.finnoybu.com after. PUBLIC_SITE_URL
    // remains the canonical for meta tags / sitemap / etc.
    const auth = createAuth(authOptionsFromEnv(env, ctx.url.origin));
    const session = await auth.api.getSession({ headers: ctx.request.headers });

    if (session?.user) {
      ctx.locals.user = {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name ?? null,
      };
    }
  } catch (err) {
    console.error('[middleware] auth lookup failed', err);
  }

  return next();
});

// Exported so the auth handler can reuse the same option-building logic.
export { authOptionsFromEnv };
