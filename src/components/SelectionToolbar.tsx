// Pop-up toolbar that appears on text selection inside a chapter. Lets
// signed-in readers bookmark a passage, save a note, or report errata.
// Signed-out readers see a single "Sign in to save" affordance that
// dispatches `auth:open` for AuthModalRoot to handle.
//
// Ported from main:components/SelectionToolbar.tsx with:
//
// - articleRef and bookSlug props dropped — the island locates the
//   article via document.querySelector('.prose-memoir').
// - Supabase inserts/deletes replaced with fetch calls to the REST
//   endpoints (/api/bookmarks, /api/annotations, /api/errata,
//   /api/bookmarks/:id, /api/annotations/:id).
// - Direct <AuthModal /> render swapped for the auth:open event the rest
//   of the site already uses.

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useReader } from '~/lib/reader-context';
import {
  computePopoverPosition,
  getParagraphAtOffset,
  getSelectionInfo,
  type SelectionInfo,
} from '~/lib/selection-utils';
import Toast from './Toast';

interface SelectionToolbarProps {
  chapterSlug: string;
}

type Mode = 'toolbar' | 'note-form' | 'errata-form';

function getArticle(): HTMLElement | null {
  return document.querySelector('.prose-memoir');
}

export default function SelectionToolbar({ chapterSlug }: SelectionToolbarProps) {
  const { user } = useReader();

  const [info, setInfo] = useState<SelectionInfo | null>(null);
  const [mode, setMode] = useState<Mode | null>(null);
  const [note, setNote] = useState('');
  const [errataDesc, setErrataDesc] = useState('');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; key: number } | null>(null);

  const toolbarRef = useRef<HTMLDivElement>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flash = useCallback((message: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ message, key: Date.now() });
    toastTimer.current = setTimeout(() => setToast(null), 2000);
  }, []);

  const dismiss = useCallback(() => {
    setMode(null);
    setInfo(null);
    setNote('');
    setErrataDesc('');
  }, []);

  // Watch for text selections inside the article. Ignore selections that
  // start/end inside the toolbar itself.
  useEffect(() => {
    const handler = (e: MouseEvent | TouchEvent) => {
      if (
        toolbarRef.current &&
        e.target instanceof Node &&
        toolbarRef.current.contains(e.target)
      ) {
        return;
      }

      setTimeout(() => {
        const article = getArticle();
        if (!article) return;
        const sel = getSelectionInfo(article);
        if (sel) {
          setInfo(sel);
          setMode('toolbar');
          setNote('');
          setErrataDesc('');
        } else {
          dismiss();
        }
      }, 10);
    };

    document.addEventListener('mouseup', handler);
    document.addEventListener('touchend', handler);
    return () => {
      document.removeEventListener('mouseup', handler);
      document.removeEventListener('touchend', handler);
    };
  }, [dismiss]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dismiss();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [dismiss]);

  const getBookmarkParagraph = (): HTMLParagraphElement | null => {
    if (!info) return null;
    const article = getArticle();
    if (!article) return null;
    return getParagraphAtOffset(article, info.selectionStart);
  };

  const paragraphHasBookmark = (): boolean => {
    return getBookmarkParagraph()?.classList.contains('has-bookmark') ?? false;
  };

  const getOverlappingAnnotation = (): { id: string; element: Element } | null => {
    if (!info) return null;
    const article = getArticle();
    if (!article) return null;

    const marks = article.querySelectorAll('mark.annotation-highlight');
    for (const mark of marks) {
      const id = mark.getAttribute('data-annotation-id');
      if (!id) continue;
      if (mark.textContent && info.text && mark.textContent.includes(info.text.slice(0, 20))) {
        return { id, element: mark };
      }
    }

    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      let node: Node | null = sel.getRangeAt(0).startContainer;
      while (node && node !== article) {
        if (node instanceof HTMLElement && node.classList.contains('annotation-highlight')) {
          const id = node.getAttribute('data-annotation-id');
          if (id) return { id, element: node };
        }
        node = node.parentNode;
      }
    }
    return null;
  };

  const hasExistingNote = () => getOverlappingAnnotation() !== null;

  const toggleBookmark = async () => {
    if (!user || !info) return;
    setSaving(true);

    const paragraph = getBookmarkParagraph();

    if (paragraph?.classList.contains('has-bookmark')) {
      const ribbon = paragraph.querySelector('.bookmark-ribbon');
      const bookmarkId = ribbon?.getAttribute('data-bookmark-id');
      if (bookmarkId) {
        try {
          await fetch(`/api/bookmarks/${bookmarkId}`, {
            method: 'DELETE',
            credentials: 'include',
          });
        } catch {}
      }
      setSaving(false);
      window.getSelection()?.removeAllRanges();
      dismiss();
      window.dispatchEvent(new Event('bookmark-saved'));
      flash('Bookmark removed');
      return;
    }

    let label = info.text.slice(0, 80);
    if (paragraph?.textContent) {
      const words = paragraph.textContent.trim().split(/\s+/);
      label = words.slice(0, 8).join(' ');
    }

    try {
      await fetch('/api/bookmarks', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chapterSlug,
          scrollPosition: info.scrollPosition,
          selectionStart: info.selectionStart,
          label,
        }),
      });
    } catch {}
    setSaving(false);
    window.getSelection()?.removeAllRanges();
    dismiss();
    window.dispatchEvent(new Event('bookmark-saved'));
    flash('Bookmark saved');
  };

  const toggleAnnotation = async () => {
    if (!user || !info) return;

    const existing = getOverlappingAnnotation();
    if (existing) {
      setSaving(true);
      try {
        await fetch(`/api/annotations/${existing.id}`, {
          method: 'DELETE',
          credentials: 'include',
        });
      } catch {}
      setSaving(false);
      window.getSelection()?.removeAllRanges();
      dismiss();
      window.dispatchEvent(new Event('annotation-saved'));
      flash('Note removed');
      return;
    }

    setMode('note-form');
  };

  const saveAnnotation = async () => {
    if (!user || !info) return;
    setSaving(true);
    try {
      await fetch('/api/annotations', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chapterSlug,
          textSelection: info.text,
          note,
          selectionStart: info.selectionStart,
          selectionEnd: info.selectionEnd,
        }),
      });
    } catch {}
    setSaving(false);
    window.getSelection()?.removeAllRanges();
    dismiss();
    window.dispatchEvent(new Event('annotation-saved'));
    flash('Note saved');
  };

  const submitErrata = async () => {
    if (!user || !info) return;
    setSaving(true);
    try {
      await fetch('/api/errata', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chapterSlug,
          textSelection: info.text,
          description: errataDesc,
        }),
      });
    } catch {}
    setSaving(false);
    window.getSelection()?.removeAllRanges();
    dismiss();
    flash('Errata reported—thank you');
  };

  if (!mode || !info) {
    return toast ? <Toast message={toast.message} visible={!!toast} /> : null;
  }

  const isForm = mode === 'note-form' || mode === 'errata-form';
  const popoverWidth = isForm ? 320 : 200;
  const popoverHeight = isForm ? 220 : 126;
  const pos = computePopoverPosition(info.rect, popoverWidth, popoverHeight);

  const menuItemClass =
    'w-full flex items-center gap-2.5 h-10 px-4 font-sans text-xs uppercase tracking-widest whitespace-nowrap text-ink-muted hover:text-accent hover:bg-bg-sunk transition-colors disabled:opacity-50 text-left';

  return (
    <>
      {createPortal(
        <div
          ref={toolbarRef}
          className="fixed z-50 animate-in"
          style={{ left: pos.x, top: pos.y, width: popoverWidth }}
        >
          <div className="bg-bg-elev border border-rule-soft rounded-lg shadow-lg overflow-hidden">
            {mode === 'toolbar' && (
              <div className="flex flex-col py-1">
                {user ? (
                  <>
                    <button
                      onClick={toggleBookmark}
                      disabled={saving}
                      className={menuItemClass}
                    >
                      <BookmarkIcon filled={paragraphHasBookmark()} />
                      {paragraphHasBookmark() ? 'Remove' : 'Bookmark'}
                    </button>
                    <button
                      onClick={toggleAnnotation}
                      disabled={saving}
                      className={menuItemClass}
                    >
                      <NoteIcon />
                      {hasExistingNote() ? 'Remove note' : 'Add note'}
                    </button>
                    <div className="mx-3 h-px bg-rule-soft" />
                    <button
                      onClick={() => setMode('errata-form')}
                      disabled={saving}
                      className={menuItemClass}
                    >
                      <ErrataIcon />
                      Report errata
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      dismiss();
                      window.dispatchEvent(new CustomEvent('auth:open'));
                    }}
                    className={menuItemClass}
                  >
                    Sign in to save
                  </button>
                )}
              </div>
            )}

            {mode === 'note-form' && (
              <div className="p-4 space-y-3">
                <blockquote className="font-serif text-sm italic text-ink-muted border-l-2 border-brass pl-3 line-clamp-3">
                  &ldquo;{info.text}&rdquo;
                </blockquote>
                <textarea
                  id="annotation-note"
                  name="annotation-note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Add your note..."
                  rows={3}
                  className="w-full border border-rule-soft bg-bg rounded-md px-3 py-2 font-serif text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-accent resize-none"
                  autoFocus
                />
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => setMode('toolbar')}
                    className="h-9 px-3 font-sans text-xs uppercase tracking-widest text-ink-muted hover:text-ink transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveAnnotation}
                    disabled={saving}
                    className="h-9 px-4 bg-accent text-bg font-sans text-xs uppercase tracking-widest rounded-md hover:bg-accent-hi transition-colors disabled:opacity-50"
                  >
                    {saving ? 'Saving…' : 'Save'}
                  </button>
                </div>
              </div>
            )}

            {mode === 'errata-form' && (
              <div className="p-4 space-y-3">
                <blockquote className="font-serif text-sm italic text-ink-muted border-l-2 border-brass pl-3 line-clamp-3">
                  &ldquo;{info.text}&rdquo;
                </blockquote>
                <textarea
                  id="errata-description"
                  name="errata-description"
                  value={errataDesc}
                  onChange={(e) => setErrataDesc(e.target.value)}
                  placeholder="What needs correcting?"
                  rows={3}
                  className="w-full border border-rule-soft bg-bg rounded-md px-3 py-2 font-serif text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-accent resize-none"
                  autoFocus
                />
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => setMode('toolbar')}
                    className="h-9 px-3 font-sans text-xs uppercase tracking-widest text-ink-muted hover:text-ink transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitErrata}
                    disabled={saving || !errataDesc.trim()}
                    className="h-9 px-4 bg-accent text-bg font-sans text-xs uppercase tracking-widest rounded-md hover:bg-accent-hi transition-colors disabled:opacity-50"
                  >
                    {saving ? 'Sending…' : 'Report'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>,
        document.body,
      )}

      {toast && <Toast message={toast.message} visible={!!toast} />}
    </>
  );
}

function BookmarkIcon({ filled = false }: { filled?: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
    </svg>
  );
}

function NoteIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

function ErrataIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}
