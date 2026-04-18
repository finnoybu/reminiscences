'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { createPortal } from 'react-dom'
import { createClient } from '@/lib/supabase/client'
import { useReader } from '@/lib/reader-context'

const DISMISSED_KEY = 'sea-reader-welcome-dismissed'
const SESSION_SHOWN_KEY = 'sea-reader-welcome-shown'

export default function WelcomeModal() {
  const [show, setShow] = useState(false)
  const [dontShowAgain, setDontShowAgain] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { isRecoverySession } = useReader()
  const pathname = usePathname()
  const initialLoad = useRef(true)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'INITIAL_SESSION') {
        // Mark initial session restore as handled — not a real sign-in
        initialLoad.current = false
        return
      }
      if (event === 'SIGNED_IN') {
        // Skip the first SIGNED_IN if INITIAL_SESSION didn't fire (older Supabase)
        if (initialLoad.current) {
          initialLoad.current = false
          return
        }
        // Defer so the router navigates away from /auth/confirmed first
        setTimeout(() => {
          if (window.location.pathname === '/auth/confirmed') return
          if (window.location.search.includes('recovery=true')) return
          try {
            if (localStorage.getItem(DISMISSED_KEY)) return
            if (sessionStorage.getItem(SESSION_SHOWN_KEY)) return
          } catch {}
          try { sessionStorage.setItem(SESSION_SHOWN_KEY, '1') } catch {}
          setShow(true)
        }, 500)
      }
    })
    return () => subscription.unsubscribe()
  }, [pathname])

  const close = useCallback(() => {
    if (dontShowAgain) {
      try { localStorage.setItem(DISMISSED_KEY, '1') } catch {}
    }
    setShow(false)
  }, [dontShowAgain])

  if (!mounted || !show || isRecoverySession) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] p-4">
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={close} />
      <div className="relative w-full max-w-md bg-bg-elev border border-rule-soft rounded-lg shadow-lift overflow-hidden animate-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6">
          <h2
            className="font-display text-2xl text-ink"
            style={{ fontFeatureSettings: "'ss01'" }}
          >
            Welcome aboard
          </h2>
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="text-ink-faint hover:text-ink transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6 6 18" /><path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 pb-6 pt-4 space-y-5">
          <p className="font-serif text-base text-ink-muted leading-relaxed">
            You&rsquo;re signed in and ready to read. Here&rsquo;s what you can do:
          </p>

          <div className="space-y-4">
            {/* Navigation */}
            <div className="flex gap-3">
              <div className="flex-shrink-0 mt-0.5 text-accent">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
                </svg>
              </div>
              <div>
                <p className="font-sans text-sm font-medium text-ink">Navigate chapters</p>
                <p className="font-serif text-sm text-ink-muted leading-relaxed">
                  Use the arrows at the top and bottom of each chapter, or open the table of contents from the header.
                </p>
              </div>
            </div>

            {/* Bookmarks */}
            <div className="flex gap-3">
              <div className="flex-shrink-0 mt-0.5 text-accent">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
                </svg>
              </div>
              <div>
                <p className="font-sans text-sm font-medium text-ink">Bookmark passages</p>
                <p className="font-serif text-sm text-ink-muted leading-relaxed">
                  Select any text and tap <strong>Bookmark</strong> to mark the paragraph. A ribbon appears in the margin so you can find it later.
                </p>
              </div>
            </div>

            {/* Notes */}
            <div className="flex gap-3">
              <div className="flex-shrink-0 mt-0.5 text-accent">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                </svg>
              </div>
              <div>
                <p className="font-sans text-sm font-medium text-ink">Add personal notes</p>
                <p className="font-serif text-sm text-ink-muted leading-relaxed">
                  Select text and tap <strong>Add note</strong> to attach your own annotation. Hover over highlighted text to see your notes.
                </p>
              </div>
            </div>
          </div>

          {/* Don't show again */}
          <label className="flex items-center gap-2.5 cursor-pointer group">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="w-4 h-4 rounded border-rule-soft text-accent focus:ring-accent/30 cursor-pointer"
            />
            <span className="font-sans text-sm text-ink-muted group-hover:text-ink transition-colors">
              Don&rsquo;t show this to me again
            </span>
          </label>

          {/* CTA */}
          <button
            type="button"
            onClick={close}
            className="w-full h-11 rounded-md bg-accent text-bg font-sans text-sm tracking-wider uppercase hover:bg-accent-hi transition-colors"
          >
            Start reading
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
