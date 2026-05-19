import { useEffect, useRef, useState } from 'react';
import { authClient } from '~/lib/auth-client';
import PasswordStrength, { usePasswordStrength } from './PasswordStrength';

// 5-minute timeout matches the Next.js PasswordRecoveryModal — gives the user
// time to set a password while the token is still fresh, and visibly counts
// down so it's obvious why a stale link won't work.
const TIMEOUT_SECONDS = 5 * 60;

interface Props {
  token: string;
  onClose: () => void;
}

export default function PasswordRecoveryModal({ token, onClose }: Props) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(TIMEOUT_SECONDS);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const strength = usePasswordStrength(password);
  const expired = secondsLeft === 0;

  useEffect(() => {
    if (done || expired) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [done, expired]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!strength || strength.score < 3) {
      setError('Please choose a stronger password.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const { error: respError } = await (authClient as any).resetPassword({
        newPassword: password,
        token,
      });
      if (respError) {
        setError(respError.message ?? 'Could not update the password.');
        return;
      }
      setDone(true);
    } catch (err: any) {
      setError(err?.message ?? 'Could not update the password.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const ss = s % 60;
    return `${m}:${ss.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] p-4">
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" />
      <div className="relative w-full max-w-sm bg-bg-elev border border-rule-soft rounded-lg shadow-lift overflow-hidden animate-in">
        <div className="flex items-center justify-between px-6 pt-6">
          <h2
            className="font-display text-2xl text-ink"
            style={{ fontFeatureSettings: "'ss01'" }}
          >
            {done ? 'Password updated' : expired ? 'Reset link expired' : 'Set a new password'}
          </h2>
        </div>

        <div className="px-6 pb-6 pt-4">
          {done ? (
            <div className="text-center py-4">
              <p className="font-serif text-base text-ink-muted leading-relaxed mb-6">
                Your password has been updated. Please sign in with the new password.
              </p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  window.dispatchEvent(new CustomEvent('auth:open'));
                }}
                className="font-sans text-sm text-accent hover:text-accent-hi transition-colors"
              >
                Back to sign in
              </button>
            </div>
          ) : expired ? (
            <div className="text-center py-4">
              <p className="font-serif text-base text-ink-muted leading-relaxed mb-6">
                This reset link has expired. Request a new one from the sign-in dialog.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="font-sans text-sm text-accent hover:text-accent-hi transition-colors"
              >
                Close
              </button>
            </div>
          ) : (
            <>
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
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-11 px-3 rounded-md border border-rule-soft bg-bg font-serif text-base text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none transition-colors"
                    placeholder="At least 8 characters"
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
                    autoComplete="new-password"
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
                  disabled={loading}
                  className="w-full h-11 rounded-md bg-accent text-bg font-sans text-sm tracking-wider uppercase hover:bg-accent-hi transition-colors disabled:opacity-50"
                >
                  {loading ? 'Updating...' : 'Update password'}
                </button>
              </form>
              <p className="font-sans text-xs text-ink-faint text-center mt-4">
                {formatTime(secondsLeft)} remaining
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
