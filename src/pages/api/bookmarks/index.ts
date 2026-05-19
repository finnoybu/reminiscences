import type { APIRoute } from 'astro';
import { getDb, schema } from '~/db';
import { and, desc, eq } from 'drizzle-orm';

export const prerender = false;

// GET /api/bookmarks?chapterSlug=X → list for the signed-in user in that
// chapter, newest first. Used by AnnotationHighlights to paint ribbons in
// the left margin on chapter mount.
export const GET: APIRoute = async (ctx) => {
  const user = ctx.locals.user;
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const url = new URL(ctx.request.url);
  const chapterSlug = url.searchParams.get('chapterSlug');

  try {
    const db = getDb(ctx);
    const rows = await db
      .select()
      .from(schema.bookmarks)
      .where(
        chapterSlug
          ? and(
              eq(schema.bookmarks.userId, user.id),
              eq(schema.bookmarks.chapterSlug, chapterSlug),
            )
          : eq(schema.bookmarks.userId, user.id),
      )
      .orderBy(desc(schema.bookmarks.createdAt));
    return Response.json(rows);
  } catch (e) {
    console.error('[api/bookmarks GET]', e);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
};

interface CreateBookmarkBody {
  chapterSlug?: string;
  scrollPosition?: number;
  selectionStart?: number | null;
  label?: string | null;
}

export const POST: APIRoute = async (ctx) => {
  const user = ctx.locals.user;
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  let body: CreateBookmarkBody;
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

  try {
    const db = getDb(ctx);
    const [row] = await db
      .insert(schema.bookmarks)
      .values({
        userId: user.id,
        chapterSlug: body.chapterSlug,
        scrollPosition: body.scrollPosition,
        selectionStart: body.selectionStart ?? null,
        label: body.label ?? null,
      })
      .returning();
    return Response.json(row, { status: 201 });
  } catch (e) {
    console.error('[api/bookmarks POST]', e);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
};
