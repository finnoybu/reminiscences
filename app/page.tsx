import Link from 'next/link'
import { getAllChapters } from '@/lib/chapters'

export default function Home() {
  const chapters = getAllChapters()

  return (
    <main className="p-8 max-w-3xl mx-auto">
      <h1 className="text-4xl font-bold mb-2">Sea Reader</h1>
      <p className="text-lg text-slate-600 mb-8">
        A governed reader platform. Browse {chapters.length} chapters below.
      </p>

      {chapters.length > 0 ? (
        <div className="space-y-2">
          {chapters.map((chapter) => (
            <Link
              key={chapter.slug}
              href={`/chapters/${chapter.slug}`}
              className="block p-4 rounded-lg border border-slate-200 hover:bg-slate-50 transition"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-slate-200 rounded flex items-center justify-center text-sm font-mono text-slate-600">
                  {chapter.id + 1}
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-slate-900">
                    {chapter.title}
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">{chapter.slug}</p>
                </div>
                <div className="flex-shrink-0 text-slate-400">→</div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-slate-500">No chapters found. Add markdown files to content/en/</p>
      )}
    </main>
  )
}
