import type { APIRoute } from 'astro';
import { getDb, schema } from '~/db';
import { and, eq } from 'drizzle-orm';

export const prerender = false;

export const DELETE: APIRoute = async (ctx) => {
  const user = ctx.locals.user;
  if (!user) return new Response('Unauthorized', { status: 401 });
  const id = ctx.params.id;
  if (!id) return new Response('Bad request', { status: 400 });
  try {
    const db = getDb(ctx);
    await db
      .delete(schema.bookmarks)
      .where(and(eq(schema.bookmarks.id, id), eq(schema.bookmarks.userId, user.id)));
    return new Response(null, { status: 204 });
  } catch (e) {
    console.error('[api/bookmarks DELETE]', e);
    return new Response('Server error', { status: 500 });
  }
};
