export interface SelectionInfo {
  text: string
  selectionStart: number
  selectionEnd: number
  rect: DOMRect
  scrollPosition: number
}

/**
 * Extract selection data relative to an article element.
 * Returns null if selection is empty or outside the article.
 */
export function getSelectionInfo(
  articleEl: HTMLElement
): SelectionInfo | null {
  const sel = window.getSelection()
  if (!sel || sel.isCollapsed || sel.rangeCount === 0) return null

  const range = sel.getRangeAt(0)
  if (
    !articleEl.contains(range.startContainer) ||
    !articleEl.contains(range.endContainer)
  ) {
    return null
  }

  const text = sel.toString().trim()
  if (!text) return null

  const selectionStart = getTextOffset(articleEl, range.startContainer, range.startOffset)
  const selectionEnd = getTextOffset(articleEl, range.endContainer, range.endOffset)

  const rect = range.getBoundingClientRect()

  return {
    text,
    selectionStart,
    selectionEnd,
    rect,
    scrollPosition: window.scrollY + rect.top,
  }
}

/**
 * Walk text nodes in document order to compute a character offset
 * from the start of the element's textContent.
 */
function getTextOffset(
  root: HTMLElement,
  targetNode: Node,
  targetOffset: number
): number {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  let offset = 0
  let node: Node | null

  while ((node = walker.nextNode())) {
    if (node === targetNode) {
      return offset + targetOffset
    }
    offset += (node.textContent?.length ?? 0)
  }

  // Fallback: target is an element node — sum text up to the child index
  if (targetNode.nodeType === Node.ELEMENT_NODE) {
    const children = targetNode.childNodes
    const walker2 = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
    let off = 0
    let n: Node | null
    while ((n = walker2.nextNode())) {
      let found = false
      for (let i = 0; i < targetOffset; i++) {
        if (children[i] && children[i].contains(n)) {
          found = true
          break
        }
      }
      if (!found && targetNode.contains(n)) {
        return off
      }
      off += (n.textContent?.length ?? 0)
    }
    return off
  }

  return offset
}

/**
 * Find the <p> element containing a given character offset in the article.
 */
export function getParagraphAtOffset(
  articleEl: HTMLElement,
  offset: number
): HTMLParagraphElement | null {
  const walker = document.createTreeWalker(articleEl, NodeFilter.SHOW_TEXT)
  let charCount = 0
  let node: Node | null

  while ((node = walker.nextNode())) {
    const len = node.textContent?.length ?? 0
    if (charCount + len > offset) {
      const p = (node as Text).parentElement?.closest('p')
      return (p as HTMLParagraphElement) ?? null
    }
    charCount += len
  }
  return null
}

const POPOVER_GAP = 8

/**
 * Compute fixed-position coordinates for a popover near a selection rect.
 * Returns x (center-aligned), y, and whether the popover is above the selection.
 */
export function computePopoverPosition(
  selectionRect: DOMRect,
  popoverWidth: number = 200,
  popoverHeight: number = 48
): { x: number; y: number; above: boolean } {
  const spaceBelow = window.innerHeight - selectionRect.bottom
  const above = spaceBelow < popoverHeight + POPOVER_GAP * 2

  const y = above
    ? selectionRect.top - popoverHeight - POPOVER_GAP
    : selectionRect.bottom + POPOVER_GAP

  const xCenter = selectionRect.left + selectionRect.width / 2 - popoverWidth / 2
  const x = Math.max(8, Math.min(xCenter, window.innerWidth - popoverWidth - 8))

  return { x, y, above }
}
