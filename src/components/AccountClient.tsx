import { useCallback, useState } from 'react';
import { authClient, signOut } from '~/lib/auth-client';

// Faithful port of main:app/account/AccountClient.tsx. Same JSX, same Tailwind
// classes, three confirmation modals (email change, password reset, account
// deletion). Supabase auth calls swapped for Better Auth equivalents:
//   supabase.auth.updateUser({ email })       → authClient.changeEmail
//   supabase.auth.resetPasswordForEmail(...)  → authClient.requestPasswordReset
//   supabase.auth.signOut()                   → signOut
//   POST /api/account/delete (custom)         → authClient.deleteUser (built-in)

interface User {
  id: string;
  email: string;
  name: string | null;
}

interface Stats {
  chaptersRead: number;
  hasPurchase: boolean;
}

interface Props {
  user: User;
  stats: Stats;
  totalChapters: number;
}

export default function AccountClient({ user, stats, totalChapters }: Props) {
  const [newEmail, setNewEmail] = useState('');
  const [emailSaving, setEmailSaving] = useState(false);
  const [emailMessage, setEmailMessage] = useState<string | null>(null);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showEmailConfirm, setShowEmailConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);

  const handleChangeEmailSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) return;
    setEmailMessage(null);
    setShowEmailConfirm(true);
  }, [newEmail]);

  const handleChangeEmailConfirm = useCallback(async () => {
    setShowEmailConfirm(false);
    setEmailSaving(true);
    try {
      const { error } = await (authClient as any).changeEmail({
        newEmail,
        callbackURL: '/',
      });
      if (error) {
        setEmailSaving(false);
        setEmailMessage(error.message ?? 'Could not change email.');
        return;
      }
      // Better Auth sends a confirmation link to newEmail. The session stays
      // active until the user clicks the link; surfacing that to the user is
      // clearer than a forced sign-out.
      setEmailSaving(false);
      setEmailMessage(`Confirmation link sent to ${newEmail}. Click it to finish switching your email.`);
    } catch (err: any) {
      setEmailSaving(false);
      setEmailMessage(err?.message ?? 'Could not change email.');
    }
  }, [newEmail]);

  const handleResetPassword = useCallback(async () => {
    setPasswordSaving(true);
    setPasswordMessage(null);
    try {
      const { error } = await (authClient as any).requestPasswordReset({
        email: user.email,
        redirectTo: '/',
      });
      if (error) {
        setPasswordSaving(false);
        setPasswordMessage(error.message ?? 'Could not send the reset link.');
        return;
      }
      // Sign the user out and bounce home — they'll set a new password via
      // the link in their email, then sign in again. Matches the Supabase flow.
      await signOut();
      window.location.href = '/';
    } catch (err: any) {
      setPasswordSaving(false);
      setPasswordMessage(err?.message ?? 'Could not send the reset link.');
    }
  }, [user.email]);

  const handleSignOut = useCallback(async () => {
    await signOut();
    window.location.href = '/';
  }, []);

  const handleDeleteAccount = useCallback(async () => {
    setDeleting(true);
    try {
      const { error } = await (authClient as any).deleteUser({});
      if (error) {
        setDeleting(false);
        return;
      }
      window.location.href = '/';
    } catch {
      setDeleting(false);
    }
  }, []);

  const displayName = user.name || user.email.split('@')[0] || 'Reader';

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

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
          <div className="p-5 bg-bg-elev border border-rule-soft rounded-lg">
            <p className="eyebrow text-[10px] mb-2">Chapters visited</p>
            <p className="font-display text-3xl text-ink" style={{ fontFeatureSettings: "'ss01'" }}>
              {stats.chaptersRead}
              <span className="text-base text-ink-faint"> / {totalChapters}</span>
            </p>
          </div>
          <div className="p-5 bg-bg-elev border border-rule-soft rounded-lg">
            <p className="eyebrow text-[10px] mb-2">Progress</p>
            <p className="font-display text-3xl text-ink" style={{ fontFeatureSettings: "'ss01'" }}>
              {totalChapters > 0 ? Math.round((stats.chaptersRead / totalChapters) * 100) : 0}%
            </p>
          </div>
          <div className="p-5 bg-bg-elev border border-rule-soft rounded-lg">
            <p className="eyebrow text-[10px] mb-2">Digital edition</p>
            <p className="font-display text-xl text-ink" style={{ fontFeatureSettings: "'ss01'" }}>
              {stats.hasPurchase ? 'Purchased' : 'Not purchased'}
            </p>
            {stats.hasPurchase ? (
              <div className="mt-2 flex gap-2">
                <a href="/api/download/salt-and-silence?format=pdf" className="font-sans text-xs text-accent hover:text-accent-hi transition-colors">PDF</a>
                <a href="/api/download/salt-and-silence?format=epub" className="font-sans text-xs text-accent hover:text-accent-hi transition-colors">ePub</a>
              </div>
            ) : (
              <a href="/shop" className="mt-2 inline-block font-sans text-xs text-accent hover:text-accent-hi transition-colors">
                Buy for $7.49
              </a>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <a
            href="/account/bookmarks"
            className="chapter-card group flex items-center justify-between p-5 bg-bg-elev border border-rule-soft rounded-lg hover:border-rule"
          >
            <div>
              <h3 className="font-display text-lg text-ink group-hover:text-accent transition-colors" style={{ fontFeatureSettings: "'ss01'" }}>
                Bookmarks
              </h3>
              <p className="font-sans text-sm text-ink-muted">Your saved positions across chapters</p>
            </div>
            <span className="text-ink-faint group-hover:text-accent transition-colors">→</span>
          </a>
          <a
            href="/account/annotations"
            className="chapter-card group flex items-center justify-between p-5 bg-bg-elev border border-rule-soft rounded-lg hover:border-rule"
          >
            <div>
              <h3 className="font-display text-lg text-ink group-hover:text-accent transition-colors" style={{ fontFeatureSettings: "'ss01'" }}>
                Notes
              </h3>
              <p className="font-sans text-sm text-ink-muted">Your annotations and margin notes</p>
            </div>
            <span className="text-ink-faint group-hover:text-accent transition-colors">→</span>
          </a>
        </div>

        <div className="mt-12 pt-12 border-t border-rule-soft space-y-8">
          <h2
            className="font-display text-2xl text-ink"
            style={{ fontFeatureSettings: "'ss01'" }}
          >
            Settings
          </h2>

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
                {emailSaving ? 'Sending…' : 'Update'}
              </button>
            </form>
            {emailMessage && (
              <p className="mt-2 font-sans text-sm text-ink-muted">{emailMessage}</p>
            )}
          </div>

          {showEmailConfirm && (
            <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] p-4">
              <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={() => setShowEmailConfirm(false)} />
              <div className="relative w-full max-w-sm bg-bg-elev border border-rule-soft rounded-lg shadow-lift overflow-hidden animate-in">
                <div className="px-6 pt-6">
                  <h2 className="font-display text-2xl text-ink" style={{ fontFeatureSettings: "'ss01'" }}>
                    Change your email address?
                  </h2>
                </div>
                <div className="px-6 pb-6 pt-4">
                  <p className="font-serif text-base text-ink-muted leading-relaxed mb-6">
                    A confirmation link will be sent to <strong className="text-ink">{newEmail}</strong>. Your account will switch to that address once you click it.
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
                      {emailSaving ? 'Sending…' : 'Continue'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

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
              {passwordSaving ? 'Sending…' : 'Send reset link'}
            </button>
            {passwordMessage && (
              <p className="mt-2 font-sans text-sm text-ink-muted">{passwordMessage}</p>
            )}
          </div>

          {showResetConfirm && (
            <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] p-4">
              <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={() => setShowResetConfirm(false)} />
              <div className="relative w-full max-w-sm bg-bg-elev border border-rule-soft rounded-lg shadow-lift overflow-hidden animate-in">
                <div className="px-6 pt-6">
                  <h2 className="font-display text-2xl text-ink" style={{ fontFeatureSettings: "'ss01'" }}>
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
                        setShowResetConfirm(false);
                        handleResetPassword();
                      }}
                      disabled={passwordSaving}
                      className="flex-1 h-11 rounded-md bg-accent text-bg font-sans text-sm uppercase tracking-wider hover:bg-accent-hi transition-colors disabled:opacity-50"
                    >
                      {passwordSaving ? 'Sending…' : 'Continue'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-rule-soft">
            <button
              type="button"
              onClick={handleSignOut}
              className="h-11 px-5 rounded-md border border-rule-soft font-sans text-xs uppercase tracking-widest text-ink-faint hover:border-red-300 hover:text-red-600 transition-colors"
            >
              Sign out
            </button>
          </div>

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

          {showDeleteConfirm && (
            <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] p-4">
              <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText(''); }} />
              <div className="relative w-full max-w-sm bg-bg-elev border border-rule-soft rounded-lg shadow-lift overflow-hidden animate-in">
                <div className="px-6 pt-6">
                  <h2 className="font-display text-2xl text-red-600 dark:text-red-400" style={{ fontFeatureSettings: "'ss01'" }}>
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
                      onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText(''); }}
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
                      {deleting ? 'Deleting…' : 'Delete forever'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
