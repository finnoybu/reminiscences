import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * The book slug for sea-reader. Used to look up the book_id UUID from
 * the shared public.books table at runtime and cache it for all queries.
 */
export const BOOK_SLUG = 'sea-reader' as const

// Module-scoped cache. Separate per-server-process and per-client-page-load,
// which is fine — the UUID is stable so either cache lifetime is safe.
let cachedBookId: string | null = null
let inflight: Promise<string> | null = null

/**
 * Resolves this site's book_id UUID from the shared public.books table.
 * Cached after the first successful call so subsequent calls are free.
 * Concurrent callers share a single in-flight promise.
 */
export async function getBookId(supabase: SupabaseClient): Promise<string> {
  if (cachedBookId) return cachedBookId
  if (inflight) return inflight

  inflight = (async () => {
    const { data, error } = await supabase
      .from('books')
      .select('id')
      .eq('slug', BOOK_SLUG)
      .single()

    if (error || !data) {
      inflight = null
      throw new Error(
        `Failed to resolve book_id for "${BOOK_SLUG}": ${error?.message ?? 'not found'}`
      )
    }

    cachedBookId = data.id
    inflight = null
    return data.id
  })()

  return inflight
}
