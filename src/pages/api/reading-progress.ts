import type { APIRoute } from 'astro';
import { getDb, schema } from '~/db';
import { desc, eq } from 'drizzle-orm';

export const prerender = false;

interface UpsertProgressBody {
  chapterSlug?: string;
  scrollPosition?: number;
  percent?: number;
}

// GET /api/reading-progress           → all rows for the user, newest first
// GET /api/reading-progress?latest=1  → just the newest row (or null)
//
// Used by ReaderProvider on sign-in to merge the cloud's last reading
// position into local state across devices.
export const GET: APIRoute = async (ctx) => {
  const user = ctx.locals.user;
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const url = new URL(ctx.request.url);
  const latest = url.searchParams.get('latest') === '1';

  try {
    const db = getDb(ctx);
    const q = db
      .select()
      .from(schema.readingProgress)
      .where(eq(schema.readingProgress.userId, user.id))
      .orderBy(desc(schema.readingProgress.lastReadAt));

    if (latest) {
      const rows = await q.limit(1);
      return Response.json(rows[0] ?? null);
    }
    return Response.json(await q);
  } catch (e) {
    console.error('[api/reading-progress GET]', e);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
};

// Upsert reading_progress on (userId, chapterSlug). Bumps lastReadAt every
// call so the client can resolve "most recent chapter" across devices.
export const POST: APIRoute = async (ctx) => {
  const user = ctx.locals.user;
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  let body: UpsertProgressBody;
  try {
    body = await ctx.request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body.chapterSlug || typeof body.scrollPosition !== 'number') {
    return Response.json(
      { error: 'chapterSlug and scrollPosition are required' },
      { status: 400 },
    );
  }

  const now = new Date();
  const percent = typeof body.percent === 'number' ? body.percent : 0;

  try {
    const db = getDb(ctx);
    await db
      .insert(schema.readingProgress)
      .values({
        userId: user.id,
        chapterSlug: body.chapterSlug,
        scrollPosition: body.scrollPosition,
        percent,
        lastReadAt: now,
      })
      .onConflictDoUpdate({
        target: [schema.readingProgress.userId, schema.readingProgress.chapterSlug],
        set: {
          scrollPosition: body.scrollPosition,
          percent,
          lastReadAt: now,
        },
      });
    return new Response(null, { status: 204 });
  } catch (e) {
    console.error('[api/reading-progress POST]', e);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
};
