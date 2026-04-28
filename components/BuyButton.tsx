'use client'

import { useEffect, useState } from 'react'
import { useReader } from '@/lib/reader-context'
import { createClient } from '@/lib/supabase/client'
import { getBookId } from '@/lib/book'
import AuthModal from './AuthModal'

export default function BuyButton() {
  const { user } = useReader()
  const [purchased, setPurchased] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(false)
  const [showAuth, setShowAuth] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (!user) { setPurchased(false); return }
    let cancelled = false
    ;(async () => {
      const bookId = await getBookId(supabase)
      const { data } = await supabase
        .from('purchases')
        .select('id')
        .eq('user_id', user.id)
        .eq('book_id', bookId)
        .eq('product_id', 'pdf-epub')
        .limit(1)
      if (!cancelled) setPurchased(!!(data && data.length > 0))
    })()
    return () => { cancelled = true }
  }, [user, supabase])

  if (purchased) {
    return (
      <div className="flex gap-3">
        <a
          href="/api/download?format=pdf"
          className="flex-1 text-center h-12 leading-[3rem] rounded-full border border-rule-soft font-sans text-sm tracking-wider uppercase text-ink-muted hover:text-accent hover:border-rule transition-colors"
        >
          Get PDF
        </a>
        <a
          href="/api/download?format=epub"
          className="flex-1 text-center h-12 leading-[3rem] rounded-full border border-rule-soft font-sans text-sm tracking-wider uppercase text-ink-muted hover:text-accent hover:border-rule transition-colors"
        >
          Get ePub
        </a>
      </div>
    )
  }

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
