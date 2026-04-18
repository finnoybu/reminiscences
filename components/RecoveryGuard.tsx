'use client'

import { useState, useEffect } from 'react'
import { useReader } from '@/lib/reader-context'

/**
 * Blocks page content rendering during recovery sessions.
 * Uses two signals:
 * 1. isRecoverySession from context (authoritative, async)
 * 2. ?recovery=true in the URL (fast-path, synchronous)
 *
 * The fast-path prevents content from flashing before getUser() resolves.
 * Even if the PasswordRecoveryModal is removed via DevTools, this
 * component prevents the page from rendering.
 */
export default function RecoveryGuard({ children }: { children: React.ReactNode }) {
  const { isRecoverySession } = useReader()
  const [urlRecovery, setUrlRecovery] = useState(false)

  useEffect(() => {
    if (window.location.search.includes('recovery=true')) {
      setUrlRecovery(true)
    }
  }, [])

  if (isRecoverySession || urlRecovery) {
    return null
  }

  return <>{children}</>
}
