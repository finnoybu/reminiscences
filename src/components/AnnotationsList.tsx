import { useRef, useState } from 'react';

const SMALL_WORDS = new Set(['a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'in', 'of', 'on', 'or', 'the', 'to']);

function formatChapterTitle(slug: string): string {
  return slug
    .split('-')
    .map((w, i) => (i === 0 || !SMALL_WORDS.has(w)) ? w.charAt(0).toUpperCase() + w.slice(1) : w)
    .join(' ');
}

interface Annotation {
  id: string;
  chapterSlug: string;
  textSelection: string;
  note: string;
  selectionStart: number | null;
  createdAt: string;
}

function buildCitation(ann: Annotation): string {
  const chapter = formatChapterTitle(ann.chapterSlug);
  const quote = ann.textSelection.length > 120
    ? ann.textSelection.slice(0, 120) + '…'
    : ann.textSelection;
  return `" ${quote} " — Olavus V. B. Vestbø, A Sailor's Reminiscences, “${chapter}.” Finnøybu Press, 2026.`;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? 'Copied' : 'Copy citation'}
      className="flex-shrink-0 text-ink-faint hover:text-accent transition-colors"
    >
      {copied ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6 9 17l-5-5" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="14" height="14" x="8" y="8" rx="2" />
          <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
        </svg>
      )}
    </button>
  );
}

interface Props {
  initial: Annotation[];
}

export default function AnnotationsList({ initial }: Props) {
  const [annotations, setAnnotations] = useState<Annotation[]>(initial);

  const removeAnnotation = async (id: string) => {
    const previous = annotations;
    setAnnotations((prev) => prev.filter((a) => a.id !== id));
    const res = await fetch(`/api/annotations/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      setAnnotations(previous);
    }
  };

  if (annotations.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="font-serif text-lg text-ink-muted mb-4">No notes yet.</p>
        <p className="font-sans text-sm text-ink-faint">
          Select text in any chapter to add a note or annotation.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {annotations.map((ann) => (
        <div
          key={ann.id}
          className="p-5 bg-bg-elev border border-rule-soft rounded-lg"
        >
          <div className="flex items-start justify-between gap-4 mb-3">
            <a
              href={`/chapters/${ann.chapterSlug}${ann.selectionStart != null ? `?scrollToText=${ann.selectionStart}` : ''}`}
              className="eyebrow text-[10px] hover:text-accent transition-colors"
            >
              {ann.chapterSlug.replace(/-/g, ' ')} ↗
            </a>
            <button
              type="button"
              onClick={() => removeAnnotation(ann.id)}
              aria-label="Remove note"
              className="flex-shrink-0 text-ink-faint hover:text-ink transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M18 6 6 18" /><path d="m6 6 12 12" />
              </svg>
            </button>
          </div>
          <div className="p-3 bg-bg-sunk rounded border border-rule-soft mb-3">
            <div className="flex items-start justify-between gap-3">
              <p className="font-serif text-md text-ink-muted italic leading-relaxed">
                {buildCitation(ann)}
              </p>
              <CopyButton text={buildCitation(ann)} />
            </div>
          </div>
          {ann.note && (
            <p className="font-serif text-lg text-ink">{ann.note}</p>
          )}
          <p className="font-sans text-xs text-ink-faint mt-3">
            {new Date(ann.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
          </p>
        </div>
      ))}
    </div>
  );
}
