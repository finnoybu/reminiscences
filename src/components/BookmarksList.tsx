import { useState } from 'react';

interface Bookmark {
  id: string;
  chapterSlug: string;
  scrollPosition: number;
  label: string | null;
  createdAt: string; // ISO string — Drizzle dates don't serialize over island props cleanly
}

interface Props {
  initial: Bookmark[];
}

export default function BookmarksList({ initial }: Props) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(initial);

  const removeBookmark = async (id: string) => {
    const previous = bookmarks;
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
    const res = await fetch(`/api/bookmarks/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      setBookmarks(previous);
    }
  };

  if (bookmarks.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="font-serif text-lg text-ink-muted mb-4">No bookmarks yet.</p>
        <p className="font-sans text-sm text-ink-faint">
          Bookmarks will appear here as you save your favorite passages.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {bookmarks.map((bm) => (
        <div
          key={bm.id}
          className="flex items-center gap-4 p-4 bg-bg-elev border border-rule-soft rounded-lg"
        >
          <a
            href={`/chapters/${bm.chapterSlug}?scrollTo=${Math.round(bm.scrollPosition)}`}
            className="flex-1 min-w-0"
          >
            <p className="eyebrow text-[10px] mb-1">
              {bm.chapterSlug.replace(/-/g, ' ')}
            </p>
            <p className="font-display text-lg text-ink hover:text-accent transition-colors" style={{ fontFeatureSettings: "'ss01'" }}>
              {bm.label
                ? bm.label.split(/\s+/).slice(0, 8).join(' ') + '…'
                : bm.chapterSlug.replace(/-/g, ' ')}
            </p>
            <p className="font-sans text-xs text-ink-faint mt-1">
              {new Date(bm.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
            </p>
          </a>
          <button
            type="button"
            onClick={() => removeBookmark(bm.id)}
            aria-label="Remove bookmark"
            className="flex-shrink-0 text-ink-faint hover:text-ink transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6 6 18" /><path d="m6 6 12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}
