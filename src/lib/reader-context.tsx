// React context that owns reader-specific state (preferences, current
// reading position, user). Ported from main:lib/reader-context.tsx with
// Supabase swapped for Better Auth + REST and `book_id` plumbing removed
// (chapter slugs are globally unique across both finnoybu.com sites).
//
// Theme is stored in preferences for forward-compat with memoirs but is
// NOT applied to the DOM here — SiteHeader.astro owns the theme system
// (key `finnoybu-theme`). FontSize, scroll position, and current-chapter
// are reader-local and applied here.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';

export type Theme = 'light' | 'dark' | 'high-contrast';
export type FontSize = 'sm' | 'base' | 'lg' | 'xl';

export interface ReaderPreferences {
  theme: Theme;
  fontSize: FontSize;
  currentChapter?: string;
  scrollPosition?: number;
}

interface User {
  id: string;
  email: string;
  name: string | null;
}

interface ReaderContextType {
  preferences: ReaderPreferences;
  setTheme: (theme: Theme) => void;
  setFontSize: (size: FontSize) => void;
  updateReadingPosition: (chapter: string, position: number) => void;
  user: User | null;
}

const ReaderContext = createContext<ReaderContextType | undefined>(undefined);

const STORAGE_KEY = 'hestby-reader-preferences';

const DEFAULT_PREFERENCES: ReaderPreferences = {
  theme: 'light',
  fontSize: 'base',
};

function saveLocal(prefs: ReaderPreferences) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {}
}

export function ReaderProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<ReaderPreferences>(DEFAULT_PREFERENCES);
  const [hydrated, setHydrated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const syncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Hydrate preferences from localStorage.
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setPreferences(JSON.parse(stored) as ReaderPreferences);
    } catch {}
    setHydrated(true);
  }, []);

  // Resolve user on mount; refetch on the `auth:changed` window event
  // (AuthModal/AuthControl dispatch this after a successful sign-in or
  // sign-out so live state stays consistent without a page reload).
  useEffect(() => {
    let cancelled = false;
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/whoami', { credentials: 'include' });
        if (!res.ok) {
          if (!cancelled) setUser(null);
          return;
        }
        const data = (await res.json()) as { user: User | null };
        if (!cancelled) setUser(data.user);
      } catch {
        if (!cancelled) setUser(null);
      }
    };
    fetchUser();
    const onAuthChanged = () => fetchUser();
    window.addEventListener('auth:changed', onAuthChanged);
    return () => {
      cancelled = true;
      window.removeEventListener('auth:changed', onAuthChanged);
    };
  }, []);

  // On sign-in: pull the most recent reading position from D1 and apply
  // it locally if it doesn't match what's already in localStorage. The
  // assumption is "cloud wins for different-device resume"; same-chapter
  // skips so we don't jerk the user's current scroll position backward.
  useEffect(() => {
    if (!user || !hydrated) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/reading-progress?latest=1', {
          credentials: 'include',
        });
        if (!res.ok) return;
        const data = (await res.json()) as
          | { chapterSlug: string; scrollPosition: number }
          | null;
        if (cancelled || !data?.chapterSlug) return;
        setPreferences((prev) => {
          if (!prev.currentChapter || data.chapterSlug !== prev.currentChapter) {
            const updated = {
              ...prev,
              currentChapter: data.chapterSlug,
              scrollPosition: data.scrollPosition,
            };
            saveLocal(updated);
            return updated;
          }
          return prev;
        });
      } catch {}
    })();
    return () => {
      cancelled = true;
    };
  }, [user, hydrated]);

  // Debounced upsert to D1. The 3 s delay is load-bearing — preserves the
  // scroll → 500 ms throttle → state+localStorage immediate → 3 s debounce
  // → server upsert chain documented in the migration handoff.
  const syncToCloud = useCallback(
    (chapter: string, position: number) => {
      if (!user) return;
      if (syncTimer.current) clearTimeout(syncTimer.current);
      syncTimer.current = setTimeout(async () => {
        const doc = document.documentElement;
        const max = doc.scrollHeight - doc.clientHeight;
        const percent = max > 0 ? Math.min(1, position / max) : 0;
        try {
          await fetch('/api/reading-progress', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chapterSlug: chapter,
              scrollPosition: position,
              percent,
            }),
          });
        } catch {}
      }, 3000);
    },
    [user],
  );

  // Apply font-size to the article prose container, not <html>. Reader
  // font-size is a *reading* preference and was leaking up to chrome:
  // Tailwind's text-base { font-size: 1rem } on <html> overrides the
  // 17px baseline in global.css, shrinking the entire page (including
  // the sticky SiteHeader) on pages where ReaderProvider mounts.
  // Theme is intentionally NOT applied here — SiteHeader.astro owns it.
  useEffect(() => {
    if (!hydrated) return;
    const article = document.querySelector('.prose-memoir');
    if (!article) return;
    article.classList.remove('text-sm', 'text-base', 'text-lg', 'text-xl');
    article.classList.add(`text-${preferences.fontSize}`);
  }, [preferences.fontSize, hydrated]);

  const setTheme = (theme: Theme) => {
    const updated = { ...preferences, theme };
    setPreferences(updated);
    saveLocal(updated);
  };

  const setFontSize = (fontSize: FontSize) => {
    const updated = { ...preferences, fontSize };
    setPreferences(updated);
    saveLocal(updated);
  };

  const updateReadingPosition = (chapter: string, position: number) => {
    const updated = {
      ...preferences,
      currentChapter: chapter,
      scrollPosition: position,
    };
    setPreferences(updated);
    saveLocal(updated);
    syncToCloud(chapter, position);
  };

  return (
    <ReaderContext.Provider
      value={{ preferences, setTheme, setFontSize, updateReadingPosition, user }}
    >
      {children}
    </ReaderContext.Provider>
  );
}

export function useReader() {
  const ctx = useContext(ReaderContext);
  if (!ctx) {
    throw new Error('useReader must be used within ReaderProvider');
  }
  return ctx;
}
