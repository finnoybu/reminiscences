'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'

const ACCEPTED_KEY = 'sea-reader-cookies-accepted'

export default function CookieBanner() {
  const [show, setShow] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    try {
      const accepted = localStorage.getItem(ACCEPTED_KEY)
      if (!accepted || Date.now() - Number(accepted) > 24 * 60 * 60 * 1000) {
        setShow(true)
      }
    } catch {}
  }, [])

  const accept = () => {
    try { localStorage.setItem(ACCEPTED_KEY, String(Date.now())) } catch {}
    setShow(false)
  }

  if (!mounted || !show) return null

  return createPortal(
    <div className="fixed bottom-0 inset-x-0 z-40 p-4 sm:p-6">
      <div className="max-w-xl mx-auto bg-bg-elev border border-rule-soft rounded-lg shadow-lift px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <p className="font-serif text-sm text-ink-muted leading-relaxed flex-1">
          This site uses cookies and local storage for authentication, reading
          preferences, and analytics.{' '}
          <Link
            href="/legal#cookie-policy"
            className="text-accent hover:text-accent-hi transition-colors underline"
          >
            Learn more
          </Link>
        </p>
        <button
          type="button"
          onClick={accept}
          className="flex-shrink-0 h-9 px-5 rounded-md bg-accent text-bg font-sans text-xs uppercase tracking-widest hover:bg-accent-hi transition-colors"
        >
          Got it
        </button>
      </div>
    </div>,
    document.body
  )
}
