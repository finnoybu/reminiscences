'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useReader } from '@/lib/reader-context'
import { createClient } from '@/lib/supabase/client'

interface Annotation {
  id: string
  chapter_slug: string
  text_selection: string
  note: string
  created_at: string
}

export default function AnnotationsPage() {
  const { user } = useReader()
  const [annotations, setAnnotations] = useState<Annotation[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (!user) { setLoading(false); return }

    supabase
      .from('annotations')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setAnnotations(data ?? [])
        setLoading(false)
      })
  }, [user, supabase])

  const removeAnnotation = async (id: string) => {
    await supabase.from('annotations').delete().eq('id', id)
    setAnnotations((prev) => prev.filter((a) => a.id !== id))
  }

  if (!user) {
    return (
      <div className="max-w-shell mx-auto px-6 py-16 md:py-24 text-center">
        <p className="font-serif text-lg text-ink-muted">Sign in to view your notes.</p>
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
          Notes
        </h1>

        {loading ? (
          <p className="font-serif text-base text-ink-muted">Loading...</p>
        ) : annotations.length === 0 ? (
          <div className="text-center py-12">
            <p className="font-serif text-lg text-ink-muted mb-4">No notes yet.</p>
            <p className="font-sans text-sm text-ink-faint">
              Select text in any chapter to add a note or annotation.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {annotations.map((ann) => (
              <div
                key={ann.id}
                className="p-5 bg-bg-elev border border-rule-soft rounded-lg"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <Link
                    href={`/chapters/${ann.chapter_slug}` as any}
                    className="eyebrow text-[10px] hover:text-accent transition-colors"
                  >
                    {ann.chapter_slug.replace(/-/g, ' ')}
                  </Link>
                  <button
                    type="button"
                    onClick={() => removeAnnotation(ann.id)}
                    aria-label="Remove note"
                    className="flex-shrink-0 text-ink-faint hover:text-ink transition-colors"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                    </svg>
                  </button>
                </div>
                <blockquote className="font-serif text-sm italic text-ink-muted border-l-2 border-brass pl-4 mb-3">
                  &ldquo;{ann.text_selection}&rdquo;
                </blockquote>
                {ann.note && (
                  <p className="font-serif text-base text-ink">{ann.note}</p>
                )}
                <p className="font-sans text-xs text-ink-faint mt-3">
                  {new Date(ann.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
