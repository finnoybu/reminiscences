'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

interface ToastProps {
  message: string
  visible: boolean
}

export default function Toast({ message, visible }: ToastProps) {
  const [mounted, setMounted] = useState(false)
  const [exiting, setExiting] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!visible && mounted) {
      setExiting(true)
      const t = setTimeout(() => setExiting(false), 200)
      return () => clearTimeout(t)
    }
  }, [visible, mounted])

  if (!mounted) return null
  if (!visible && !exiting) return null

  return createPortal(
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-3 rounded-lg border font-sans text-sm
        bg-bg-elev border-rule-soft text-ink shadow-lg
        ${visible ? 'toast-enter' : 'toast-exit'}`}
      role="status"
      aria-live="polite"
    >
      {message}
    </div>,
    document.body
  )
}
