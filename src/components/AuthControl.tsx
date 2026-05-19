import { useEffect, useRef, useState } from 'react';
import { signOut } from '~/lib/auth-client';

// Single React island that owns the header's auth UI. Renders either the
// UserMenu (avatar + dropdown) when signed in, or the "Sign in" button when
// signed out. Replaces the SSR-render-both-states + script-toggle pattern in
// SiteHeader.astro because (a) prerendered pages always render the signed-out
// state, and the swap looks like a flash, and (b) this is what the Next.js
// production used.

interface User {
  email: string;
  name: string | null;
}

export default function AuthControl() {
  const [user, setUser] = useState<User | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/whoami', { credentials: 'include' })
      .then(async (res): Promise<{ user: User | null }> =>
        res.ok ? await res.json() : { user: null }
      )
      .then((data) => {
        if (cancelled) return;
        setUser(data.user);
        setLoaded(true);
      })
      .catch(() => {
        if (cancelled) return;
        setLoaded(true);
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Hold a stable amount of space while we resolve auth state so the header
  // doesn't reflow when the data lands. Matches the size of either the
  // signed-out button or the signed-in avatar.
  if (!loaded) {
    return <div className="ml-2 w-9 h-9" aria-hidden="true" />;
  }

  if (!user) {
    return (
      <button
        type="button"
        onClick={() => window.dispatchEvent(new CustomEvent('auth:open'))}
        className="ml-2 px-3 py-2 font-sans text-sm tracking-wider uppercase text-ink-muted hover:text-accent transition-colors"
      >
        Sign in/up
      </button>
    );
  }

  const initial = (user.name?.[0] || user.email?.[0] || '?').toUpperCase();
  const displayName = user.name || user.email.split('@')[0] || 'Reader';

  return (
    <div ref={ref} className="relative ml-2">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-label="Account menu"
        className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-accent text-bg font-sans text-sm font-medium hover:bg-accent-hi transition-colors"
      >
        {initial}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-bg-elev border border-rule-soft rounded-lg shadow-lift overflow-hidden animate-in z-50">
          <div className="px-4 py-3 border-b border-rule-soft">
            <p className="font-sans text-sm font-medium text-ink truncate">{displayName}</p>
            <p className="font-sans text-xs text-ink-faint truncate">{user.email}</p>
          </div>
          <div className="py-1">
            <a
              href="/account"
              onClick={() => setOpen(false)}
              className="block px-4 py-2 font-sans text-sm text-ink-muted hover:text-ink hover:bg-bg-sunk transition-colors"
            >
              My account
            </a>
            <a
              href="/account/bookmarks"
              onClick={() => setOpen(false)}
              className="block px-4 py-2 font-sans text-sm text-ink-muted hover:text-ink hover:bg-bg-sunk transition-colors"
            >
              Bookmarks
            </a>
            <a
              href="/account/annotations"
              onClick={() => setOpen(false)}
              className="block px-4 py-2 font-sans text-sm text-ink-muted hover:text-ink hover:bg-bg-sunk transition-colors"
            >
              Notes
            </a>
          </div>
          <div className="border-t border-rule-soft py-1">
            <button
              type="button"
              onClick={async () => {
                await signOut();
                setOpen(false);
                window.location.href = '/';
              }}
              className="block w-full text-left px-4 py-2 font-sans text-sm text-ink-muted hover:text-ink hover:bg-bg-sunk transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
