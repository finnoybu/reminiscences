import Link from 'next/link'
import Image from 'next/image'
import { getAllChapters } from '@/lib/chapters'
import SearchBar from '@/components/SearchBar'
import Arrowhead from '@/components/Arrowhead'
import ReadingProgress from '@/components/ReadingProgress'
import ChapterCard from '@/components/ChapterCard'

export default function Home() {
  const all = getAllChapters()
  const intro = all.find((c) => c.slug === 'introduction')
  const chapters = all.filter((c) => c.slug !== 'introduction')

  return (
    <>
      {/* ───────── Hero ───────── */}
      <section className="relative overflow-hidden border-b border-rule-soft">
        <div className="absolute inset-0 -z-10">
          {intro?.hero?.image && (
            <Image
              src={intro.hero.image}
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover opacity-25 dark:opacity-30 grayscale sepia-[.15]"
            />
          )}
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(to bottom, var(--color-bg) 0%, rgb(0 0 0 / 0) 25%, rgb(0 0 0 / 0) 60%, var(--color-bg) 100%)',
            }}
          />
        </div>

        <div className="max-w-shell mx-auto px-6 py-24 md:py-32 lg:py-40">
          <div className="max-w-3xl">
            <p className="eyebrow mb-6">Olavus Vullum Bj&oslash;rnson Vestb&oslash;</p>
            <h1
              className="font-display text-4xl md:text-5xl lg:text-6xl leading-[1.08] text-ink"
              style={{ fontFeatureSettings: "'ss01'" }}
            >
              A Sailor&rsquo;s{' '}
              <span className="italic text-accent">Reminiscences</span>
              <br />
              <span className="text-[0.65em] text-ink-muted">from the Days of the Sailships</span>
            </h1>
            <p className="mt-8 font-serif text-xl md:text-2xl leading-relaxed text-ink-muted max-w-2xl">
              &ldquo;This story of my experiences as a sailor, in my youth, in the proud
              sailships, will probably be somewhat different from all narratives of sailors
              that I have heard or read.&rdquo;
            </p>
            <div className="mt-8 flex flex-col gap-0.5 font-serif text-sm text-ink-muted italic">
              <p>Translated from Norwegian by B.C. Berge <span className="not-italic text-ink-faint">(Nephew)</span></p>
              <p>Transcribed and edited by Ken Tannenbaum <span className="not-italic text-ink-faint">(Great-great-grandson)</span></p>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                href="/chapters/introduction"
                className="inline-flex items-center gap-2 h-12 px-6 rounded-full bg-accent text-bg font-sans text-sm tracking-wider uppercase hover:bg-accent-hi transition-colors"
              >
                Begin the voyage
                <span aria-hidden>→</span>
              </Link>
              <Link
                href="#chapters"
                className="inline-flex items-center gap-2 h-12 px-6 rounded-full border border-rule text-ink font-sans text-sm tracking-wider uppercase hover:border-accent hover:text-accent transition-colors"
              >
                Browse chapters
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ───────── Framing ───────── */}
      <section className="max-w-shell mx-auto px-6 py-20">
        <div className="max-w-measure mx-auto text-center">
          <div className="rule-ornament font-display text-2xl mb-8" style={{ fontFeatureSettings: "'ss01'" }}>
            <Arrowhead />
          </div>
          <p className="font-serif text-lg md:text-xl leading-relaxed text-ink-muted">
            Olavus set out from Norway as a boy, bound for the endless horizon. His voyages
            took him across the Atlantic in hurricanes, into the harbours of Jamaica, Boston,
            Copenhagen, and Rangoon, and aboard ships crewed by men of every nation and
            disposition. These are his accounts — {chapters.length} chapters of comedy and
            peril, written plainly, &ldquo;as near as I can remember.&rdquo;
          </p>
        </div>
      </section>

      {/* ───────── Chapter grid ───────── */}
      <section id="chapters" className="max-w-shell mx-auto px-6 pb-24 scroll-mt-20">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
          <div>
            <p className="eyebrow mb-3">The voyage, chapter by chapter</p>
            <h2
              className="font-display text-4xl md:text-5xl text-ink"
              style={{ fontFeatureSettings: "'ss01'" }}
            >
              Choose a port
            </h2>
          </div>
          <div className="md:w-96">
            <SearchBar />
          </div>
        </div>

        <ReadingProgress />

        {intro && (
          <Link
            href={`/chapters/${intro.slug}`}
            className="chapter-card group relative mb-10 grid md:grid-cols-[1.25fr_1fr] overflow-hidden rounded-lg border border-rule-soft bg-bg-elev hover:border-rule"
          >
            <div className="p-8 md:p-12 flex flex-col justify-center">
              <p className="eyebrow mb-3">Prologue</p>
              <h3
                className="font-display text-3xl md:text-4xl text-ink group-hover:text-accent transition-colors"
                style={{ fontFeatureSettings: "'ss01'" }}
              >
                {intro.title}
              </h3>
              <p className="mt-4 font-serif text-base md:text-lg leading-relaxed text-ink-muted line-clamp-4">
                {intro.excerpt}
              </p>
              <div className="mt-6 inline-flex items-center gap-2 font-sans text-xs uppercase tracking-widest text-brass">
                Begin here
                <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </div>
            </div>
            <div className="relative aspect-[1200/630] bg-bg-sunk overflow-hidden order-first md:order-last">
              {intro.hero?.image && (
                <Image
                  src={intro.hero.image}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 40vw, 100vw"
                  className="cover object-cover"
                />
              )}
            </div>
          </Link>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {chapters.map((chapter, i) => (
            <ChapterCard key={chapter.slug} chapter={chapter} ordinal={i + 1} />
          ))}
        </div>
      </section>
    </>
  )
}
