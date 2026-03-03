'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

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
}

const ReaderContext = createContext<ReaderContextType | undefined>(undefined)

const STORAGE_KEY = 'sea-reader-preferences'

const DEFAULT_PREFERENCES: ReaderPreferences = {
  theme: 'light',
  fontSize: 'base',
}

export function ReaderProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<ReaderPreferences>(DEFAULT_PREFERENCES)
  const [hydrated, setHydrated] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as ReaderPreferences
        setPreferences(parsed)
      }
    } catch (error) {
      console.error('Failed to load reader preferences:', error)
    }
    setHydrated(true)
  }, [])

  // Apply theme to DOM
  useEffect(() => {
    if (!hydrated) return

    const html = document.documentElement
    html.classList.remove('light', 'dark', 'high-contrast')
    html.classList.add(preferences.theme)

    // Apply font size class
    html.classList.remove('text-sm', 'text-base', 'text-lg', 'text-xl')
    html.classList.add(`text-${preferences.fontSize}`)
  }, [preferences.theme, preferences.fontSize, hydrated])

  const setTheme = (theme: Theme) => {
    const updated = { ...preferences, theme }
    setPreferences(updated)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  }

  const setFontSize = (fontSize: FontSize) => {
    const updated = { ...preferences, fontSize }
    setPreferences(updated)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  }

  const updateReadingPosition = (chapter: string, position: number) => {
    const updated = { ...preferences, currentChapter: chapter, scrollPosition: position }
    setPreferences(updated)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  }

  return (
    <ReaderContext.Provider value={{ preferences, setTheme, setFontSize, updateReadingPosition }}>
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
