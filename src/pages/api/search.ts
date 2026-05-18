import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const prerender = false;

interface SearchResult {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  chapterIndex: number;
}

export const GET: APIRoute = async ({ url }) => {
  const query = url.searchParams.get('q')?.trim() ?? '';
  if (!query) {
    return new Response('[]', {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  }

  const all = await getCollection('chapters');
  const chapters = all.sort((a, b) => a.data.id - b.data.id);
  const lowerQuery = query.toLowerCase();
  const results: SearchResult[] = [];

  for (let i = 0; i < chapters.length; i++) {
    const chapter = chapters[i];
    const data = chapter.data;

    if (data.title.toLowerCase().includes(lowerQuery)) {
      results.push({
        id: data.id,
        title: data.title,
        slug: data.slug,
        excerpt: data.title,
        chapterIndex: i,
      });
      continue;
    }

    const body = chapter.body ?? '';
    const lines = body.split('\n');
    for (const line of lines) {
      if (line.toLowerCase().includes(lowerQuery)) {
        const cleanLine = line.replace(/<[^>]*>/g, '').trim();
        if (cleanLine.length > 0) {
          results.push({
            id: data.id,
            title: data.title,
            slug: data.slug,
            excerpt:
              cleanLine.length > 100
                ? cleanLine.substring(0, 100) + '...'
                : cleanLine,
            chapterIndex: i,
          });
          break;
        }
      }
    }
  }

  return new Response(JSON.stringify(results.slice(0, 20)), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
};
