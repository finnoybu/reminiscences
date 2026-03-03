'use client'

import { useReader, Theme, FontSize } from '@/lib/reader-context'

const themes: { name: string; value: Theme }[] = [
  { name: '☀️ Light', value: 'light' },
  { name: '🌙 Dark', value: 'dark' },
  { name: '♿ High Contrast', value: 'high-contrast' },
]

const fontSizes: { label: string; value: FontSize }[] = [
  { label: 'Small', value: 'sm' },
  { label: 'Medium', value: 'base' },
  { label: 'Large', value: 'lg' },
  { label: 'Extra Large', value: 'xl' },
]

export default function ReaderSettings() {
  const { preferences, setTheme, setFontSize } = useReader()

  return (
    <div className="fixed bottom-8 right-8 p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg max-w-sm z-50">
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-semibold mb-3 text-slate-900 dark:text-white">Theme</h3>
          <div className="space-y-2">
            {themes.map((t) => (
              <label key={t.value} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="theme"
                  value={t.value}
                  checked={preferences.theme === t.value}
                  onChange={(e) => setTheme(e.target.value as Theme)}
                  className="w-4 h-4"
                />
                <span className="text-sm text-slate-700 dark:text-slate-300">{t.name}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold mb-3 text-slate-900 dark:text-white">Font Size</h3>
          <div className="space-y-2">
            {fontSizes.map((fs) => (
              <label key={fs.value} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="fontSize"
                  value={fs.value}
                  checked={preferences.fontSize === fs.value}
                  onChange={(e) => setFontSize(e.target.value as FontSize)}
                  className="w-4 h-4"
                />
                <span className={`text-${fs.value} text-slate-700 dark:text-slate-300`}>
                  {fs.label}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
