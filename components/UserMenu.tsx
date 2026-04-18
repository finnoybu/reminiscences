'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

export default function UserMenu() {
  const [user, setUser] = useState<User | null>(null)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  if (!user) return null

  const initial = (user.user_metadata?.full_name?.[0] || user.email?.[0] || '?').toUpperCase()
  const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Reader'

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-label="Account menu"
        className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-accent text-bg font-sans text-sm font-medium hover:bg-accent-hi transition-colors"
      >
        {initial}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-bg-elev border border-rule-soft rounded-lg shadow-lift overflow-hidden animate-in z-50">
          <div className="px-4 py-3 border-b border-rule-soft">
            <p className="font-sans text-sm font-medium text-ink truncate">{displayName}</p>
            <p className="font-sans text-xs text-ink-faint truncate">{user.email}</p>
          </div>
          <div className="py-1">
            <Link
              href={"/account" as any}
              onClick={() => setOpen(false)}
              className="block px-4 py-2 font-sans text-sm text-ink-muted hover:text-ink hover:bg-bg-sunk transition-colors"
            >
              My account
            </Link>
            <Link
              href={"/account/bookmarks" as any}
              onClick={() => setOpen(false)}
              className="block px-4 py-2 font-sans text-sm text-ink-muted hover:text-ink hover:bg-bg-sunk transition-colors"
            >
              Bookmarks
            </Link>
            <Link
              href={"/account/annotations" as any}
              onClick={() => setOpen(false)}
              className="block px-4 py-2 font-sans text-sm text-ink-muted hover:text-ink hover:bg-bg-sunk transition-colors"
            >
              Notes
            </Link>
          </div>
          <div className="border-t border-rule-soft py-1">
            <button
              type="button"
              onClick={async () => {
                await supabase.auth.signOut()
                localStorage.removeItem('sea-reader-preferences')
                setOpen(false)
                window.location.href = '/'
              }}
              className="block w-full text-left px-4 py-2 font-sans text-sm text-ink-muted hover:text-ink hover:bg-bg-sunk transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
