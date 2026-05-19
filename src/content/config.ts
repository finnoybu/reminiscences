// Astro content collection for "A Sailor's Reminiscences" chapters.
//
// Source: content/en/<chapter>.md (out-of-tree relative to src/). Memoirs
// is a single-book site, so chapters live directly under content/en/
// with no per-book subdirectory wrapping (compare fiction-trilogy which
// scopes to content/en/1-finnoybu-salt-and-silence/ because it expects
// multiple books in the same `id` numbering space).
//
// content/print/ is the print-publication version and is intentionally
// not loaded — the web reader uses content/en/.
//
// Frontmatter shape mirrors schemas/frontmatter.schema.json.

import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const chapters = defineCollection({
  loader: glob({
    pattern: '**/*.md',
    base: './content/en',
  }),
  schema: z.object({
    id: z.number().int().min(0),
    title: z.string().min(1),
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    description: z.string().nullable().optional(),
    created: z.string().nullable().optional(),
    updated: z.string().nullable().optional(),
    hero: z.object({
      image: z.string().min(1),
      themeColor: z.string().nullable().optional(),
      focalPoint: z.enum(['left', 'center', 'right']).nullable().optional(),
    }),
  }),
});

export const collections = { chapters };
