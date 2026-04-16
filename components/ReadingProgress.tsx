'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useReader } from '@/lib/reader-context'

export default function ReadingProgress() {
  const { preferences } = useReader()
  const [chapters, setChapters] = useState<number>(0)
  const [currentIndex, setCurrentIndex] = useState<number>(-1)

  useEffect(() => {
    setChapters(69)

    if (preferences.currentChapter) {
      fetch(`/api/chapters?slug=${preferences.currentChapter}`)
        .then((res) => res.ok ? res.json() : null)
        .then((data) => { if (data) setCurrentIndex(data.index) })
        .catch(() => {})
    }
  }, [preferences.currentChapter])

  if (!preferences.currentChapter || currentIndex === -1) return null

  const progress = ((currentIndex + 1) / chapters) * 100

  return (
    <Link
      href={`/chapters/${preferences.currentChapter}` as any}
      className="chapter-card group block mb-10 p-5 bg-bg-elev border border-rule-soft rounded-lg hover:border-rule transition-colors"
    >
      <div className="flex justify-between items-center mb-3">
        <span className="eyebrow text-[10px]">Continue reading</span>
        <span className="font-sans text-xs text-ink-faint">
          {currentIndex + 1} of {chapters}
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
    </Link>
  )
}
