'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

interface SearchResult {
  id: number
  title: string
  slug: string
  excerpt: string
  chapterIndex: number
}

export default function SearchBar() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!query.trim()) {
        setResults([])
        return
      }

      setIsLoading(true)
      fetch(`/api/search?q=${encodeURIComponent(query)}`)
        .then((res) => res.json())
        .then((data) => {
          setResults(data)
          setIsLoading(false)
        })
        .catch(() => setIsLoading(false))
    }, 250)

    return () => clearTimeout(timer)
  }, [query])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={containerRef} className="relative">
      <div className="flex items-center gap-3 h-12 px-4 bg-bg-elev border border-rule-soft rounded-md focus-within:border-accent transition-colors">
        <svg
          aria-hidden
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-ink-faint flex-shrink-0"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <input
          type="text"
          placeholder="Search the voyage…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          className="flex-1 bg-transparent outline-none font-serif text-base text-ink placeholder:text-ink-faint"
        />
        {isLoading && (
          <span className="font-sans text-xs uppercase tracking-widest text-ink-faint">
            searching
          </span>
        )}
      </div>

      {isOpen && (query.trim() || results.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-bg-elev border border-rule-soft rounded-md shadow-lift z-50 max-h-96 overflow-y-auto">
          {results.length > 0 ? (
            <div className="divide-y divide-rule-soft">
              {results.map((result) => (
                <Link
                  key={result.slug}
                  href={`/chapters/${result.slug}`}
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-3 hover:bg-bg-sunk transition-colors"
                >
                  <div className="font-display text-base text-ink" style={{ fontFeatureSettings: "'ss01'" }}>
                    {result.title}
                  </div>
                  <div className="mt-1 font-serif text-sm text-ink-muted line-clamp-2">
                    {result.excerpt}
                  </div>
                  <div className="mt-2 font-sans text-[10px] uppercase tracking-widest text-brass">
                    Chapter {result.chapterIndex + 1}
                  </div>
                </Link>
              ))}
            </div>
          ) : query.trim() ? (
            <div className="px-4 py-8 text-center font-serif text-sm text-ink-muted">
              No chapters found matching &ldquo;{query}&rdquo;
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}
