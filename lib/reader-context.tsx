'use client'

import { createContext, useContext, useCallback, useEffect, useState, useRef, ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

export type Theme = 'light' | 'dark' | 'high-contrast'
export type FontSize = 'sm' | 'base' | 'lg' | 'xl'

export interface ReaderPreferences {
  theme: Theme
  fontSize: FontSize
  currentChapter?: string
  scrollPosition?: number
}

interface ReaderContextType {
  preferences: ReaderPreferences
  setTheme: (theme: Theme) => void
  setFontSize: (size: FontSize) => void
  updateReadingPosition: (chapter: string, position: number) => void
  user: User | null
  isRecoverySession: boolean
}

const ReaderContext = createContext<ReaderContextType | undefined>(undefined)

const STORAGE_KEY = 'sea-reader-preferences'

const DEFAULT_PREFERENCES: ReaderPreferences = {
  theme: 'light',
  fontSize: 'base',
}

function saveLocal(prefs: ReaderPreferences) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs)) } catch {}
}

export function ReaderProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<ReaderPreferences>(DEFAULT_PREFERENCES)
  const [hydrated, setHydrated] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [isRecoverySession, setIsRecoverySession] = useState(false)
  const supabase = createClient()
  const syncTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setPreferences(JSON.parse(stored) as ReaderPreferences)
      }
    } catch {}
    setHydrated(true)
  }, [])

  useEffect(() => {
    function checkRecovery(user: User | null) {
      if (!user?.recovery_sent_at) { setIsRecoverySession(false); return }
      const elapsed = Date.now() - new Date(user.recovery_sent_at).getTime()
      setIsRecoverySession(elapsed < 60 * 60 * 1000)
    }

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      checkRecovery(data.user)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      checkRecovery(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [supabase.auth])

  // On sign-in: pull latest progress from Supabase, merge with local
  useEffect(() => {
    if (!user || !hydrated) return

    async function mergeFromCloud() {
      const { data } = await supabase
        .from('reading_progress')
        .select('chapter_slug, scroll_position, last_read_at')
        .order('last_read_at', { ascending: false })
        .limit(1)

      if (data && data.length > 0) {
        const cloud = data[0]
        setPreferences((prev) => {
          // Cloud wins if it's more recent (user read on another device)
          if (!prev.currentChapter || cloud.chapter_slug !== prev.currentChapter) {
            const updated = {
              ...prev,
              currentChapter: cloud.chapter_slug,
              scrollPosition: cloud.scroll_position,
            }
            saveLocal(updated)
            return updated
          }
          return prev
        })
      }
    }

    mergeFromCloud()
  }, [user, hydrated, supabase])

  // Debounced sync to Supabase
  const syncToCloud = useCallback(
    (chapter: string, position: number) => {
      if (!user) return
      if (syncTimer.current) clearTimeout(syncTimer.current)

      syncTimer.current = setTimeout(async () => {
        const doc = document.documentElement
        const max = doc.scrollHeight - doc.clientHeight
        const percent = max > 0 ? Math.min(1, position / max) : 0

        await supabase.from('reading_progress').upsert(
          {
            user_id: user.id,
            chapter_slug: chapter,
            scroll_position: position,
            percent,
            last_read_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,chapter_slug' }
        )
      }, 3000)
    },
    [user, supabase]
  )

  useEffect(() => {
    if (!hydrated) return
    const html = document.documentElement
    html.classList.remove('light', 'dark', 'high-contrast')
    html.classList.add(preferences.theme)
    html.classList.remove('text-sm', 'text-base', 'text-lg', 'text-xl')
    html.classList.add(`text-${preferences.fontSize}`)
  }, [preferences.theme, preferences.fontSize, hydrated])

  const setTheme = (theme: Theme) => {
    const updated = { ...preferences, theme }
    setPreferences(updated)
    saveLocal(updated)
  }

  const setFontSize = (fontSize: FontSize) => {
    const updated = { ...preferences, fontSize }
    setPreferences(updated)
    saveLocal(updated)
  }

  const updateReadingPosition = (chapter: string, position: number) => {
    const updated = { ...preferences, currentChapter: chapter, scrollPosition: position }
    setPreferences(updated)
    saveLocal(updated)
    syncToCloud(chapter, position)
  }

  return (
    <ReaderContext.Provider value={{ preferences, setTheme, setFontSize, updateReadingPosition, user, isRecoverySession }}>
      {children}
    </ReaderContext.Provider>
  )
}

export function useReader() {
  const context = useContext(ReaderContext)
  if (!context) {
    throw new Error('useReader must be used within ReaderProvider')
  }
  return context
}
