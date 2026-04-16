'use client'

import { useRef } from 'react'
import WikiHoverCards from './WikiHoverCards'

export default function ChapterArticle({ html }: { html: string }) {
  const ref = useRef<HTMLDivElement>(null)

  return (
    <article className="prose-memoir mx-auto" ref={ref}>
      <div dangerouslySetInnerHTML={{ __html: html }} />
      <WikiHoverCards containerRef={ref} />
    </article>
  )
}
