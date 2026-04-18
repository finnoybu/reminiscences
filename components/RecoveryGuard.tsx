'use client'

import { useReader } from '@/lib/reader-context'

/**
 * Blocks page content rendering during recovery sessions.
 * Even if the PasswordRecoveryModal is removed from the DOM via browser
 * DevTools, this component prevents the underlying page from showing
 * any content. The recovery state comes from the JWT's amr claim,
 * not from the DOM — it cannot be bypassed client-side.
 */
export default function RecoveryGuard({ children }: { children: React.ReactNode }) {
  const { isRecoverySession } = useReader()

  if (isRecoverySession) {
    return null
  }

  return <>{children}</>
}
