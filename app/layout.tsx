import './globals.css'
import type { Metadata } from 'next'
import { Fraunces, EB_Garamond, Inter, Caveat } from 'next/font/google'
import { ReaderProvider } from '@/lib/reader-context'
import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'
import { Analytics } from '@vercel/analytics/react'

const fraunces = Fraunces({
  subsets: ['latin'],
  display: 'swap',
  axes: ['SOFT', 'opsz'],
  variable: '--font-display',
})

const garamond = EB_Garamond({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-serif',
})

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
})

const caveat = Caveat({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-hand',
})

export const metadata: Metadata = {
  title: {
    default: "A Sailor's Reminiscences from the Days of the Sailships",
    template: "%s · A Sailor's Reminiscences",
  },
  description:
    "A Sailor's Reminiscences from the Days of the Sailships — a Norwegian sailor recounting his youth aboard the proud sailships of a vanished age.",
}

const themeScript = `
  try {
    var stored = JSON.parse(localStorage.getItem('sea-reader-preferences') || '{}');
    var theme = stored.theme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.classList.add(theme);
  } catch (e) {}
`.trim()

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${fraunces.variable} ${garamond.variable} ${inter.variable} ${caveat.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen bg-bg text-ink">
        <ReaderProvider>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-accent focus:text-bg focus:rounded"
          >
            Skip to content
          </a>
          <SiteHeader />
          <main id="main">{children}</main>
          <SiteFooter />
          <Analytics />
        </ReaderProvider>
      </body>
    </html>
  )
}
