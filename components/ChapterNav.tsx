import Link from 'next/link'
import Image from 'next/image'
import type { ChapterMeta } from '@/lib/chapters'
import Arrowhead from './Arrowhead'

export default function ChapterNav({
  prev,
  next,
}: {
  prev: ChapterMeta | null
  next: ChapterMeta | null
}) {
  return (
    <nav className="mt-16 pt-10 border-t border-rule-soft">
      <div className="grid md:grid-cols-2 gap-4">
        {prev ? (
          <Link
            href={`/chapters/${prev.slug}`}
            className="chapter-card group relative flex items-stretch gap-4 overflow-hidden rounded-lg border border-rule-soft bg-bg-elev hover:border-rule p-4"
          >
            <div className="relative flex-shrink-0 w-20 h-20 rounded overflow-hidden bg-bg-sunk">
              {prev.hero?.image && (
                <Image src={prev.hero.image} alt="" fill sizes="80px" className="cover object-cover grayscale sepia-[.15]" />
              )}
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <p className="eyebrow mb-1 text-[10px]">← Previous</p>
              <p
                className="font-display text-lg leading-tight text-ink group-hover:text-accent transition-colors truncate"
                style={{ fontFeatureSettings: "'ss01'" }}
              >
                {prev.title}
              </p>
            </div>
          </Link>
        ) : (
          <div />
        )}
        {next ? (
          <Link
            href={`/chapters/${next.slug}`}
            className="chapter-card group relative flex items-stretch gap-4 overflow-hidden rounded-lg border border-rule-soft bg-bg-elev hover:border-rule p-4 md:flex-row-reverse md:text-right"
          >
            <div className="relative flex-shrink-0 w-20 h-20 rounded overflow-hidden bg-bg-sunk">
              {next.hero?.image && (
                <Image src={next.hero.image} alt="" fill sizes="80px" className="cover object-cover grayscale sepia-[.15]" />
              )}
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <p className="eyebrow mb-1 text-[10px]">Next →</p>
              <p
                className="font-display text-lg leading-tight text-ink group-hover:text-accent transition-colors truncate"
                style={{ fontFeatureSettings: "'ss01'" }}
              >
                {next.title}
              </p>
            </div>
          </Link>
        ) : (
          <div />
        )}
      </div>
      <div className="mt-8 text-center">
        <Link
          href="/#chapters"
          className="font-sans text-xs uppercase tracking-widest text-ink-muted hover:text-accent transition-colors"
        >
          <Arrowhead size={24} /> All chapters
        </Link>
      </div>
    </nav>
  )
}
