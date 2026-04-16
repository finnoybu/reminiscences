'use client'

import { useEffect, useState } from 'react'
import { useReader } from '@/lib/reader-context'
import { createClient } from '@/lib/supabase/client'

interface AnnotationHighlightsProps {
  articleRef: React.RefObject<HTMLElement | null>
  chapterSlug: string
}

interface SavedBookmark {
  id: string
  scroll_position: number
}

/**
 * Find the paragraph closest to a document-relative Y position
 * and add a bookmark ribbon to its left margin.
 */
function addBookmarkRibbon(article: HTMLElement, scrollPos: number, id: string) {
  const paragraphs = article.querySelectorAll('p')
  let closest: Element | null = null
  let closestDist = Infinity

  for (const p of paragraphs) {
    const rect = p.getBoundingClientRect()
    const docTop = rect.top + window.scrollY
    const dist = Math.abs(docTop - scrollPos)
    if (dist < closestDist) {
      closestDist = dist
      closest = p
    }
  }

  if (closest && !closest.querySelector('.bookmark-ribbon')) {
    closest.classList.add('has-bookmark')
    const ribbon = document.createElement('span')
    ribbon.className = 'bookmark-ribbon'
    ribbon.dataset.bookmarkId = id
    ribbon.setAttribute('aria-label', 'Remove bookmark')
    ribbon.setAttribute('title', 'Remove bookmark')
    ribbon.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="var(--color-brass)" stroke="none"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>`
    ribbon.addEventListener('click', async () => {
      const supabase = createClient()
      await supabase.from('bookmarks').delete().eq('id', id)
      ribbon.remove()
      closest!.classList.remove('has-bookmark')
      window.dispatchEvent(new Event('bookmark-saved'))
    })
    closest.insertBefore(ribbon, closest.firstChild)
  }
}

interface SavedAnnotation {
  id: string
  selection_start: number
  selection_end: number
  text_selection: string
  note: string
}

/**
 * Walks text nodes in the article to find the DOM position for a character offset,
 * then wraps the annotated range with a <mark> element.
 */
function highlightRange(
  article: HTMLElement,
  start: number,
  end: number,
  id: string,
  hasNote: boolean
): void {
  const walker = document.createTreeWalker(article, NodeFilter.SHOW_TEXT)
  let charCount = 0
  let startNode: Text | null = null
  let startOffset = 0
  let endNode: Text | null = null
  let endOffset = 0
  let node: Node | null

  while ((node = walker.nextNode())) {
    const len = node.textContent?.length ?? 0

    if (!startNode && charCount + len > start) {
      startNode = node as Text
      startOffset = start - charCount
    }

    if (charCount + len >= end) {
      endNode = node as Text
      endOffset = end - charCount
      break
    }

    charCount += len
  }

  if (!startNode || !endNode) return

  try {
    const range = document.createRange()
    range.setStart(startNode, startOffset)
    range.setEnd(endNode, endOffset)

    // Only wrap if the range is within a single text node or simple span
    // For complex multi-node selections, use a simpler approach
    const mark = document.createElement('mark')
    mark.className = `annotation-highlight${hasNote ? ' has-note' : ''}`
    mark.dataset.annotationId = id
    range.surroundContents(mark)
  } catch {
    // surroundContents fails if the range crosses element boundaries
    // Fall back to highlighting just the start node
    if (startNode.textContent) {
      const mark = document.createElement('mark')
      mark.className = `annotation-highlight${hasNote ? ' has-note' : ''}`
      mark.dataset.annotationId = id

      const beforeText = startNode.textContent.slice(0, startOffset)
      const highlightText = startNode.textContent.slice(startOffset)

      startNode.textContent = beforeText
      mark.textContent = highlightText
      startNode.parentNode?.insertBefore(mark, startNode.nextSibling)
    }
  }
}

export default function AnnotationHighlights({
  articleRef,
  chapterSlug,
}: AnnotationHighlightsProps) {
  const { user } = useReader()
  const [version, setVersion] = useState(0)

  // Listen for new annotations or bookmarks saved
  useEffect(() => {
    const handler = () => setVersion((v) => v + 1)
    window.addEventListener('annotation-saved', handler)
    window.addEventListener('bookmark-saved', handler)
    return () => {
      window.removeEventListener('annotation-saved', handler)
      window.removeEventListener('bookmark-saved', handler)
    }
  }, [])

  useEffect(() => {
    if (!user || !articleRef.current) return

    const article = articleRef.current

    // Remove existing highlights and ribbons before re-applying
    article.querySelectorAll('mark.annotation-highlight').forEach((mark) => {
      const parent = mark.parentNode
      if (parent) {
        parent.replaceChild(document.createTextNode(mark.textContent ?? ''), mark)
        parent.normalize()
      }
    })
    article.querySelectorAll('.bookmark-ribbon').forEach((r) => r.remove())
    article.querySelectorAll('.has-bookmark').forEach((p) => p.classList.remove('has-bookmark'))

    const supabase = createClient()

    // Fetch annotations and bookmarks in parallel
    Promise.all([
      supabase
        .from('annotations')
        .select('id, selection_start, selection_end, text_selection, note')
        .eq('user_id', user.id)
        .eq('chapter_slug', chapterSlug),
      supabase
        .from('bookmarks')
        .select('id, scroll_position')
        .eq('user_id', user.id)
        .eq('chapter_slug', chapterSlug),
    ]).then(([annResult, bmResult]) => {
      if (!articleRef.current) return

      // Apply annotation highlights
      const annotations = (annResult.data ?? [])
        .filter((a): a is SavedAnnotation => a.selection_start != null && a.selection_end != null)
        .sort((a, b) => b.selection_start - a.selection_start)

      for (const ann of annotations) {
        highlightRange(
          articleRef.current,
          ann.selection_start,
          ann.selection_end,
          ann.id,
          !!ann.note
        )
      }

      // Apply bookmark ribbons
      for (const bm of bmResult.data ?? []) {
        addBookmarkRibbon(articleRef.current, bm.scroll_position, bm.id)
      }
    })
  }, [user, articleRef, chapterSlug, version])

  return null
}
