'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import AuthModal from './AuthModal'
import UserMenu from './UserMenu'

export default function AuthButton() {
  const [user, setUser] = useState<User | null>(null)
  const [showModal, setShowModal] = useState(false)
  const supabase = createClient()
  const searchParams = useSearchParams()

  // Auto-open sign-in modal when ?sign_in=true is in the URL
  useEffect(() => {
    if (searchParams.get('sign_in') === 'true' && !user) {
      setShowModal(true)
    }
  }, [searchParams, user])

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  if (user) return <UserMenu />

  return (
    <>
      <button
        type="button"
        onClick={() => setShowModal(true)}
        className="inline-flex items-center h-9 px-3 font-sans text-sm text-ink-muted hover:text-accent transition-colors rounded"
      >
        Sign in
      </button>
      {showModal && <AuthModal onClose={() => setShowModal(false)} />}
    </>
  )
}
