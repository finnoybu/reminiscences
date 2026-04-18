'use client'

import { useState } from 'react'
import { useReader } from '@/lib/reader-context'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import PasswordStrength, { usePasswordStrength } from '@/components/PasswordStrength'
import AuthModal from '@/components/AuthModal'

export default function UpdatePasswordPage() {
  const { user } = useReader()
  const supabase = createClient()
  const router = useRouter()

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const [showAuth, setShowAuth] = useState(false)
  const strength = usePasswordStrength(password)

  if (!user) {
    return (
      <div className="max-w-shell mx-auto px-6 py-16 md:py-24 text-center">
        <p className="font-serif text-lg text-ink-muted">
          This link has expired or is invalid. Please request a new password reset from your
          {' '}<a href="/account" className="text-accent hover:text-accent-hi transition-colors underline">account page</a>.
        </p>
      </div>
    )
  }

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
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setSaving(false)
      setError(error.message)
    } else {
      // Sign out so the user must sign in with their new password
      await supabase.auth.signOut()
      setSaving(false)
      setDone(true)
    }
  }

  if (done) {
    return (
      <div className="max-w-shell mx-auto px-6 py-16 md:py-24 text-center">
        <h1
          className="font-display text-3xl text-ink mb-4"
          style={{ fontFeatureSettings: "'ss01'" }}
        >
          Password updated
        </h1>
        <p className="font-serif text-base text-ink-muted mb-6">
          Your password has been changed. Please sign in with your new password.
        </p>
        <button
          type="button"
          onClick={() => setShowAuth(true)}
          className="inline-block h-11 px-8 rounded-md bg-accent text-bg font-sans text-sm tracking-wider uppercase hover:bg-accent-hi transition-colors"
        >
          Sign in
        </button>
        {showAuth && <AuthModal onClose={() => router.push('/')} />}
      </div>
    )
  }

  return (
    <div className="max-w-shell mx-auto px-6 py-16 md:py-24">
      <div className="max-w-sm mx-auto">
        <p className="eyebrow mb-4">Account</p>
        <h1
          className="font-display text-3xl text-ink mb-8"
          style={{ fontFeatureSettings: "'ss01'" }}
        >
          Set a new password
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="new-password" className="block font-sans text-xs uppercase tracking-widest text-ink-faint mb-1.5">
              New password
            </label>
            <input
              id="new-password"
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
            <label htmlFor="confirm-password" className="block font-sans text-xs uppercase tracking-widest text-ink-faint mb-1.5">
              Confirm password
            </label>
            <input
              id="confirm-password"
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
      </div>
    </div>
  )
}
