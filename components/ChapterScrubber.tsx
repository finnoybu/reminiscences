'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

export default function ChapterScrubber() {
  const [progress, setProgress] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [visible, setVisible] = useState(false)
  const railRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number | null>(null)

  // Track scroll → progress
  useEffect(() => {
    const onScroll = () => {
      if (rafRef.current !== null) return
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null
        const doc = document.documentElement
        const max = doc.scrollHeight - doc.clientHeight
        setProgress(max <= 0 ? 0 : Math.min(1, Math.max(0, window.scrollY / max)))
        setVisible(window.scrollY > 120)
      })
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  // Drag → scroll
  const scrubTo = useCallback((clientY: number) => {
    const rail = railRef.current
    if (!rail) return
    const rect = rail.getBoundingClientRect()
    const ratio = Math.min(1, Math.max(0, (clientY - rect.top) / rect.height))
    const doc = document.documentElement
    const max = doc.scrollHeight - doc.clientHeight
    window.scrollTo({ top: ratio * max, behavior: 'auto' })
  }, [])

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault()
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    setDragging(true)
    scrubTo(e.clientY)
  }
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return
    scrubTo(e.clientY)
  }
  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return
    ;(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
    setDragging(false)
  }

  const pct = Math.round(progress * 100)
  const expanded = hovered || dragging

  return (
    <div
      aria-hidden
      className={`hidden lg:flex fixed right-6 top-1/2 -translate-y-1/2 z-30 items-center gap-3 select-none transition-opacity duration-500 ${
        visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      {/* Percentage label — floats beside thumb */}
      <div
        className="font-sans text-[10px] uppercase tracking-widest text-ink-faint tabular-nums transition-all duration-300"
        style={{
          transform: `translateY(${progress * 320 - 160}px)`,
          opacity: expanded ? 1 : 0.55,
          color: expanded ? 'var(--color-brass)' : undefined,
        }}
      >
        {pct}%
      </div>

      {/* The rail — interaction surface */}
      <div
        ref={railRef}
        role="slider"
        aria-label="Chapter progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        tabIndex={0}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onKeyDown={(e) => {
          const doc = document.documentElement
          const max = doc.scrollHeight - doc.clientHeight
          const step = doc.clientHeight * 0.1
          if (e.key === 'ArrowDown' || e.key === 'PageDown') {
            window.scrollTo({ top: Math.min(max, window.scrollY + step) })
          } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
            window.scrollTo({ top: Math.max(0, window.scrollY - step) })
          } else if (e.key === 'Home') {
            window.scrollTo({ top: 0 })
          } else if (e.key === 'End') {
            window.scrollTo({ top: max })
          }
        }}
        className="relative h-80 cursor-grab active:cursor-grabbing touch-none focus-visible:outline-none group"
        style={{ width: expanded ? '14px' : '10px', transition: 'width 200ms cubic-bezier(0.22, 0.61, 0.36, 1)' }}
      >
        {/* Track */}
        <div
          className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 bg-rule-soft transition-all duration-200"
          style={{ width: expanded ? '2px' : '1px' }}
        />
        {/* Filled portion */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 bg-brass transition-all duration-200"
          style={{
            height: `${progress * 100}%`,
            width: expanded ? '2px' : '1px',
            opacity: expanded ? 1 : 0.7,
          }}
        />
        {/* Start/end tick marks */}
        <span className="absolute left-1/2 -translate-x-1/2 top-0 w-2 h-px bg-ink-faint" />
        <span className="absolute left-1/2 -translate-x-1/2 bottom-0 w-2 h-px bg-ink-faint" />
        {/* Thumb */}
        <div
          className="absolute left-1/2 -translate-x-1/2 bg-brass rounded-full transition-all duration-200"
          style={{
            top: `${progress * 100}%`,
            transform: `translate(-50%, -50%)`,
            width: expanded ? '14px' : '10px',
            height: expanded ? '14px' : '10px',
            boxShadow: expanded ? '0 0 0 4px rgb(168 118 62 / 0.18)' : '0 0 0 0 transparent',
          }}
        />
      </div>
    </div>
  )
}
