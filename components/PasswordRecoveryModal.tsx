'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useReader } from '@/lib/reader-context'
import PasswordStrength, { usePasswordStrength } from './PasswordStrength'
import AuthModal from './AuthModal'

export default function PasswordRecoveryModal() {
  const [show, setShow] = useState(false)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const [showAuth, setShowAuth] = useState(false)
  const strength = usePasswordStrength(password)
  const { user } = useReader()
  const supabase = createClient()

  useEffect(() => {
    if (window.location.search.includes('recovery=true') && user) {
      setShow(true)
    }
  }, [user])

  if (!show) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!strength || strength.score < 3) {
      setError('Please choose a stronger password.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }

    setSaving(true)

    // Check for password reuse
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user!.email!,
      password,
    })
    if (!signInError) {
      setSaving(false)
      setError('New password must be different from your current password.')
      return
    }

    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setSaving(false)
      setError(error.message)
    } else {
      await supabase.auth.signOut()
      localStorage.removeItem('sea-reader-preferences')
      setSaving(false)
      setDone(true)
    }
  }

  if (done && showAuth) {
    return <AuthModal onClose={() => {
      setShow(false)
      window.history.replaceState({}, '', '/')
    }} />
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] p-4">
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" />
      <div className="relative w-full max-w-sm bg-bg-elev border border-rule-soft rounded-lg shadow-lift overflow-hidden animate-in">
        <div className="px-6 pt-6">
          <h2
            className="font-display text-2xl text-ink"
            style={{ fontFeatureSettings: "'ss01'" }}
          >
            {done ? 'Password updated' : 'Set a new password'}
          </h2>
        </div>

        <div className="px-6 pb-6 pt-4">
          {done ? (
            <div>
              <p className="font-serif text-base text-ink-muted leading-relaxed mb-6">
                Your password has been changed. Please sign in with your new password.
              </p>
              <button
                type="button"
                onClick={() => setShowAuth(true)}
                className="w-full h-11 rounded-md bg-accent text-bg font-sans text-sm tracking-wider uppercase hover:bg-accent-hi transition-colors"
              >
                Sign in
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label htmlFor="recovery-password" className="block font-sans text-xs uppercase tracking-widest text-ink-faint mb-1.5">
                  New password
                </label>
                <input
                  id="recovery-password"
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-11 px-3 rounded-md border border-rule-soft bg-bg font-serif text-base text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none transition-colors"
                  placeholder="At least 8 characters"
                  autoFocus
                />
              </div>
              <PasswordStrength password={password} />
              <div>
                <label htmlFor="recovery-confirm" className="block font-sans text-xs uppercase tracking-widest text-ink-faint mb-1.5">
                  Confirm password
                </label>
                <input
                  id="recovery-confirm"
                  type="password"
                  required
                  minLength={8}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="w-full h-11 px-3 rounded-md border border-rule-soft bg-bg font-serif text-base text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none transition-colors"
                  placeholder="Re-enter your password"
                />
              </div>

              {error && (
                <p className="font-sans text-sm text-red-600 dark:text-red-400">{error}</p>
              )}

              <button
                type="submit"
                disabled={saving}
                className="w-full h-11 rounded-md bg-accent text-bg font-sans text-sm tracking-wider uppercase hover:bg-accent-hi transition-colors disabled:opacity-50"
              >
                {saving ? 'Updating\u2026' : 'Update password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
