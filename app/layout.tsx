import './globals.css'
import { ReaderProvider } from '@/lib/reader-context'

export const metadata = {
  title: 'Sea Reader',
  description: 'A governed reader platform'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50 transition-colors">
        <ReaderProvider>
          {children}
        </ReaderProvider>
      </body>
    </html>
  )
}

