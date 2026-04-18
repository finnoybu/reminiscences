'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import PasswordStrength, { usePasswordStrength } from './PasswordStrength'

type View = 'sign_in' | 'sign_up' | 'forgot_password' | 'check_email'

export default function AuthModal({ onClose }: { onClose: () => void }) {
  const [view, setView] = useState<View>('sign_in')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()
  const strength = usePasswordStrength(password)

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (view === 'sign_up') {
      if (!strength || strength.score < 3) {
        setError('Please choose a stronger password.')
        setLoading(false)
        return
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.')
        setLoading(false)
        return
      }
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/auth/confirmed` },
      })
      if (error) { setError(error.message); setLoading(false); return }
      setView('check_email')
    } else if (view === 'sign_in') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) { setError(error.message); setLoading(false); return }
      onClose()
    } else if (view === 'forgot_password') {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/account/update-password`,
      })
      if (error) { setError(error.message); setLoading(false); return }
      setView('check_email')
    }

    setLoading(false)
  }

  const handleOAuthLogin = async (provider: 'google' | 'facebook') => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(window.location.pathname)}` },
    })
    if (error) { setError(error.message); setLoading(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] p-4">
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-bg-elev border border-rule-soft rounded-lg shadow-lift overflow-hidden animate-in">
        <div className="flex items-center justify-between px-6 pt-6">
          <h2
            className="font-display text-2xl text-ink"
            style={{ fontFeatureSettings: "'ss01'" }}
          >
            {view === 'sign_in' && 'Sign in'}
            {view === 'sign_up' && 'Create account'}
            {view === 'forgot_password' && 'Reset password'}
            {view === 'check_email' && 'Check your email'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-ink-faint hover:text-ink transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6 6 18" /><path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 pb-6 pt-4">
          {view === 'check_email' ? (
            <div className="text-center py-4">
              <p className="font-serif text-base text-ink-muted leading-relaxed">
                We&rsquo;ve sent a link to <strong className="text-ink">{email}</strong>.
                Check your inbox to continue.
              </p>
              <button
                type="button"
                onClick={() => setView('sign_in')}
                className="mt-6 font-sans text-sm text-accent hover:text-accent-hi transition-colors"
              >
                Back to sign in
              </button>
            </div>
          ) : (
            <>
              {(view === 'sign_in' || view === 'sign_up') && (
                <>
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => handleOAuthLogin('google')}
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-3 h-11 rounded-md border border-rule-soft font-sans text-sm text-ink hover:border-rule hover:bg-bg-sunk transition-colors disabled:opacity-50"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                      Continue with Google
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOAuthLogin('facebook')}
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-3 h-11 rounded-md border border-rule-soft font-sans text-sm text-ink hover:border-rule hover:bg-bg-sunk transition-colors disabled:opacity-50"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                      Continue with Facebook
                    </button>
                  </div>

                  <div className="rule-ornament my-5 text-xs font-sans text-ink-faint">or</div>
                </>
              )}

              <form onSubmit={handleEmailAuth} className="space-y-3">
                <div>
                  <label htmlFor="auth-email" className="block font-sans text-xs uppercase tracking-widest text-ink-faint mb-1.5">
                    Email
                  </label>
                  <input
                    id="auth-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-11 px-3 rounded-md border border-rule-soft bg-bg font-serif text-base text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none transition-colors"
                    placeholder="you@example.com"
                  />
                </div>

                {view !== 'forgot_password' && (
                  <div>
                    <label htmlFor="auth-password" className="block font-sans text-xs uppercase tracking-widest text-ink-faint mb-1.5">
                      Password
                    </label>
                    <input
                      id="auth-password"
                      type="password"
                      required
                      minLength={8}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full h-11 px-3 rounded-md border border-rule-soft bg-bg font-serif text-base text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none transition-colors"
                      placeholder="At least 8 characters"
                    />
                  </div>
                )}

                {view === 'sign_up' && (
                  <PasswordStrength password={password} />
                )}

                {view === 'sign_up' && (
                  <div>
                    <label htmlFor="auth-confirm-password" className="block font-sans text-xs uppercase tracking-widest text-ink-faint mb-1.5">
                      Confirm password
                    </label>
                    <input
                      id="auth-confirm-password"
                      type="password"
                      required
                      minLength={8}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full h-11 px-3 rounded-md border border-rule-soft bg-bg font-serif text-base text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none transition-colors"
                      placeholder="Re-enter your password"
                    />
                  </div>
                )}

                {error && (
                  <p className="font-sans text-sm text-red-600 dark:text-red-400">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 rounded-md bg-accent text-bg font-sans text-sm tracking-wider uppercase hover:bg-accent-hi transition-colors disabled:opacity-50"
                >
                  {loading ? 'Please wait...' : (
                    view === 'sign_in' ? 'Sign in' :
                    view === 'sign_up' ? 'Create account' :
                    'Send reset link'
                  )}
                </button>
              </form>

              <div className="mt-4 flex flex-col items-center gap-2 font-sans text-sm">
                {view === 'sign_in' && (
                  <>
                    <button type="button" onClick={() => { setError(null); setView('forgot_password') }} className="text-ink-muted hover:text-accent transition-colors">
                      Forgot password?
                    </button>
                    <button type="button" onClick={() => { setError(null); setView('sign_up') }} className="text-ink-muted hover:text-accent transition-colors">
                      Don&rsquo;t have an account? <span className="text-accent">Sign up</span>
                    </button>
                  </>
                )}
                {view === 'sign_up' && (
                  <button type="button" onClick={() => { setError(null); setView('sign_in') }} className="text-ink-muted hover:text-accent transition-colors">
                    Already have an account? <span className="text-accent">Sign in</span>
                  </button>
                )}
                {view === 'forgot_password' && (
                  <button type="button" onClick={() => { setError(null); setView('sign_in') }} className="text-ink-muted hover:text-accent transition-colors">
                    Back to sign in
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
