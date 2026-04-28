'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getBookId } from '@/lib/book'

export default function PurchasePrice({ price }: { price: string }) {
  const [purchased, setPurchased] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const bookId = await getBookId(supabase)
      const { data } = await supabase
        .from('purchases')
        .select('id')
        .eq('user_id', user.id)
        .eq('book_id', bookId)
        .eq('product_id', 'pdf-epub')
        .limit(1)
      if (!cancelled && data && data.length > 0) setPurchased(true)
    })()
    return () => { cancelled = true }
  }, [supabase])

  return (
    <p
      className="font-display text-3xl text-ink"
      style={{ fontFeatureSettings: "'ss01'" }}
    >
      {purchased ? 'Purchased' : price}
    </p>
  )
}
