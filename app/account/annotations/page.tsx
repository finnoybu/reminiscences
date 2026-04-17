'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useReader } from '@/lib/reader-context'
import { createClient } from '@/lib/supabase/client'

const SMALL_WORDS = new Set(['a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'in', 'of', 'on', 'or', 'the', 'to'])

function formatChapterTitle(slug: string): string {
  return slug
    .split('-')
    .map((w, i) => (i === 0 || !SMALL_WORDS.has(w)) ? w.charAt(0).toUpperCase() + w.slice(1) : w)
    .join(' ')
}

function buildCitation(ann: Annotation): string {
  const chapter = formatChapterTitle(ann.chapter_slug)
  const quote = ann.text_selection.length > 120
    ? ann.text_selection.slice(0, 120) + '\u2026'
    : ann.text_selection
  return `"\u200A${quote}\u200A" \u2014 Olavus V. B. Vestb\u00F8, A Sailor\u2019s Reminiscences from the Days of the Sailships, \u201C${chapter}.\u201D Finn\u00F8ybu Press, 2026.`
}

interface Annotation {
  id: string
  chapter_slug: string
  text_selection: string
  note: string
  selection_start: number | null
  created_at: string
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? 'Copied' : 'Copy citation'}
      className="flex-shrink-0 text-ink-faint hover:text-accent transition-colors"
    >
      {copied ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6 9 17l-5-5" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="14" height="14" x="8" y="8" rx="2" />
          <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
        </svg>
      )}
    </button>
  )
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
                    href={`/chapters/${ann.chapter_slug}${ann.selection_start != null ? `?scrollToText=${ann.selection_start}` : ''}` as any}
                    className="eyebrow text-[10px] hover:text-accent transition-colors"
                  >
                    {ann.chapter_slug.replace(/-/g, ' ')} ↗
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
                <div className="p-3 bg-bg-sunk rounded border border-rule-soft mb-3">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-serif text-md text-ink-muted italic leading-relaxed">
                      {buildCitation(ann)}
                    </p>
                    <CopyButton text={buildCitation(ann)} />
                  </div>
                </div>
                {ann.note && (
                  <p className="font-serif text-lg text-ink">{ann.note}</p>
                )}
                <p className="font-sans text-xs text-ink-faint mt-3">
                  {new Date(ann.created_at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
