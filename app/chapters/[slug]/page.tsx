import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getChapterBySlug, getAdjacentChapters, getAllChapters } from '@/lib/chapters'
import Hero from '@/components/Hero'
import ReaderShell from '@/components/ReaderShell'
import ReaderSettings from '@/components/ReaderSettings'

interface ChapterPageProps {
  params: {
    slug: string
  }
}

export async function generateStaticParams() {
  const chapters = getAllChapters()
  return chapters.map((chapter) => ({
    slug: chapter.slug,
  }))
}

export const metadata = {
  title: 'Sea Reader',
  description: 'A governed reader platform',
}

export default function ChapterPage({ params }: ChapterPageProps) {
  const chapter = getChapterBySlug(params.slug)

  if (!chapter) {
    notFound()
  }

  const { prev, next } = getAdjacentChapters(params.slug)

  return (
    <>
      <ReaderShell>
        <Hero title={chapter.title} />

        <article className="prose prose-sm max-w-none mb-8">
          <div dangerouslySetInnerHTML={{ __html: chapter.content }} />
        </article>

        <nav className="flex justify-between items-center border-t pt-6 mt-8">
          {prev ? (
            <Link
              href={`/chapters/${prev.slug}`}
              className="px-4 py-2 bg-slate-100 rounded hover:bg-slate-200"
            >
              ← {prev.title}
            </Link>
          ) : (
            <div />
          )}

          <Link href="/" className="text-sm text-slate-600 hover:text-slate-900">
            Table of Contents
          </Link>

          {next ? (
            <Link
              href={`/chapters/${next.slug}`}
              className="px-4 py-2 bg-slate-100 rounded hover:bg-slate-200"
            >
              {next.title} →
            </Link>
          ) : (
            <div />
          )}
        </nav>
      </ReaderShell>
      <ReaderSettings />
    </>
  )
}
