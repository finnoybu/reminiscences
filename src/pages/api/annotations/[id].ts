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
      .delete(schema.annotations)
      .where(and(eq(schema.annotations.id, id), eq(schema.annotations.userId, user.id)));
    return new Response(null, { status: 204 });
  } catch (e) {
    console.error('[api/annotations DELETE]', e);
    return new Response('Server error', { status: 500 });
  }
};

interface PatchAnnotationBody {
  note?: string;
  textSelection?: string;
}

export const PATCH: APIRoute = async (ctx) => {
  const user = ctx.locals.user;
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const id = ctx.params.id;
  if (!id) return Response.json({ error: 'Bad request' }, { status: 400 });

  let body: PatchAnnotationBody;
  try {
    body = await ctx.request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (body.note === undefined && body.textSelection === undefined) {
    return Response.json(
      { error: 'At least one of note or textSelection must be provided' },
      { status: 400 },
    );
  }

  try {
    const db = getDb(ctx);
    const [row] = await db
      .update(schema.annotations)
      .set({
        ...(body.note !== undefined ? { note: body.note } : {}),
        ...(body.textSelection !== undefined ? { textSelection: body.textSelection } : {}),
        updatedAt: new Date(),
      })
      .where(and(eq(schema.annotations.id, id), eq(schema.annotations.userId, user.id)))
      .returning();

    if (!row) return Response.json({ error: 'Not found' }, { status: 404 });
    return Response.json(row);
  } catch (e) {
    console.error('[api/annotations PATCH]', e);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
};
