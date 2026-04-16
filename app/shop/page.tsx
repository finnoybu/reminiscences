import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import Arrowhead from '@/components/Arrowhead'
import BuyButton from '@/components/BuyButton'
import DownloadButtons from '@/components/DownloadButtons'

export const metadata: Metadata = {
  title: 'Shop',
  description: "Purchase A Sailor's Reminiscences from the Days of the Sailships — Kindle, paperback, hardcover, or direct download.",
}

const editions = [
  {
    format: 'Kindle',
    price: '$9.99',
    description: 'Read on any Kindle device or app.',
    href: 'https://www.amazon.com/Sailors-Reminiscences-Days-Sailships-ebook/dp/B0FLY96HSZ/ref=tmm_kin_swatch_0',
    badge: 'Digital',
    icon: '📱',
  },
  {
    format: 'Paperback',
    price: '$17.99',
    description: 'Soft cover, perfect for reading at sea.',
    href: 'https://www.amazon.com/Sailors-Reminiscences-Days-Sailships/dp/B0GW85ZGFN/ref=tmm_pap_swatch_0',
    badge: 'Print',
    icon: '📖',
  },
  {
    format: 'Hardcover',
    price: '$24.99',
    description: 'A lasting keepsake edition.',
    href: 'https://www.amazon.com/Sailors-Reminiscences-Days-Sailships/dp/B0GW88THSK/ref=tmm_hrd_swatch_0',
    badge: 'Print',
    icon: '📕',
  },
  {
    format: 'PDF / ePub',
    price: '$7.49',
    description: 'DRM-free download, read anywhere.',
    href: '#',
    badge: 'Direct',
    icon: '⬇',
    directPurchase: true,
  },
]

export default function ShopPage() {
  return (
    <div className="max-w-shell mx-auto px-6 py-16 md:py-24">
      <div className="max-w-measure mx-auto text-center mb-16">
        <p className="eyebrow mb-4">Own the complete memoir</p>
        <h1
          className="font-display text-4xl md:text-5xl leading-tight text-ink mb-6"
          style={{ fontFeatureSettings: "'ss01'" }}
        >
          Shop
        </h1>
        <p className="font-serif text-lg text-ink-muted leading-relaxed max-w-prose mx-auto">
          A Sailor&rsquo;s Reminiscences from the Days of the Sailships is available in
          multiple formats. Read the full memoir online for free, or take it with you.
        </p>
      </div>

      <div className="max-w-xs mx-auto mb-16">
        <div className="relative aspect-[2/3] rounded-lg overflow-hidden shadow-lift">
          <Image
            src="/images/amazon_kdp_hardcover.jpg"
            alt="A Sailor's Reminiscences from the Days of the Sailships — book cover"
            fill
            priority
            sizes="320px"
            className="object-cover"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-shell mx-auto">
        {editions.map((ed) => (
          <div
            key={ed.format}
            className="relative flex flex-col rounded-lg border border-rule-soft bg-bg-elev overflow-hidden"
          >
            <div className="flex items-center justify-between px-5 pt-5">
              <span className="font-sans text-[10px] uppercase tracking-widest text-brass">
                {ed.badge}
              </span>
              <span className="text-2xl" aria-hidden>{ed.icon}</span>
            </div>
            <div className="flex-1 px-5 pt-3 pb-5">
              <h2
                className="font-display text-2xl text-ink mb-1"
                style={{ fontFeatureSettings: "'ss01'" }}
              >
                {ed.format}
              </h2>
              <p className="font-serif text-sm text-ink-muted mb-4">{ed.description}</p>
              <p className="font-display text-3xl text-ink" style={{ fontFeatureSettings: "'ss01'" }}>
                {ed.price}
              </p>
            </div>
            <div className="px-5 pb-5">
              {ed.directPurchase ? (
                <>
                  <BuyButton />
                  <DownloadButtons />
                </>
              ) : (
                <a
                  href={ed.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center h-12 leading-[3rem] rounded-full bg-accent text-bg font-sans text-sm tracking-wider uppercase hover:bg-accent-hi transition-colors"
                >
                  Buy on Amazon
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="max-w-measure mx-auto text-center mt-16">
        <div className="rule-ornament font-display text-xl mb-6" style={{ fontFeatureSettings: "'ss01'" }}>
          <Arrowhead />
        </div>
        <p className="font-serif text-base text-ink-muted leading-relaxed">
          Prefer to read online? The complete memoir is{' '}
          <Link href="/chapters/introduction" className="text-accent hover:text-accent-hi transition-colors underline">
            free to read right here
          </Link>
          .
        </p>
      </div>
    </div>
  )
}
