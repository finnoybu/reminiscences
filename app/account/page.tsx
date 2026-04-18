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
  const [showEmailConfirm, setShowEmailConfirm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [deleting, setDeleting] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const handleChangeEmailSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if (!newEmail.trim()) return
    setEmailMessage(null)
    setShowEmailConfirm(true)
  }, [newEmail])

  const handleChangeEmailConfirm = useCallback(async () => {
    setShowEmailConfirm(false)
    setEmailSaving(true)
    const { error } = await supabase.auth.updateUser({ email: newEmail })
    if (error) {
      setEmailSaving(false)
      setEmailMessage(error.message)
      return
    }
    // Sign out and redirect — forces re-authentication after email change
    await supabase.auth.signOut()
    localStorage.removeItem('sea-reader-preferences')
    window.location.href = '/'
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
    window.location.href = '/?recovery=true'
  }, [user, supabase.auth])

  const handleSignOut = useCallback(async () => {
    await supabase.auth.signOut()
    localStorage.removeItem('sea-reader-preferences')
    window.location.href = '/'
  }, [supabase.auth])

  const handleDeleteAccount = useCallback(async () => {
    setDeleting(true)
    const res = await fetch('/api/account/delete', { method: 'POST' })
    if (!res.ok) {
      setDeleting(false)
      return
    }
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
            <form onSubmit={handleChangeEmailSubmit} className="flex gap-3">
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

          {/* Email change confirmation modal */}
          {showEmailConfirm && (
            <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] p-4">
              <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={() => setShowEmailConfirm(false)} />
              <div className="relative w-full max-w-sm bg-bg-elev border border-rule-soft rounded-lg shadow-lift overflow-hidden animate-in">
                <div className="px-6 pt-6">
                  <h2
                    className="font-display text-2xl text-ink"
                    style={{ fontFeatureSettings: "'ss01'" }}
                  >
                    Change your email address?
                  </h2>
                </div>
                <div className="px-6 pb-6 pt-4">
                  <p className="font-serif text-base text-ink-muted leading-relaxed mb-6">
                    You will be signed out and a confirmation link will be sent to <strong className="text-ink">{newEmail}</strong>. You&rsquo;ll need to sign back in after changing your email address.
                  </p>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowEmailConfirm(false)}
                      className="flex-1 h-11 rounded-md border border-rule-soft font-sans text-sm uppercase tracking-wider text-ink-muted hover:border-rule hover:text-ink transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleChangeEmailConfirm}
                      disabled={emailSaving}
                      className="flex-1 h-11 rounded-md bg-accent text-bg font-sans text-sm uppercase tracking-wider hover:bg-accent-hi transition-colors disabled:opacity-50"
                    >
                      {emailSaving ? 'Sending\u2026' : 'Continue'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

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

          {/* Delete account */}
          <div className="pt-4 border-t border-rule-soft">
            <h3 className="font-sans text-sm font-medium text-red-600 dark:text-red-400 mb-1">Delete account</h3>
            <p className="font-sans text-sm text-ink-faint mb-3">
              Permanently delete your account and all associated data including reading progress,
              bookmarks, annotations, and errata reports. This action cannot be undone.
            </p>
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="h-11 px-5 rounded-md border border-red-300 dark:border-red-800 font-sans text-xs uppercase tracking-widest text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
            >
              Delete my account
            </button>
          </div>

          {/* Delete account confirmation modal */}
          {showDeleteConfirm && (
            <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] p-4">
              <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText('') }} />
              <div className="relative w-full max-w-sm bg-bg-elev border border-rule-soft rounded-lg shadow-lift overflow-hidden animate-in">
                <div className="px-6 pt-6">
                  <h2
                    className="font-display text-2xl text-red-600 dark:text-red-400"
                    style={{ fontFeatureSettings: "'ss01'" }}
                  >
                    Delete your account?
                  </h2>
                </div>
                <div className="px-6 pb-6 pt-4">
                  <p className="font-serif text-base text-ink-muted leading-relaxed mb-4">
                    This will permanently delete your account, reading progress, bookmarks,
                    annotations, and errata reports. This cannot be undone.
                  </p>
                  <p className="font-sans text-sm text-ink-muted mb-3">
                    Type <strong className="text-ink">delete</strong> to confirm:
                  </p>
                  <input
                    type="text"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder="delete"
                    className="w-full h-11 px-3 rounded-md border border-rule-soft bg-bg font-serif text-base text-ink placeholder:text-ink-faint focus:border-red-400 focus:outline-none transition-colors mb-4"
                    autoComplete="off"
                  />
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText('') }}
                      className="flex-1 h-11 rounded-md border border-rule-soft font-sans text-sm uppercase tracking-wider text-ink-muted hover:border-rule hover:text-ink transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleDeleteAccount}
                      disabled={deleteConfirmText !== 'delete' || deleting}
                      className="flex-1 h-11 rounded-md bg-red-600 text-white font-sans text-sm uppercase tracking-wider hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {deleting ? 'Deleting\u2026' : 'Delete forever'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
