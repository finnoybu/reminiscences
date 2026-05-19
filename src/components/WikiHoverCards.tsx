// Hover-card popover for Wikipedia links inside a chapter article. When
// the reader's cursor lingers on an <a href="*.wikipedia.org/wiki/..."/>
// for ~300ms, fetch the REST API summary (with thumbnail + extract) and
// render a portal-anchored card near the link. Ported from
// main:components/WikiHoverCards.tsx with the containerRef prop swapped
// for the now-standard document.querySelector('.prose-memoir') pattern.

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

interface WikiSummary {
  title: string;
  extract: string;
  thumbnail?: { source: string; width: number; height: number };
  pageUrl: string;
}

// Subset of the Wikipedia REST summary API response we actually read.
// See https://en.wikipedia.org/api/rest_v1/page/summary/{title}.
interface WikiApiResponse {
  title?: string;
  titles?: { display?: string };
  extract?: string;
  thumbnail?: { source: string; width: number; height: number };
  content_urls?: { desktop?: { page?: string } };
}

// Module-level cache survives component re-mounts (e.g. when ReaderRoot's
// inner state changes). Same link is fetched at most once per page load.
const cache = new Map<string, WikiSummary | null>();

function extractWikiTitle(href: string): string | null {
  try {
    const url = new URL(href);
    const hostname = url.hostname.toLowerCase();
    if (hostname !== 'wikipedia.org' && !hostname.endsWith('.wikipedia.org')) return null;
    const match = url.pathname.match(/^\/wiki\/(.+)$/);
    if (!match) return null;
    return decodeURIComponent(match[1]);
  } catch {
    return null;
  }
}

async function fetchSummary(href: string): Promise<WikiSummary | null> {
  if (cache.has(href)) return cache.get(href)!;

  const title = extractWikiTitle(href);
  if (!title) return null;

  try {
    const lang = new URL(href).hostname.split('.')[0] || 'en';
    const res = await fetch(
      `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`,
      { headers: { Accept: 'application/json' } },
    );
    if (!res.ok) throw new Error(res.statusText);
    const data = (await res.json()) as WikiApiResponse;
    const summary: WikiSummary = {
      title: data.titles?.display || data.title || title,
      extract: data.extract || '',
      thumbnail: data.thumbnail,
      pageUrl: data.content_urls?.desktop?.page || href,
    };
    cache.set(href, summary);
    return summary;
  } catch {
    cache.set(href, null);
    return null;
  }
}

export default function WikiHoverCards() {
  const [summary, setSummary] = useState<WikiSummary | null>(null);
  const [position, setPosition] = useState<{ x: number; y: number; above: boolean }>({
    x: 0,
    y: 0,
    above: false,
  });
  const [visible, setVisible] = useState(false);
  const showTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const clearTimers = () => {
    if (showTimer.current) clearTimeout(showTimer.current);
    if (hideTimer.current) clearTimeout(hideTimer.current);
  };

  const scheduleHide = useCallback(() => {
    clearTimers();
    hideTimer.current = setTimeout(() => setVisible(false), 200);
  }, []);

  const cancelHide = useCallback(() => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
  }, []);

  useEffect(() => {
    const container = document.querySelector<HTMLElement>('.prose-memoir');
    if (!container) return;

    const onEnter = (e: MouseEvent) => {
      const link = (e.target as HTMLElement).closest?.('a[href*="wikipedia.org"]') as
        | HTMLAnchorElement
        | null;
      if (!link) return;

      clearTimers();
      showTimer.current = setTimeout(async () => {
        const data = await fetchSummary(link.href);
        if (!data) return;

        const rect = link.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const above = spaceBelow < 320;

        setPosition({
          x: Math.min(rect.left + rect.width / 2, window.innerWidth - 200),
          y: above ? rect.top + window.scrollY : rect.bottom + window.scrollY,
          above,
        });
        setSummary(data);
        setVisible(true);
      }, 300);
    };

    const onLeave = (e: MouseEvent) => {
      const link = (e.target as HTMLElement).closest?.('a[href*="wikipedia.org"]');
      if (!link) return;
      scheduleHide();
    };

    container.addEventListener('mouseenter', onEnter, true);
    container.addEventListener('mouseleave', onLeave, true);
    return () => {
      container.removeEventListener('mouseenter', onEnter, true);
      container.removeEventListener('mouseleave', onLeave, true);
      clearTimers();
    };
  }, [scheduleHide]);

  if (!visible || !summary) return null;

  return createPortal(
    <div
      ref={cardRef}
      role="tooltip"
      onMouseEnter={cancelHide}
      onMouseLeave={scheduleHide}
      className="fixed z-50 w-80 bg-bg-elev border border-rule rounded-lg shadow-lift overflow-hidden animate-in"
      style={{
        left: `clamp(12px, ${position.x}px - 10rem, calc(100vw - 21rem))`,
        ...(position.above
          ? { bottom: `calc(100vh - ${position.y - window.scrollY}px + 8px)` }
          : { top: `${position.y - window.scrollY + 8}px` }),
      }}
    >
      {summary.thumbnail && (
        <div className="relative h-36 overflow-hidden bg-bg-sunk">
          <img
            src={summary.thumbnail.source}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-4">
        <h4
          className="font-display text-[1.125rem] leading-tight text-ink mb-2"
          style={{ fontFeatureSettings: "'ss01'" }}
          dangerouslySetInnerHTML={{ __html: summary.title }}
        />
        <p className="font-serif text-base leading-relaxed text-ink-muted line-clamp-4">
          {summary.extract}
        </p>
        <a
          href={summary.pageUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1.5 font-sans text-xs uppercase tracking-widest text-accent hover:text-accent-hi transition-colors"
        >
          Read on Wikipedia
          <span aria-hidden>↗</span>
        </a>
      </div>
    </div>,
    document.body,
  );
}
