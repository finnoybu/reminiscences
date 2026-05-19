// Returns the current signed-in user (if any). Used by client-side scripts
// that need to react to auth state after a session change.

import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async (ctx) => {
  const user = ctx.locals.user;
  return Response.json({ user });
};
