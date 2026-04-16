import type { Metadata } from 'next'
import Link from 'next/link'
import Arrowhead from '@/components/Arrowhead'

export const metadata: Metadata = {
  title: 'Purchase complete',
}

export default function SuccessPage() {
  return (
    <div className="max-w-shell mx-auto px-6 py-16 md:py-24">
      <div className="max-w-prose mx-auto text-center">
        <div className="rule-ornament font-display text-3xl mb-8" style={{ fontFeatureSettings: "'ss01'" }}>
          <Arrowhead />
        </div>
        <h1
          className="font-display text-4xl md:text-5xl leading-tight text-ink mb-6"
          style={{ fontFeatureSettings: "'ss01'" }}
        >
          Thank you!
        </h1>
        <p className="font-serif text-lg text-ink-muted leading-relaxed mb-8">
          Your purchase is complete. You can now download your PDF and ePub
          from the shop page at any time.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 h-12 px-6 rounded-full bg-accent text-bg font-sans text-sm tracking-wider uppercase hover:bg-accent-hi transition-colors"
          >
            Download your files
          </Link>
          <Link
            href="/chapters/introduction"
            className="inline-flex items-center gap-2 h-12 px-6 rounded-full border border-rule text-ink font-sans text-sm tracking-wider uppercase hover:border-accent hover:text-accent transition-colors"
          >
            Continue reading
          </Link>
        </div>
      </div>
    </div>
  )
}
