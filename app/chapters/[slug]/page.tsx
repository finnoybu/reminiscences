import { notFound } from 'next/navigation'
import { getChapterBySlug, getAdjacentChapters, getAllChapters } from '@/lib/chapters'
import ChapterArticle from '@/components/ChapterArticle'
import ChapterHero from '@/components/ChapterHero'
import ChapterNav from '@/components/ChapterNav'
import ChapterScrubber from '@/components/ChapterScrubber'
import ReadingProgressTracker from '@/components/ReadingProgressTracker'

interface ChapterPageProps {
  params: { slug: string }
}

export async function generateStaticParams() {
  const chapters = getAllChapters()
  return chapters.map((chapter) => ({ slug: chapter.slug }))
}

export function generateMetadata({ params }: ChapterPageProps) {
  const chapter = getChapterBySlug(params.slug)
  if (!chapter) return { title: 'Chapter not found' }
  const url = `/chapters/${chapter.slug}`
  const image = chapter.hero?.image
  return {
    title: chapter.title,
    description: chapter.excerpt,
    openGraph: {
      type: 'article',
      locale: 'en_US',
      url,
      siteName: "A Sailor's Reminiscences",
      title: `${chapter.title} · A Sailor's Reminiscences`,
      description: chapter.excerpt,
      ...(image && {
        images: [
          {
            url: image,
            alt: `${chapter.title} — chapter illustration`,
          },
        ],
      }),
    },
    twitter: {
      card: 'summary_large_image',
      title: `${chapter.title} · A Sailor's Reminiscences`,
      description: chapter.excerpt,
      ...(image && { images: [image] }),
    },
  }
}

export default function ChapterPage({ params }: ChapterPageProps) {
  const chapter = getChapterBySlug(params.slug)
  if (!chapter) notFound()

  const all = getAllChapters()
  const nonIntro = all.filter((c) => c.slug !== 'introduction')
  const isPrologue = chapter.slug === 'introduction'
  const ordinal = isPrologue
    ? 0
    : nonIntro.findIndex((c) => c.slug === chapter.slug) + 1

  const { prev, next } = getAdjacentChapters(params.slug)

  return (
    <>
      <ChapterScrubber />
      <ReadingProgressTracker chapterSlug={params.slug} />
      <ChapterHero
        title={chapter.title}
        image={chapter.hero?.image}
        ordinal={ordinal}
        isPrologue={isPrologue}
      />
      <div className="max-w-shell mx-auto px-6 py-12 md:py-16">
        <ChapterArticle html={chapter.content} chapterSlug={params.slug} />
        <div className="max-w-measure mx-auto">
          <ChapterNav prev={prev} next={next} />
        </div>
      </div>
    </>
  )
}
