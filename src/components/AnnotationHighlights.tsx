// Paints saved annotations (as <mark> elements) and bookmark ribbons (as
// left-margin SVGs) into the chapter article. Ported from
// main:components/AnnotationHighlights.tsx with:
//
// - articleRef prop replaced by document.querySelector('.prose-memoir') —
//   each island locates the article itself (option (b) in the port plan).
// - bookSlug prop and getBookId / book_id filtering dropped.
// - Supabase reads replaced by GET /api/annotations and /api/bookmarks.
// - Supabase bookmark delete in the ribbon click replaced by DELETE
//   /api/bookmarks/:id.
//
// Highlights are applied in REVERSE order of selectionStart — load-bearing
// because each <mark> insertion mutates the DOM and shifts the character
// offsets of any unprocessed annotations whose start lies further down
// the article.

import { useEffect, useState } from 'react';
import { useReader } from '~/lib/reader-context';
import { getParagraphAtOffset } from '~/lib/selection-utils';

interface AnnotationHighlightsProps {
  chapterSlug: string;
}

interface SavedBookmark {
  id: string;
  scrollPosition: number;
  selectionStart: number | null;
}

interface SavedAnnotation {
  id: string;
  selectionStart: number;
  selectionEnd: number;
  textSelection: string;
  note: string;
}

