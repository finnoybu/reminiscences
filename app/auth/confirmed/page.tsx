'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import AuthModal from '@/components/AuthModal'

export default function ConfirmedPage() {
  const [showAuth, setShowAuth] = useState(false)
  const router = useRouter()

  // Sign out so the user must explicitly sign in
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.signOut()
  }, [])

  return (
    <div className="max-w-shell mx-auto px-6 py-16 md:py-24 text-center">
      <div className="max-w-sm mx-auto">
        <p className="eyebrow mb-4">Account confirmed</p>
        <h1
          className="font-display text-3xl md:text-4xl leading-tight text-ink mb-4"
          style={{ fontFeatureSettings: "'ss01'" }}
        >
          You&rsquo;re all set
        </h1>
        <p className="font-serif text-base text-ink-muted leading-relaxed mb-8">
          Your email has been confirmed. Sign in to start reading with bookmarks,
          notes, and more.
        </p>
        <button
          type="button"
          onClick={() => setShowAuth(true)}
          className="h-11 px-8 rounded-md bg-accent text-bg font-sans text-sm tracking-wider uppercase hover:bg-accent-hi transition-colors"
        >
          Sign in
        </button>
      </div>

      {showAuth && <AuthModal onClose={() => router.push('/')} />}
    </div>
  )
}
