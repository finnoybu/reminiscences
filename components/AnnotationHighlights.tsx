'use client'

import { useEffect, useState } from 'react'
import { useReader } from '@/lib/reader-context'
import { createClient } from '@/lib/supabase/client'
import { getParagraphAtOffset } from '@/lib/selection-utils'

interface AnnotationHighlightsProps {
  articleRef: React.RefObject<HTMLElement | null>
  chapterSlug: string
}

interface SavedBookmark {
  id: string
  scroll_position: number
  selection_start: number | null
}

/**
 * Find the paragraph containing the bookmark and add a ribbon to its left margin.
 * Uses character offset (selection_start) when available for precision;
 * falls back to scroll-position proximity for legacy bookmarks.
 */
function addBookmarkRibbon(
  article: HTMLElement,
  scrollPos: number,
  selectionStart: number | null,
  id: string
) {
  let closest: Element | null = null

  if (selectionStart != null) {
    // Precise: walk text nodes to find the paragraph containing this offset
    closest = getParagraphAtOffset(article, selectionStart)
  }

  if (!closest) {
    // Legacy fallback: find paragraph closest to the Y coordinate
    const paragraphs = article.querySelectorAll('p')
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
function attachNoteHover(mark: HTMLElement, noteText: string) {
  let card: HTMLElement | null = null

  mark.addEventListener('mouseenter', () => {
    card = document.createElement('div')
    card.className = 'annotation-hover-card'
    card.textContent = noteText

    const rect = mark.getBoundingClientRect()
    card.style.left = `${rect.left + rect.width / 2}px`
    card.style.top = `${rect.top - 8}px`
    document.body.appendChild(card)

    // Nudge if it overflows the viewport
    const cardRect = card.getBoundingClientRect()
    if (cardRect.left < 8) card.style.left = '8px'
    if (cardRect.right > window.innerWidth - 8) {
      card.style.left = `${window.innerWidth - cardRect.width - 8}px`
    }
  })

  mark.addEventListener('mouseleave', () => {
    card?.remove()
    card = null
  })
}

function highlightRange(
  article: HTMLElement,
  start: number,
  end: number,
  id: string,
  hasNote: boolean,
  noteText?: string
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
    if (noteText) attachNoteHover(mark, noteText)
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
      if (noteText) attachNoteHover(mark, noteText)
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

    // Remove existing highlights, ribbons, and orphaned hover cards before re-applying
    document.querySelectorAll('.annotation-hover-card').forEach((c) => c.remove())
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
        .select('id, scroll_position, selection_start')
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
          !!ann.note,
          ann.note || undefined
        )
      }

      // Apply bookmark ribbons
      for (const bm of bmResult.data ?? []) {
        addBookmarkRibbon(articleRef.current, bm.scroll_position, bm.selection_start, bm.id)
      }
    })
  }, [user, articleRef, chapterSlug, version])

  return null
}
