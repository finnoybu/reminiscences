'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useReader } from '@/lib/reader-context'
import PasswordStrength, { usePasswordStrength } from './PasswordStrength'
import AuthModal from './AuthModal'

const TIMEOUT_SECONDS = 5 * 60 // 5 minutes

export default function PasswordRecoveryModal() {
  const [show, setShow] = useState(false)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const [expired, setExpired] = useState(false)
  const [showAuth, setShowAuth] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(TIMEOUT_SECONDS)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const strength = usePasswordStrength(password)
  const { user, isRecoverySession } = useReader()
  const supabase = createClient()

  // Show modal when recovery is detected via context (async getUser)
  useEffect(() => {
    if (isRecoverySession && user) {
      sessionStorage.removeItem('password-reset-pending')
      setShow(true)
    }
  }, [isRecoverySession, user])

  // Fast-path: show modal immediately if URL has ?recovery=true
  // (don't wait for async getUser to resolve)
  useEffect(() => {
    if (window.location.search.includes('recovery=true')) {
      setShow(true)
    }
  }, [])

  // Countdown timer — starts when modal shows, stops on completion
  useEffect(() => {
    if (!show || done || expired) return
    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!)
          setExpired(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [show, done, expired])

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

    // Note: we intentionally do NOT check for password reuse here.
    // The signInWithPassword probe creates a real session as a side effect,
    // which replaces the recovery session and bypasses the middleware lockdown.
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
      // Hard reload to clear recovery state and let middleware
      // evaluate the fresh (non-recovery) session
      window.location.href = '/'
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
          {expired ? (
            <div>
              <p className="font-serif text-base text-ink-muted leading-relaxed mb-6">
                This password reset has expired. Please request a new reset link.
              </p>
              <button
                type="button"
                onClick={async () => {
                  await supabase.auth.signOut()
                  localStorage.removeItem('sea-reader-preferences')
                  window.location.href = '/'
                }}
                className="w-full h-11 rounded-md bg-accent text-bg font-sans text-sm tracking-wider uppercase hover:bg-accent-hi transition-colors"
              >
                Return to home
              </button>
            </div>
          ) : done ? (
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
              <p className={`text-center font-sans text-xs ${secondsLeft <= 60 ? 'text-red-600 dark:text-red-400' : 'text-ink-faint'}`}>
                {Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, '0')} remaining
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
