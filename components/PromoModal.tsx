'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { createPortal } from 'react-dom'
import Link from 'next/link'

const SESSION_START_KEY = 'sea-reader-session-start'
const PROMO_SHOWN_KEY = 'sea-reader-promo-shown'
const THRESHOLD_MS = 10 * 60 * 1000 // 10 minutes

export default function PromoModal() {
  const [show, setShow] = useState(false)
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()
  const prevPathname = useRef(pathname)

  // Record session start time on mount
  useEffect(() => {
    setMounted(true)
    try {
      if (!sessionStorage.getItem(SESSION_START_KEY)) {
        sessionStorage.setItem(SESSION_START_KEY, String(Date.now()))
      }
    } catch {}
  }, [])

  // Watch for chapter-to-chapter navigation
  useEffect(() => {
    if (!mounted) return
    const prev = prevPathname.current
    prevPathname.current = pathname

    // Only trigger on navigation TO a chapter page (not the initial load)
    if (!pathname.startsWith('/chapters/')) return
    if (prev === pathname) return

    try {
      if (sessionStorage.getItem(PROMO_SHOWN_KEY)) return
      const start = Number(sessionStorage.getItem(SESSION_START_KEY))
      if (!start || Date.now() - start < THRESHOLD_MS) return

      // Delay slightly so the new chapter content loads first
      const timer = setTimeout(() => {
        setShow(true)
        sessionStorage.setItem(PROMO_SHOWN_KEY, '1')
      }, 1500)
      return () => clearTimeout(timer)
    } catch {}
  }, [pathname, mounted])

  if (!mounted || !show) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] p-4">
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={() => setShow(false)} />
      <div className="relative w-full max-w-lg bg-bg-elev border border-rule-soft rounded-lg shadow-lift overflow-hidden animate-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6">
          <h2
            className="font-display text-2xl text-ink"
            style={{ fontFeatureSettings: "'ss01'" }}
          >
            Enjoying the voyage?
          </h2>
          <button
            type="button"
            onClick={() => setShow(false)}
            aria-label="Close"
            className="text-ink-faint hover:text-ink transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6 6 18" /><path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 pb-6 pt-3 space-y-5">
          <p className="font-serif text-base text-ink-muted leading-relaxed">
            You&rsquo;ve been reading for a while &mdash; we hope you&rsquo;re enjoying
            the memoir. If you&rsquo;d like to take it beyond the browser, here are a
            couple of ways:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Digital download */}
            <Link
              href="/shop"
              onClick={() => setShow(false)}
              className="group flex flex-col p-5 rounded-lg border border-rule-soft hover:border-accent/40 bg-bg hover:bg-bg-sunk transition-colors"
            >
              <div className="text-accent mb-3">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              </div>
              <p className="font-sans text-sm font-medium text-ink mb-1">Take it with you</p>
              <p className="font-serif text-sm text-ink-muted leading-relaxed">
                Download the PDF or ePub &mdash; read anywhere, even without an internet connection.
              </p>
            </Link>

            {/* Hardcover */}
            <Link
              href="/shop"
              onClick={() => setShow(false)}
              className="group flex flex-col p-5 rounded-lg border border-rule-soft hover:border-accent/40 bg-bg hover:bg-bg-sunk transition-colors"
            >
              <div className="text-accent mb-3">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
                </svg>
              </div>
              <p className="font-sans text-sm font-medium text-ink mb-1">Keep it on the shelf</p>
              <p className="font-serif text-sm text-ink-muted leading-relaxed">
                A sailor&rsquo;s memoir deserves a place on the bookshelf. Order the hardcover for posterity.
              </p>
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setShow(false)}
            className="w-full h-10 font-sans text-sm text-ink-muted hover:text-ink transition-colors"
          >
            No thanks, I&rsquo;ll keep reading
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
