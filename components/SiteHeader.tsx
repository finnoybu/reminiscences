'use client'

import Link from 'next/link'
import { useReader, Theme } from '@/lib/reader-context'

const cycle: Record<Theme, Theme> = {
  light: 'dark',
  dark: 'high-contrast',
  'high-contrast': 'light',
}

const icons: Record<Theme, string> = {
  light: '☀',
  dark: '☾',
  'high-contrast': '◐',
}

const labels: Record<Theme, string> = {
  light: 'Light theme',
  dark: 'Dark theme',
  'high-contrast': 'High-contrast theme',
}

export default function SiteHeader() {
  const { preferences, setTheme } = useReader()

  return (
    <header className="sticky top-0 z-40 border-b border-rule-soft bg-bg/85 backdrop-blur-md supports-[backdrop-filter]:bg-bg/70">
      <div className="max-w-shell mx-auto px-6 h-16 flex items-center gap-6">
        <Link
          href="/"
          className="group flex items-baseline gap-2 text-ink hover:text-accent transition-colors"
        >
          <span className="font-display text-xl tracking-wide" style={{ fontFeatureSettings: "'ss01'" }}>
            A Sailor&rsquo;s Reminiscences
          </span>
        </Link>

        <nav className="ml-auto flex items-center gap-1">
          <Link
            href="/#chapters"
            className="hidden md:inline-flex items-center h-9 px-3 font-sans text-sm text-ink-muted hover:text-ink transition-colors rounded"
          >
            Chapters
          </Link>
          <Link
            href="/chapters/introduction"
            className="hidden md:inline-flex items-center h-9 px-3 font-sans text-sm text-ink-muted hover:text-ink transition-colors rounded"
          >
            Read
          </Link>
          <Link
            href="/shop"
            className="hidden md:inline-flex items-center h-9 px-3 font-sans text-sm text-brass hover:text-accent transition-colors rounded"
          >
            Shop
          </Link>

          <button
            type="button"
            aria-label={`Current: ${labels[preferences.theme]}. Click to change.`}
            onClick={() => setTheme(cycle[preferences.theme])}
            className="ml-2 inline-flex items-center justify-center w-9 h-9 rounded border border-rule-soft text-ink-muted hover:text-accent hover:border-rule transition-colors"
          >
            <span aria-hidden className="text-base leading-none">{icons[preferences.theme]}</span>
          </button>
        </nav>
      </div>
    </header>
  )
}
