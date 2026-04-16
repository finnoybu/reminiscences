'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function DownloadButtons() {
  const [purchased, setPurchased] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function check() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('purchases')
        .select('id')
        .eq('user_id', user.id)
        .eq('product_id', 'pdf-epub')
        .limit(1)

      if (data && data.length > 0) setPurchased(true)
    }
    check()
  }, [supabase])

  if (!purchased) return null

  return (
    <div className="mt-4 flex gap-3">
      <a
        href="/api/download?format=pdf"
        className="flex-1 text-center h-10 leading-[2.5rem] rounded-md border border-rule-soft font-sans text-xs uppercase tracking-widest text-ink-muted hover:text-accent hover:border-rule transition-colors"
      >
        Download PDF
      </a>
      <a
        href="/api/download?format=epub"
        className="flex-1 text-center h-10 leading-[2.5rem] rounded-md border border-rule-soft font-sans text-xs uppercase tracking-widest text-ink-muted hover:text-accent hover:border-rule transition-colors"
      >
        Download ePub
      </a>
    </div>
  )
}
