'use client'

import { useEffect, useState } from 'react'
import { useReader } from '@/lib/reader-context'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface Stats {
  chaptersRead: number
  totalChapters: number
  hasPurchase: boolean
}

export default function AccountPage() {
  const { user } = useReader()
  const [stats, setStats] = useState<Stats | null>(null)
  const supabase = createClient()

  useEffect(() => {
    if (!user) return

    async function load() {
      const [progressRes, purchaseRes] = await Promise.all([
        supabase.from('reading_progress').select('chapter_slug').eq('user_id', user!.id),
        supabase.from('purchases').select('id').eq('user_id', user!.id).eq('product_id', 'pdf-epub').limit(1),
      ])

      setStats({
        chaptersRead: progressRes.data?.length ?? 0,
        totalChapters: 69,
        hasPurchase: (purchaseRes.data?.length ?? 0) > 0,
      })
    }

    load()
  }, [user, supabase])

  if (!user) {
    return (
      <div className="max-w-shell mx-auto px-6 py-16 md:py-24 text-center">
        <p className="font-serif text-lg text-ink-muted">Sign in to view your account.</p>
      </div>
    )
  }

  const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Reader'

  return (
    <div className="max-w-shell mx-auto px-6 py-16 md:py-24">
      <div className="max-w-measure mx-auto">
        <p className="eyebrow mb-4">Your account</p>
        <h1
          className="font-display text-4xl md:text-5xl leading-tight text-ink mb-2"
          style={{ fontFeatureSettings: "'ss01'" }}
        >
          {displayName}
        </h1>
        <p className="font-sans text-sm text-ink-faint mb-12">{user.email}</p>

        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
            <div className="p-5 bg-bg-elev border border-rule-soft rounded-lg">
              <p className="eyebrow text-[10px] mb-2">Chapters visited</p>
              <p className="font-display text-3xl text-ink" style={{ fontFeatureSettings: "'ss01'" }}>
                {stats.chaptersRead}
                <span className="text-base text-ink-faint"> / {stats.totalChapters}</span>
              </p>
            </div>
            <div className="p-5 bg-bg-elev border border-rule-soft rounded-lg">
              <p className="eyebrow text-[10px] mb-2">Progress</p>
              <p className="font-display text-3xl text-ink" style={{ fontFeatureSettings: "'ss01'" }}>
                {Math.round((stats.chaptersRead / stats.totalChapters) * 100)}%
              </p>
            </div>
            <div className="p-5 bg-bg-elev border border-rule-soft rounded-lg">
              <p className="eyebrow text-[10px] mb-2">Digital edition</p>
              <p className="font-display text-xl text-ink" style={{ fontFeatureSettings: "'ss01'" }}>
                {stats.hasPurchase ? 'Purchased' : 'Not purchased'}
              </p>
              {stats.hasPurchase ? (
                <div className="mt-2 flex gap-2">
                  <a href="/api/download?format=pdf" className="font-sans text-xs text-accent hover:text-accent-hi transition-colors">PDF</a>
                  <a href="/api/download?format=epub" className="font-sans text-xs text-accent hover:text-accent-hi transition-colors">ePub</a>
                </div>
              ) : (
                <Link href="/shop" className="mt-2 inline-block font-sans text-xs text-brass hover:text-accent transition-colors">
                  Buy for $7.49
                </Link>
              )}
            </div>
          </div>
        )}

        <div className="space-y-3">
          <Link
            href={"/account/bookmarks" as any}
            className="chapter-card group flex items-center justify-between p-5 bg-bg-elev border border-rule-soft rounded-lg hover:border-rule"
          >
            <div>
              <h3 className="font-display text-lg text-ink group-hover:text-accent transition-colors" style={{ fontFeatureSettings: "'ss01'" }}>
                Bookmarks
              </h3>
              <p className="font-sans text-sm text-ink-muted">Your saved positions across chapters</p>
            </div>
            <span className="text-ink-faint group-hover:text-accent transition-colors">→</span>
          </Link>
          <Link
            href={"/account/annotations" as any}
            className="chapter-card group flex items-center justify-between p-5 bg-bg-elev border border-rule-soft rounded-lg hover:border-rule"
          >
            <div>
              <h3 className="font-display text-lg text-ink group-hover:text-accent transition-colors" style={{ fontFeatureSettings: "'ss01'" }}>
                Notes
              </h3>
              <p className="font-sans text-sm text-ink-muted">Your annotations and margin notes</p>
            </div>
            <span className="text-ink-faint group-hover:text-accent transition-colors">→</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
