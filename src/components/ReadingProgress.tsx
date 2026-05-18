import { useReader } from '~/lib/reader-context';

interface Props {
  chapterIndex: Record<string, number>;
  totalChapters: number;
}

export default function ReadingProgress({ chapterIndex, totalChapters }: Props) {
  const { preferences } = useReader();
  const slug = preferences.currentChapter;
  if (!slug) return null;

  const idx = chapterIndex[slug];
  if (idx === undefined || idx < 0) return null;

  const progress = ((idx + 1) / totalChapters) * 100;

  return (
    <a
      href={`/chapters/${slug}`}
      className="chapter-card group block mb-10 p-5 bg-bg-elev border border-rule-soft rounded-lg hover:border-rule transition-colors"
    >
      <div className="flex justify-between items-center mb-3">
        <span className="eyebrow text-[10px]">Continue reading</span>
        <span className="font-sans text-xs text-ink-faint">
          {idx + 1} of {totalChapters}
        </span>
      </div>
      <div className="w-full bg-bg-sunk h-1.5 rounded-full overflow-hidden mb-3">
        <div
          className="bg-brass h-full rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="font-sans text-xs text-ink-muted">
        {Math.round(progress)}% through the manuscript
      </p>
    </a>
  );
}
