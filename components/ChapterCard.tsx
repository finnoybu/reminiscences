import Link from 'next/link'
import Image from 'next/image'
import type { ChapterMeta } from '@/lib/chapters'

export default function ChapterCard({
  chapter,
  ordinal,
}: {
  chapter: ChapterMeta
  ordinal: number
}) {
  return (
    <Link
      href={`/chapters/${chapter.slug}`}
      className="chapter-card group relative block overflow-hidden rounded-lg border border-rule-soft bg-bg-elev hover:border-rule focus-visible:border-accent"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-bg-sunk">
        {chapter.hero?.image && (
          <Image
            src={chapter.hero.image}
            alt=""
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="cover object-cover"
          />
        )}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(to top, rgb(0 0 0 / 0.55) 0%, rgb(0 0 0 / 0.15) 35%, transparent 60%)',
          }}
        />
        <div
          className="absolute right-4 bottom-3 text-[1.5rem] text-white/75 drop-shadow-[0_1px_3px_rgb(0,0,0,0.5)]"
          style={{ fontFamily: 'var(--font-hand), cursive' }}
        >
          {ordinal}
        </div>
      </div>
      <div className="p-5">
        <h3
          className="font-display text-xl leading-tight text-ink group-hover:text-accent transition-colors"
          style={{ fontFeatureSettings: "'ss01'" }}
        >
          {chapter.title}
        </h3>
        <p className="mt-2 font-serif text-sm leading-relaxed text-ink-muted line-clamp-3">
          {chapter.excerpt}
        </p>
        <div className="mt-4 inline-flex items-center gap-1.5 font-sans text-xs uppercase tracking-widest text-brass">
          Read chapter {ordinal}
          <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">→</span>
        </div>
      </div>
    </Link>
  )
}
