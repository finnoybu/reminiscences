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

  const handleOAuthLogin = async (provider: 'google' | 'facebook' | 'apple' | 'github') => {
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
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleOAuthLogin('apple')}
                      disabled={loading}
                      aria-label="Continue with Apple"
                      className="flex items-center justify-center gap-2 h-11 rounded-md border border-rule-soft font-sans text-sm text-ink hover:border-rule hover:bg-bg-sunk transition-colors disabled:opacity-50"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                      </svg>
                      Apple
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOAuthLogin('github')}
                      disabled={loading}
                      aria-label="Continue with GitHub"
                      className="flex items-center justify-center gap-2 h-11 rounded-md border border-rule-soft font-sans text-sm text-ink hover:border-rule hover:bg-bg-sunk transition-colors disabled:opacity-50"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.6.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                      </svg>
                      GitHub
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOAuthLogin('facebook')}
                      disabled={loading}
                      aria-label="Continue with Facebook"
                      className="flex items-center justify-center gap-2 h-11 rounded-md border border-rule-soft font-sans text-sm text-ink hover:border-rule hover:bg-bg-sunk transition-colors disabled:opacity-50"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                      Facebook
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOAuthLogin('google')}
                      disabled={loading}
                      aria-label="Continue with Google"
                      className="flex items-center justify-center gap-2 h-11 rounded-md border border-rule-soft font-sans text-sm text-ink hover:border-rule hover:bg-bg-sunk transition-colors disabled:opacity-50"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                      </svg>
                      Google
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
