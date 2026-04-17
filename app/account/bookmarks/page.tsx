'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useReader } from '@/lib/reader-context'
import { createClient } from '@/lib/supabase/client'

interface Bookmark {
  id: string
  chapter_slug: string
  scroll_position: number
  label: string | null
  created_at: string
}

export default function BookmarksPage() {
  const { user } = useReader()
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (!user) { setLoading(false); return }

    supabase
      .from('bookmarks')
      .select('*')
      .eq('user_id', user.id)
      .order('chapter_slug', { ascending: true })
      .order('scroll_position', { ascending: true })
      .then(({ data }) => {
        setBookmarks(data ?? [])
        setLoading(false)
      })
  }, [user, supabase])

  const removeBookmark = async (id: string) => {
    await supabase.from('bookmarks').delete().eq('id', id)
    setBookmarks((prev) => prev.filter((b) => b.id !== id))
  }

  if (!user) {
    return (
      <div className="max-w-shell mx-auto px-6 py-16 md:py-24 text-center">
        <p className="font-serif text-lg text-ink-muted">Sign in to view your bookmarks.</p>
      </div>
    )
  }

  return (
    <div className="max-w-shell mx-auto px-6 py-16 md:py-24">
      <div className="max-w-measure mx-auto">
        <Link href={"/account" as any} className="font-sans text-xs uppercase tracking-widest text-ink-faint hover:text-accent transition-colors">
          ← Account
        </Link>
        <h1
          className="font-display text-4xl md:text-5xl leading-tight text-ink mt-4 mb-10"
          style={{ fontFeatureSettings: "'ss01'" }}
        >
          Bookmarks
        </h1>

        {loading ? (
          <p className="font-serif text-base text-ink-muted">Loading...</p>
        ) : bookmarks.length === 0 ? (
          <div className="text-center py-12">
            <p className="font-serif text-lg text-ink-muted mb-4">No bookmarks yet.</p>
            <p className="font-sans text-sm text-ink-faint">
              Bookmarks will appear here as you save your favorite passages.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {bookmarks.map((bm) => (
              <div
                key={bm.id}
                className="flex items-center gap-4 p-4 bg-bg-elev border border-rule-soft rounded-lg"
              >
                <Link
                  href={`/chapters/${bm.chapter_slug}?scrollTo=${Math.round(bm.scroll_position)}` as any}
                  className="flex-1 min-w-0"
                >
                  <p className="eyebrow text-[10px] mb-1">
                    {bm.chapter_slug.replace(/-/g, ' ')}
                  </p>
                  <p className="font-display text-lg text-ink hover:text-accent transition-colors" style={{ fontFeatureSettings: "'ss01'" }}>
                    {bm.label
                      ? bm.label.split(/\s+/).slice(0, 8).join(' ') + '\u2026'
                      : bm.chapter_slug.replace(/-/g, ' ')}
                  </p>
                  <p className="font-sans text-xs text-ink-faint mt-1">
                    {new Date(bm.created_at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                  </p>
                </Link>
                <button
                  type="button"
                  onClick={() => removeBookmark(bm.id)}
                  aria-label="Remove bookmark"
                  className="flex-shrink-0 text-ink-faint hover:text-ink transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
