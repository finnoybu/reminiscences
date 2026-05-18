// Browser-side Better Auth client. Importable from <script> blocks in .astro
// pages. Don't put server-only secrets in this file — anything imported here
// ends up in client bundles.

import { createAuthClient } from 'better-auth/client';
import { magicLinkClient } from 'better-auth/client/plugins';

export const authClient = createAuthClient({
  // baseURL defaults to the page's origin which is what we want.
  plugins: [magicLinkClient()],
});

// Top-level helpers are stable across Better Auth client versions; sign-up
// and password-reset stay on `authClient.*` because their typed shape isn't
// flat-destructurable.
export const { signIn, signOut, useSession } = authClient;
