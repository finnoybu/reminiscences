'use client'

import { useMemo } from 'react'
import zxcvbn from 'zxcvbn'

const LABELS = ['Very weak', 'Weak', 'Fair', 'Strong', 'Very strong'] as const
const COLORS = [
  'bg-red-500',
  'bg-orange-500',
  'bg-yellow-500',
  'bg-green-500',
  'bg-emerald-500',
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
      <p className={`font-sans text-xs ${score >= 3 ? 'text-green-600' : 'text-ink-faint'}`}>
        {LABELS[score]}
        {result.feedback.warning && (
          <span className="text-ink-faint"> — {result.feedback.warning}</span>
        )}
      </p>
    </div>
  )
}
