'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useReader } from '@/lib/reader-context'
import { createClient } from '@/lib/supabase/client'
import {
  getSelectionInfo,
  computePopoverPosition,
  getParagraphAtOffset,
  type SelectionInfo,
} from '@/lib/selection-utils'
import AuthModal from './AuthModal'
import Toast from './Toast'

interface SelectionToolbarProps {
  articleRef: React.RefObject<HTMLElement | null>
  chapterSlug: string
}

export default function SelectionToolbar({
  articleRef,
  chapterSlug,
}: SelectionToolbarProps) {
  const { user } = useReader()
  const supabase = createClient()

  const [info, setInfo] = useState<SelectionInfo | null>(null)
  const [mode, setMode] = useState<'toolbar' | 'note-form' | 'errata-form' | null>(null)
  const [note, setNote] = useState('')
  const [errataDesc, setErrataDesc] = useState('')
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ message: string; key: number } | null>(
    null
  )
  const [showAuth, setShowAuth] = useState(false)

  const toolbarRef = useRef<HTMLDivElement>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Show toast and auto-dismiss ──────────────────────────
  const flash = useCallback((message: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToast({ message, key: Date.now() })
    toastTimer.current = setTimeout(() => setToast(null), 2000)
  }, [])

  // ── Dismiss helper ───────────────────────────────────────
  const dismiss = useCallback(() => {
    setMode(null)
    setInfo(null)
    setNote('')
    setErrataDesc('')
  }, [])

  // ── Listen for text selection ────────────────────────────
  useEffect(() => {
    const handler = (e: MouseEvent | TouchEvent) => {
      if (
        toolbarRef.current &&
        e.target instanceof Node &&
        toolbarRef.current.contains(e.target)
      ) {
        return
      }

      setTimeout(() => {
        if (!articleRef.current) return
        const sel = getSelectionInfo(articleRef.current)
        if (sel) {
          setInfo(sel)
          setMode('toolbar')
          setNote('')
          setErrataDesc('')
        } else {
          dismiss()
        }
      }, 10)
    }

    document.addEventListener('mouseup', handler)
    document.addEventListener('touchend', handler)
    return () => {
      document.removeEventListener('mouseup', handler)
      document.removeEventListener('touchend', handler)
    }
  }, [articleRef, dismiss])

  // ── Escape to dismiss ────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dismiss()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [dismiss])

  // ── Check if paragraph already has a bookmark ────────────
  const getBookmarkParagraph = () => {
    if (!info || !articleRef.current) return null
    return getParagraphAtOffset(articleRef.current, info.selectionStart)
  }

  const paragraphHasBookmark = () => {
    const p = getBookmarkParagraph()
    return p?.classList.contains('has-bookmark') ?? false
  }

  // ── Check if selection overlaps an existing annotation ───
  const getOverlappingAnnotation = (): { id: string; element: Element } | null => {
    if (!info || !articleRef.current) return null
    const marks = articleRef.current.querySelectorAll('mark.annotation-highlight')
    for (const mark of marks) {
      const id = mark.getAttribute('data-annotation-id')
      if (!id) continue
      if (mark.textContent && info.text && mark.textContent.includes(info.text.slice(0, 20))) {
        return { id, element: mark }
      }
    }
    const sel = window.getSelection()
    if (sel && sel.rangeCount > 0) {
      let node: Node | null = sel.getRangeAt(0).startContainer
      while (node && node !== articleRef.current) {
        if (node instanceof HTMLElement && node.classList.contains('annotation-highlight')) {
          const id = node.getAttribute('data-annotation-id')
          if (id) return { id, element: node }
        }
        node = node.parentNode
      }
    }
    return null
  }

  const hasExistingNote = () => getOverlappingAnnotation() !== null

  // ── Toggle bookmark ──────────────────────────────────────
  const toggleBookmark = async () => {
    if (!user || !info || !articleRef.current) return
    setSaving(true)

    const paragraph = getBookmarkParagraph()

    if (paragraph?.classList.contains('has-bookmark')) {
      const ribbon = paragraph.querySelector('.bookmark-ribbon')
      const bookmarkId = ribbon?.getAttribute('data-bookmark-id')
      if (bookmarkId) {
        await supabase.from('bookmarks').delete().eq('id', bookmarkId)
      }
      setSaving(false)
      window.getSelection()?.removeAllRanges()
      dismiss()
      window.dispatchEvent(new Event('bookmark-saved'))
      flash('Bookmark removed')
    } else {
      let label = info.text.slice(0, 80)
      if (paragraph?.textContent) {
        const words = paragraph.textContent.trim().split(/\s+/)
        label = words.slice(0, 8).join(' ')
      }

      await supabase.from('bookmarks').insert({
        user_id: user.id,
        chapter_slug: chapterSlug,
        scroll_position: info.scrollPosition,
        selection_start: info.selectionStart,
        label,
      })
      setSaving(false)
      window.getSelection()?.removeAllRanges()
      dismiss()
      window.dispatchEvent(new Event('bookmark-saved'))
      flash('Bookmark saved')
    }
  }

  // ── Toggle annotation ─────────────────────────────────────
  const toggleAnnotation = async () => {
    if (!user || !info) return

    const existing = getOverlappingAnnotation()
    if (existing) {
      setSaving(true)
      await supabase.from('annotations').delete().eq('id', existing.id)
      setSaving(false)
      window.getSelection()?.removeAllRanges()
      dismiss()
      window.dispatchEvent(new Event('annotation-saved'))
      flash('Note removed')
      return
    }

    setMode('note-form')
  }

  const saveAnnotation = async () => {
    if (!user || !info) return
    setSaving(true)
    await supabase.from('annotations').insert({
      user_id: user.id,
      chapter_slug: chapterSlug,
      text_selection: info.text,
      note,
      selection_start: info.selectionStart,
      selection_end: info.selectionEnd,
    })
    setSaving(false)
    window.getSelection()?.removeAllRanges()
    dismiss()
    window.dispatchEvent(new Event('annotation-saved'))
    flash('Note saved')
  }

  // ── Report errata ─────────────────────────────────────────
  const submitErrata = async () => {
    if (!user || !info) return
    setSaving(true)
    await supabase.from('errata_reports').insert({
      user_id: user.id,
      chapter_slug: chapterSlug,
      text_selection: info.text,
      description: errataDesc,
    })
    setSaving(false)
    window.getSelection()?.removeAllRanges()
    dismiss()
    flash('Errata reported — thank you')
  }

  // ── Render ───────────────────────────────────────────────
  if (!mode || !info) {
    return (
      <>
        {toast && <Toast message={toast.message} visible={!!toast} />}
        {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      </>
    )
  }

  const isForm = mode === 'note-form' || mode === 'errata-form'
  const popoverWidth = isForm ? 320 : 200
  const popoverHeight = isForm ? 220 : 126
  const pos = computePopoverPosition(info.rect, popoverWidth, popoverHeight)

  const menuItemClass =
    'w-full flex items-center gap-2.5 h-10 px-4 font-sans text-xs uppercase tracking-widest whitespace-nowrap text-ink-muted hover:text-accent hover:bg-bg-sunk transition-colors disabled:opacity-50 text-left'

  return (
    <>
      {createPortal(
        <div
          ref={toolbarRef}
          className="fixed z-50 animate-in"
          style={{
            left: pos.x,
            top: pos.y,
            width: popoverWidth,
          }}
        >
          <div className="bg-bg-elev border border-rule-soft rounded-lg shadow-lg overflow-hidden">
            {mode === 'toolbar' && (
              <div className="flex flex-col py-1">
                {user ? (
                  <>
                    <button
                      onClick={toggleBookmark}
                      disabled={saving}
                      className={menuItemClass}
                    >
                      <BookmarkIcon filled={paragraphHasBookmark()} />
                      {paragraphHasBookmark() ? 'Remove' : 'Bookmark'}
                    </button>
                    <button
                      onClick={toggleAnnotation}
                      disabled={saving}
                      className={menuItemClass}
                    >
                      <NoteIcon />
                      {hasExistingNote() ? 'Remove note' : 'Add note'}
                    </button>
                    <div className="mx-3 h-px bg-rule-soft" />
                    <button
                      onClick={() => setMode('errata-form')}
                      disabled={saving}
                      className={menuItemClass}
                    >
                      <ErrataIcon />
                      Report errata
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      dismiss()
                      setShowAuth(true)
                    }}
                    className={menuItemClass}
                  >
                    Sign in to save
                  </button>
                )}
              </div>
            )}

            {mode === 'note-form' && (
              <div className="p-4 space-y-3">
                <blockquote className="font-serif text-sm italic text-ink-muted border-l-2 border-brass pl-3 line-clamp-3">
                  &ldquo;{info.text}&rdquo;
                </blockquote>
                <textarea
                  id="annotation-note"
                  name="annotation-note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Add your note..."
                  rows={3}
                  className="w-full border border-rule-soft bg-bg rounded-md px-3 py-2 font-serif text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-accent resize-none"
                  autoFocus
                />
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => setMode('toolbar')}
                    className="h-9 px-3 font-sans text-xs uppercase tracking-widest text-ink-muted hover:text-ink transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveAnnotation}
                    disabled={saving}
                    className="h-9 px-4 bg-accent text-bg font-sans text-xs uppercase tracking-widest rounded-md hover:bg-accent-hi transition-colors disabled:opacity-50"
                  >
                    {saving ? 'Saving\u2026' : 'Save'}
                  </button>
                </div>
              </div>
            )}

            {mode === 'errata-form' && (
              <div className="p-4 space-y-3">
                <blockquote className="font-serif text-sm italic text-ink-muted border-l-2 border-brass pl-3 line-clamp-3">
                  &ldquo;{info.text}&rdquo;
                </blockquote>
                <textarea
                  id="errata-description"
                  name="errata-description"
                  value={errataDesc}
                  onChange={(e) => setErrataDesc(e.target.value)}
                  placeholder="What needs correcting?"
                  rows={3}
                  className="w-full border border-rule-soft bg-bg rounded-md px-3 py-2 font-serif text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-accent resize-none"
                  autoFocus
                />
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => setMode('toolbar')}
                    className="h-9 px-3 font-sans text-xs uppercase tracking-widest text-ink-muted hover:text-ink transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitErrata}
                    disabled={saving || !errataDesc.trim()}
                    className="h-9 px-4 bg-accent text-bg font-sans text-xs uppercase tracking-widest rounded-md hover:bg-accent-hi transition-colors disabled:opacity-50"
                  >
                    {saving ? 'Sending\u2026' : 'Report'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}

      {toast && <Toast message={toast.message} visible={!!toast} />}
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  )
}

function BookmarkIcon({ filled = false }: { filled?: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
    </svg>
  )
}

function NoteIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  )
}

function ErrataIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  )
}
