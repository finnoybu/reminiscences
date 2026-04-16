'use client'

import { useEffect, useRef } from 'react'
import { useReader } from '@/lib/reader-context'

interface ReadingProgressTrackerProps {
  chapterSlug: string
}

export default function ReadingProgressTracker({ chapterSlug }: ReadingProgressTrackerProps) {
  const { preferences, updateReadingPosition } = useReader()
  const containerRef = useRef<HTMLDivElement>(null)
  const isRestoringRef = useRef(true)

  // Restore scroll position on mount — URL param overrides saved position
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const scrollTo = params.get('scrollTo')
    const scrollToText = params.get('scrollToText')

    if (scrollTo) {
      const timer = setTimeout(() => {
        const target = Number(scrollTo)
        const centered = Math.max(0, target - window.innerHeight / 3)
        window.scrollTo({ top: centered, behavior: 'smooth' })
        // Clear the param so it doesn't re-trigger on scroll updates
        const url = new URL(window.location.href)
        url.searchParams.delete('scrollTo')
        window.history.replaceState({}, '', url.toString())
        isRestoringRef.current = false
      }, 100)
      return () => clearTimeout(timer)
    }

    if (scrollToText) {
      const timer = setTimeout(() => {
        const article = document.querySelector('.prose-memoir')
        if (article) {
          const offset = Number(scrollToText)
          const walker = document.createTreeWalker(article, NodeFilter.SHOW_TEXT)
          let charCount = 0
          let node: Node | null
          while ((node = walker.nextNode())) {
            const len = node.textContent?.length ?? 0
            if (charCount + len > offset) {
              const range = document.createRange()
              range.setStart(node, offset - charCount)
              range.collapse(true)
              const rect = range.getBoundingClientRect()
              window.scrollTo({ top: window.scrollY + rect.top - 120, behavior: 'smooth' })
              break
            }
            charCount += len
          }
        }
        const url = new URL(window.location.href)
        url.searchParams.delete('scrollToText')
        window.history.replaceState({}, '', url.toString())
        isRestoringRef.current = false
      }, 100)
      return () => clearTimeout(timer)
    }

    if (preferences.currentChapter === chapterSlug && typeof preferences.scrollPosition === 'number') {
      const timer = setTimeout(() => {
        window.scrollTo(0, preferences.scrollPosition!)
        isRestoringRef.current = false
      }, 100)
      return () => clearTimeout(timer)
    }
    isRestoringRef.current = false
  }, [chapterSlug, preferences.currentChapter, preferences.scrollPosition])

  // Track scroll position changes
  useEffect(() => {
    if (isRestoringRef.current) return

    const handleScroll = () => {
      updateReadingPosition(chapterSlug, window.scrollY)
    }

    const throttledScroll = (() => {
      let lastCall = 0
      return () => {
        const now = Date.now()
        if (now - lastCall >= 500) {
          handleScroll()
          lastCall = now
        }
      }
    })()

    window.addEventListener('scroll', throttledScroll, { passive: true })
    return () => window.removeEventListener('scroll', throttledScroll)
  }, [chapterSlug, updateReadingPosition])

  return <div ref={containerRef} />
}
