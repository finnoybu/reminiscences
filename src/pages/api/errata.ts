import type { APIRoute } from 'astro';
import { getDb, schema } from '~/db';

export const prerender = false;

interface CreateErrataBody {
  chapterSlug?: string;
  textSelection?: string;
  description?: string;
}

// POST /api/errata — reader-submitted typo / correction report. Owned by
// the SelectionToolbar's "Report errata" form. There is no list/edit/delete
// UI for the reader; admin review happens out-of-band.
export const POST: APIRoute = async (ctx) => {
  const user = ctx.locals.user;
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  let body: CreateErrataBody;
  try {
    body = await ctx.request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body.chapterSlug || !body.textSelection || !body.description?.trim()) {
    return Response.json(
      { error: 'chapterSlug, textSelection, and description are required' },
      { status: 400 },
    );
  }

  try {
    const db = getDb(ctx);
    const [row] = await db
      .insert(schema.errataReports)
      .values({
        userId: user.id,
        chapterSlug: body.chapterSlug,
        textSelection: body.textSelection,
        description: body.description.trim(),
      })
      .returning();
    return Response.json(row, { status: 201 });
  } catch (e) {
    console.error('[api/errata POST]', e);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
};
