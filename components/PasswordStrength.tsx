'use client'

import { useMemo } from 'react'
import zxcvbn from 'zxcvbn'

const LABELS = ['Very weak', 'Weak', 'Fair', 'Strong', 'Very strong'] as const
const COLORS = [
  'bg-[#8b4049]',  // muted burgundy
  'bg-[#9e6a3a]',  // warm amber
  'bg-[#8a7e3e]',  // dusty gold
  'bg-[#4a7a5c]',  // slate green
  'bg-[#2a6b5a]',  // deep teal
]

interface PasswordStrengthProps {
  password: string
}

export function usePasswordStrength(password: string) {
  return useMemo(() => {
    if (!password) return null
    return zxcvbn(password)
  }, [password])
}

export default function PasswordStrength({ password }: PasswordStrengthProps) {
  const result = usePasswordStrength(password)

  if (!result) return null

  const { score } = result

  return (
    <div className="space-y-1.5">
      <div className="flex gap-1">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i <= score ? COLORS[score] : 'bg-rule-soft'
            }`}
          />
        ))}
      </div>
      <p className={`font-sans text-xs ${score >= 3 ? 'text-[#4a7a5c]' : 'text-ink-faint'}`}>
        {LABELS[score]}
        {result.feedback.warning && (
          <span className="text-ink-faint"> — {result.feedback.warning}</span>
        )}
      </p>
    </div>
  )
}
