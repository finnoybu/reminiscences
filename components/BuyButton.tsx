'use client'

import { useState } from 'react'
import { useReader } from '@/lib/reader-context'
import AuthModal from './AuthModal'

export default function BuyButton() {
  const { user } = useReader()
  const [loading, setLoading] = useState(false)
  const [showAuth, setShowAuth] = useState(false)

  const handleBuy = async () => {
    if (!user) {
      setShowAuth(true)
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: 'pdf-epub' }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      }
    } catch {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleBuy}
        disabled={loading}
        className="block w-full text-center h-12 leading-[3rem] rounded-full bg-accent text-bg font-sans text-sm tracking-wider uppercase hover:bg-accent-hi transition-colors disabled:opacity-50"
      >
        {loading ? 'Redirecting...' : user ? 'Buy direct' : 'Sign in to purchase'}
      </button>
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  )
}
