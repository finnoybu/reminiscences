'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useReader, Theme } from '@/lib/reader-context'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import AuthButton from './AuthButton'

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

const navLinks: { href: string; label: string; accent?: boolean }[] = [
  { href: '/#chapters', label: 'Chapters' },
  { href: '/chapters/introduction', label: 'Read' },
  { href: '/shop', label: 'Shop', accent: true },
]

export default function SiteHeader() {
  const { preferences, setTheme } = useReader()
  const [menuOpen, setMenuOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [supabase.auth])

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  return (
    <header className="sticky top-0 z-40 border-b border-rule-soft bg-bg/85 backdrop-blur-md supports-[backdrop-filter]:bg-bg/70">
      <div className="max-w-shell mx-auto px-6 h-16 flex items-center gap-6">
        <Link
          href="/"
          className="group flex items-baseline gap-2 text-ink hover:text-accent transition-colors"
        >
          <span className="font-display text-xl tracking-wide" style={{ fontFeatureSettings: "'ss01'" }}>
            <span className="hidden min-[420px]:inline">A Sailor&rsquo;s Reminiscences</span>
            <span className="min-[420px]:hidden">Reminiscences</span>
          </span>
        </Link>

        <nav className="ml-auto flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href as any}
              className={`hidden md:inline-flex items-center h-9 px-3 font-sans text-sm transition-colors rounded ${
                link.accent
                  ? 'text-brass hover:text-accent'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              {link.label}
            </Link>
          ))}

          <button
            type="button"
            aria-label={`Current: ${labels[preferences.theme]}. Click to change.`}
            onClick={() => setTheme(cycle[preferences.theme])}
            className="ml-2 inline-flex items-center justify-center w-9 h-9 rounded border border-rule-soft text-ink-muted hover:text-accent hover:border-rule transition-colors"
          >
            <span aria-hidden className="text-base leading-none">{icons[preferences.theme]}</span>
          </button>

          <span className="hidden md:inline-flex ml-3 pl-3 border-l border-rule-soft"><AuthButton /></span>

          <button
            type="button"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden ml-1 inline-flex items-center justify-center w-9 h-9 rounded border border-rule-soft text-ink-muted hover:text-accent hover:border-rule transition-colors"
          >
            <svg
              aria-hidden
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              {menuOpen ? (
                <>
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </>
              ) : (
                <>
                  <path d="M4 6h16" />
                  <path d="M4 12h16" />
                  <path d="M4 18h16" />
                </>
              )}
            </svg>
          </button>
        </nav>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-rule-soft bg-bg/95 backdrop-blur-md">
          <nav className="max-w-shell mx-auto px-6 py-4 flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href as any}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center h-12 px-3 font-sans text-base rounded transition-colors ${
                  link.accent
                    ? 'text-brass hover:text-accent'
                    : 'text-ink-muted hover:text-ink'
                }`}
              >
                {link.label}
              </Link>
            ))}
            {user && !sessionStorage.getItem('password-reset-pending') ? (
              <div className="mt-2 pt-3 border-t border-rule-soft flex flex-col gap-1">
                <Link
                  href={"/account" as any}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center h-12 px-3 font-sans text-base text-ink-muted hover:text-ink rounded transition-colors"
                >
                  My account
                </Link>
                <Link
                  href={"/account/bookmarks" as any}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center h-12 px-3 font-sans text-base text-ink-muted hover:text-ink rounded transition-colors"
                >
                  Bookmarks
                </Link>
                <button
                  type="button"
                  onClick={async () => {
                    await supabase.auth.signOut()
                    localStorage.removeItem('sea-reader-preferences')
                    setMenuOpen(false)
                    window.location.href = '/'
                  }}
                  className="flex items-center h-12 px-3 font-sans text-base text-ink-muted hover:text-ink rounded transition-colors"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <div className="mt-2 pt-3 border-t border-rule-soft">
                <AuthButton />
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