function addBookmarkRibbon(
  article: HTMLElement,
  scrollPos: number,
  selectionStart: number | null,
  id: string,
) {
  let closest: Element | null = null;

  if (selectionStart != null) {
    closest = getParagraphAtOffset(article, selectionStart);
  }

  if (!closest) {
    // Legacy fallback for bookmarks without a selectionStart — find the
    // paragraph whose top is nearest the saved scroll position.
    const paragraphs = article.querySelectorAll('p');
    let closestDist = Infinity;
    for (const p of paragraphs) {
      const rect = p.getBoundingClientRect();
      const docTop = rect.top + window.scrollY;
      const dist = Math.abs(docTop - scrollPos);
      if (dist < closestDist) {
        closestDist = dist;
        closest = p;
      }
    }
  }

  if (closest && !closest.querySelector('.bookmark-ribbon')) {
    closest.classList.add('has-bookmark');
    const ribbon = document.createElement('span');
    ribbon.className = 'bookmark-ribbon';
    ribbon.dataset.bookmarkId = id;
    ribbon.setAttribute('aria-label', 'Remove bookmark');
    ribbon.setAttribute('title', 'Remove bookmark');
    ribbon.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="var(--color-brass)" stroke="none"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>`;
    ribbon.addEventListener('click', async () => {
      try {
        await fetch(`/api/bookmarks/${id}`, {
          method: 'DELETE',
          credentials: 'include',
        });
      } catch {}
      ribbon.remove();
      closest!.classList.remove('has-bookmark');
      window.dispatchEvent(new Event('bookmark-saved'));
    });
    closest.insertBefore(ribbon, closest.firstChild);
  }
}

function attachNoteHover(mark: HTMLElement, noteText: string) {
  let card: HTMLElement | null = null;

  mark.addEventListener('mouseenter', () => {
    card = document.createElement('div');
    card.className = 'annotation-hover-card';
    card.textContent = noteText;

    const rect = mark.getBoundingClientRect();
    card.style.left = `${rect.left + rect.width / 2}px`;
    card.style.top = `${rect.top - 8}px`;
    document.body.appendChild(card);

    const cardRect = card.getBoundingClientRect();
    if (cardRect.left < 8) card.style.left = '8px';
    if (cardRect.right > window.innerWidth - 8) {
      card.style.left = `${window.innerWidth - cardRect.width - 8}px`;
    }
  });

  mark.addEventListener('mouseleave', () => {
    card?.remove();
    card = null;
  });
}

function highlightRange(
  article: HTMLElement,
  start: number,
  end: number,
  id: string,
  hasNote: boolean,
  noteText?: string,
): void {
  const walker = document.createTreeWalker(article, NodeFilter.SHOW_TEXT);
  let charCount = 0;
  let startNode: Text | null = null;
  let startOffset = 0;
  let endNode: Text | null = null;
  let endOffset = 0;
  let node: Node | null;

  while ((node = walker.nextNode())) {
    const len = node.textContent?.length ?? 0;

    if (!startNode && charCount + len > start) {
      startNode = node as Text;
      startOffset = start - charCount;
    }

    if (charCount + len >= end) {
      endNode = node as Text;
      endOffset = end - charCount;
      break;
    }

    charCount += len;
  }

  if (!startNode || !endNode) return;

  try {
    const range = document.createRange();
    range.setStart(startNode, startOffset);
    range.setEnd(endNode, endOffset);

    const mark = document.createElement('mark');
    mark.className = `annotation-highlight${hasNote ? ' has-note' : ''}`;
    mark.dataset.annotationId = id;
    range.surroundContents(mark);
    if (noteText) attachNoteHover(mark, noteText);
  } catch {
    // surroundContents fails when the range crosses element boundaries;
    // fall back to highlighting just from the start node forward.
    if (startNode.textContent) {
      const mark = document.createElement('mark');
      mark.className = `annotation-highlight${hasNote ? ' has-note' : ''}`;
      mark.dataset.annotationId = id;

      const beforeText = startNode.textContent.slice(0, startOffset);
      const highlightText = startNode.textContent.slice(startOffset);

      startNode.textContent = beforeText;
      mark.textContent = highlightText;
      startNode.parentNode?.insertBefore(mark, startNode.nextSibling);
      if (noteText) attachNoteHover(mark, noteText);
    }
  }
}

export default function AnnotationHighlights({ chapterSlug }: AnnotationHighlightsProps) {
  const { user } = useReader();
  const [version, setVersion] = useState(0);

  // Re-paint whenever SelectionToolbar reports a save/delete.
  useEffect(() => {
    const handler = () => setVersion((v) => v + 1);
    window.addEventListener('annotation-saved', handler);
    window.addEventListener('bookmark-saved', handler);
    return () => {
      window.removeEventListener('annotation-saved', handler);
      window.removeEventListener('bookmark-saved', handler);
    };
  }, []);

  useEffect(() => {
    if (!user) return;
    const article = document.querySelector<HTMLElement>('.prose-memoir');
    if (!article) return;

    let cancelled = false;

    // Clear stale paint before re-applying.
    document.querySelectorAll('.annotation-hover-card').forEach((c) => c.remove());
    article.querySelectorAll('mark.annotation-highlight').forEach((mark) => {
      const parent = mark.parentNode;
      if (parent) {
        parent.replaceChild(document.createTextNode(mark.textContent ?? ''), mark);
        parent.normalize();
      }
    });
    article.querySelectorAll('.bookmark-ribbon').forEach((r) => r.remove());
    article.querySelectorAll('.has-bookmark').forEach((p) => p.classList.remove('has-bookmark'));

    (async () => {
      try {
        const [annRes, bmRes] = await Promise.all([
          fetch(`/api/annotations?chapterSlug=${encodeURIComponent(chapterSlug)}`, {
            credentials: 'include',
          }),
          fetch(`/api/bookmarks?chapterSlug=${encodeURIComponent(chapterSlug)}`, {
            credentials: 'include',
          }),
        ]);
        if (cancelled) return;

        const annotations = annRes.ok ? ((await annRes.json()) as SavedAnnotation[]) : [];
        const bookmarks = bmRes.ok ? ((await bmRes.json()) as SavedBookmark[]) : [];

        if (cancelled) return;
        const articleNow = document.querySelector<HTMLElement>('.prose-memoir');
        if (!articleNow) return;

        // REVERSE-ORDER paint: each <mark> insertion shifts later text-node
        // boundaries, so we paint the tail of the article first to keep
        // earlier offsets valid.
        const paintable = annotations
          .filter((a) => a.selectionStart != null && a.selectionEnd != null)
          .sort((a, b) => b.selectionStart - a.selectionStart);

        for (const ann of paintable) {
          highlightRange(
            articleNow,
            ann.selectionStart,
            ann.selectionEnd,
            ann.id,
            !!ann.note,
            ann.note || undefined,
          );
        }

        for (const bm of bookmarks) {
          addBookmarkRibbon(articleNow, bm.scrollPosition, bm.selectionStart, bm.id);
        }
      } catch (e) {
        console.error('[AnnotationHighlights]', e);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user, chapterSlug, version]);

  return null;
}
