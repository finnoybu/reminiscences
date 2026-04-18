'use client'

import { useEffect, useState, useCallback } from 'react'
import { useReader } from '@/lib/reader-context'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Stats {
  chaptersRead: number
  totalChapters: number
  hasPurchase: boolean
}

export default function AccountPage() {
  const { user } = useReader()
  const [stats, setStats] = useState<Stats | null>(null)
  const [newEmail, setNewEmail] = useState('')
  const [emailSaving, setEmailSaving] = useState(false)
  const [emailMessage, setEmailMessage] = useState<string | null>(null)
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const handleChangeEmail = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newEmail.trim()) return
    setEmailSaving(true)
    setEmailMessage(null)
    const { error } = await supabase.auth.updateUser({
      email: newEmail,
    })
    setEmailSaving(false)
    if (error) {
      setEmailMessage(error.message)
    } else {
      setEmailMessage('Check your new email for a confirmation link.')
      setNewEmail('')
    }
  }, [newEmail, supabase.auth])

  const handleResetPassword = useCallback(async () => {
    if (!user?.email) return
    setPasswordSaving(true)
    setPasswordMessage(null)
    const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/?recovery=true`,
    })
    if (error) {
      setPasswordSaving(false)
      setPasswordMessage(error.message)
      return
    }
    // Clear user data and redirect — don't call signOut() here because
    // it destroys the PKCE code verifier cookie that the reset link needs.
    // The auth session will be replaced when the user clicks the reset link.
    localStorage.removeItem('sea-reader-preferences')
    sessionStorage.setItem('password-reset-pending', '1')
    window.location.href = '/'
  }, [user, supabase.auth])

  const handleSignOut = useCallback(async () => {
    await supabase.auth.signOut()
    localStorage.removeItem('sea-reader-preferences')
    window.location.href = '/'
  }, [supabase.auth])

  useEffect(() => {
    if (!user) return

    async function load() {
      const [progressRes, purchaseRes] = await Promise.all([
        supabase.from('reading_progress').select('chapter_slug').eq('user_id', user!.id),
        supabase.from('purchases').select('id').eq('user_id', user!.id).eq('product_id', 'pdf-epub').limit(1),
      ])

      setStats({
        chaptersRead: progressRes.data?.length ?? 0,
        totalChapters: 69,
        hasPurchase: (purchaseRes.data?.length ?? 0) > 0,
      })
    }

    load()
  }, [user, supabase])

  if (!user) {
    return (
      <div className="max-w-shell mx-auto px-6 py-16 md:py-24 text-center">
        <p className="font-serif text-lg text-ink-muted">Sign in to view your account.</p>
      </div>
    )
  }

  const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Reader'

  return (
    <div className="max-w-shell mx-auto px-6 py-16 md:py-24">
      <div className="max-w-measure mx-auto">
        <p className="eyebrow mb-4">Your account</p>
        <h1
          className="font-display text-4xl md:text-5xl leading-tight text-ink mb-2"
          style={{ fontFeatureSettings: "'ss01'" }}
        >
          {displayName}
        </h1>
        <p className="font-sans text-sm text-ink-faint mb-12">{user.email}</p>

        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
            <div className="p-5 bg-bg-elev border border-rule-soft rounded-lg">
              <p className="eyebrow text-[10px] mb-2">Chapters visited</p>
              <p className="font-display text-3xl text-ink" style={{ fontFeatureSettings: "'ss01'" }}>
                {stats.chaptersRead}
                <span className="text-base text-ink-faint"> / {stats.totalChapters}</span>
              </p>
            </div>
            <div className="p-5 bg-bg-elev border border-rule-soft rounded-lg">
              <p className="eyebrow text-[10px] mb-2">Progress</p>
              <p className="font-display text-3xl text-ink" style={{ fontFeatureSettings: "'ss01'" }}>
                {Math.round((stats.chaptersRead / stats.totalChapters) * 100)}%
              </p>
            </div>
            <div className="p-5 bg-bg-elev border border-rule-soft rounded-lg">
              <p className="eyebrow text-[10px] mb-2">Digital edition</p>
              <p className="font-display text-xl text-ink" style={{ fontFeatureSettings: "'ss01'" }}>
                {stats.hasPurchase ? 'Purchased' : 'Not purchased'}
              </p>
              {stats.hasPurchase ? (
                <div className="mt-2 flex gap-2">
                  <a href="/api/download?format=pdf" className="font-sans text-xs text-accent hover:text-accent-hi transition-colors">PDF</a>
                  <a href="/api/download?format=epub" className="font-sans text-xs text-accent hover:text-accent-hi transition-colors">ePub</a>
                </div>
              ) : (
                <Link href="/shop" className="mt-2 inline-block font-sans text-xs text-brass hover:text-accent transition-colors">
                  Buy for $7.49
                </Link>
              )}
            </div>
          </div>
        )}

        <div className="space-y-3">
          <Link
            href={"/account/bookmarks" as any}
            className="chapter-card group flex items-center justify-between p-5 bg-bg-elev border border-rule-soft rounded-lg hover:border-rule"
          >
            <div>
              <h3 className="font-display text-lg text-ink group-hover:text-accent transition-colors" style={{ fontFeatureSettings: "'ss01'" }}>
                Bookmarks
              </h3>
              <p className="font-sans text-sm text-ink-muted">Your saved positions across chapters</p>
            </div>
            <span className="text-ink-faint group-hover:text-accent transition-colors">→</span>
          </Link>
          <Link
            href={"/account/annotations" as any}
            className="chapter-card group flex items-center justify-between p-5 bg-bg-elev border border-rule-soft rounded-lg hover:border-rule"
          >
            <div>
              <h3 className="font-display text-lg text-ink group-hover:text-accent transition-colors" style={{ fontFeatureSettings: "'ss01'" }}>
                Notes
              </h3>
              <p className="font-sans text-sm text-ink-muted">Your annotations and margin notes</p>
            </div>
            <span className="text-ink-faint group-hover:text-accent transition-colors">→</span>
          </Link>
        </div>

        {/* Account settings */}
        <div className="mt-12 pt-12 border-t border-rule-soft space-y-8">
          <h2
            className="font-display text-2xl text-ink"
            style={{ fontFeatureSettings: "'ss01'" }}
          >
            Settings
          </h2>

          {/* Change email */}
          <div>
            <h3 className="font-sans text-sm font-medium text-ink mb-1">Change email</h3>
            <p className="font-sans text-sm text-ink-faint mb-3">
              Currently: {user.email}
            </p>
            <form onSubmit={handleChangeEmail} className="flex gap-3">
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="New email address"
                required
                className="flex-1 h-11 px-3 rounded-md border border-rule-soft bg-bg font-serif text-base text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none transition-colors"
              />
              <button
                type="submit"
                disabled={emailSaving}
                className="h-11 px-5 rounded-md bg-accent text-bg font-sans text-xs uppercase tracking-widest hover:bg-accent-hi transition-colors disabled:opacity-50"
              >
                {emailSaving ? 'Sending\u2026' : 'Update'}
              </button>
            </form>
            {emailMessage && (
              <p className="mt-2 font-sans text-sm text-ink-muted">{emailMessage}</p>
            )}
          </div>

          {/* Reset password */}
          <div>
            <h3 className="font-sans text-sm font-medium text-ink mb-1">Reset password</h3>
            <p className="font-sans text-sm text-ink-faint mb-3">
              We&rsquo;ll send a reset link to {user.email}.
            </p>
            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              disabled={passwordSaving}
              className="h-11 px-5 rounded-md border border-rule-soft font-sans text-xs uppercase tracking-widest text-ink-muted hover:border-rule hover:text-ink transition-colors disabled:opacity-50"
            >
              {passwordSaving ? 'Sending\u2026' : 'Send reset link'}
            </button>
            {passwordMessage && (
              <p className="mt-2 font-sans text-sm text-ink-muted">{passwordMessage}</p>
            )}
          </div>

          {/* Reset password confirmation modal */}
          {showResetConfirm && (
            <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] p-4">
              <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={() => setShowResetConfirm(false)} />
              <div className="relative w-full max-w-sm bg-bg-elev border border-rule-soft rounded-lg shadow-lift overflow-hidden animate-in">
                <div className="px-6 pt-6">
                  <h2
                    className="font-display text-2xl text-ink"
                    style={{ fontFeatureSettings: "'ss01'" }}
                  >
                    Reset your password?
                  </h2>
                </div>
                <div className="px-6 pb-6 pt-4">
                  <p className="font-serif text-base text-ink-muted leading-relaxed mb-6">
                    You will be signed out and a reset link will be sent to <strong className="text-ink">{user.email}</strong>. You&rsquo;ll need to sign back in after setting your new password.
                  </p>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowResetConfirm(false)}
                      className="flex-1 h-11 rounded-md border border-rule-soft font-sans text-sm uppercase tracking-wider text-ink-muted hover:border-rule hover:text-ink transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowResetConfirm(false)
                        handleResetPassword()
                      }}
                      disabled={passwordSaving}
                      className="flex-1 h-11 rounded-md bg-accent text-bg font-sans text-sm uppercase tracking-wider hover:bg-accent-hi transition-colors disabled:opacity-50"
                    >
                      {passwordSaving ? 'Sending\u2026' : 'Continue'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sign out */}
          <div className="pt-4 border-t border-rule-soft">
            <button
              type="button"
              onClick={handleSignOut}
              className="h-11 px-5 rounded-md border border-rule-soft font-sans text-xs uppercase tracking-widest text-ink-faint hover:border-red-300 hover:text-red-600 transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
