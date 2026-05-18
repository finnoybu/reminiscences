import type { APIRoute } from 'astro';
import { getDb, schema } from '~/db';
import { and, desc, eq } from 'drizzle-orm';

export const prerender = false;

// GET /api/annotations?chapterSlug=X → list for the signed-in user in that
// chapter, newest first. Used by AnnotationHighlights to paint highlights
// + hover cards on chapter mount.
export const GET: APIRoute = async (ctx) => {
  const user = ctx.locals.user;
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const url = new URL(ctx.request.url);
  const chapterSlug = url.searchParams.get('chapterSlug');

  try {
    const db = getDb(ctx);
    const rows = await db
      .select()
      .from(schema.annotations)
      .where(
        chapterSlug
          ? and(
              eq(schema.annotations.userId, user.id),
              eq(schema.annotations.chapterSlug, chapterSlug),
            )
          : eq(schema.annotations.userId, user.id),
      )
      .orderBy(desc(schema.annotations.createdAt));
    return Response.json(rows);
  } catch (e) {
    console.error('[api/annotations GET]', e);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
};

interface CreateAnnotationBody {
  chapterSlug?: string;
  textSelection?: string;
  note?: string;
  selectionStart?: number | null;
  selectionEnd?: number | null;
}

export const POST: APIRoute = async (ctx) => {
  const user = ctx.locals.user;
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  let body: CreateAnnotationBody;
  try {
    body = await ctx.request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body.chapterSlug || !body.textSelection) {
    return Response.json(
      { error: 'chapterSlug and textSelection are required' },
      { status: 400 },
    );
  }

  try {
    const db = getDb(ctx);
    const [row] = await db
      .insert(schema.annotations)
      .values({
        userId: user.id,
        chapterSlug: body.chapterSlug,
        textSelection: body.textSelection,
        note: body.note ?? '',
        selectionStart: body.selectionStart ?? null,
        selectionEnd: body.selectionEnd ?? null,
      })
      .returning();
    return Response.json(row, { status: 201 });
  } catch (e) {
    console.error('[api/annotations POST]', e);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
};
