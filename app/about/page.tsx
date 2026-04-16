import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About',
  description: 'About this digital edition of A Sailor\'s Reminiscences from the Days of the Sailships.',
}

export default function AboutPage() {
  return (
    <div className="max-w-shell mx-auto px-6 py-16 md:py-24">
      <div className="max-w-prose mx-auto">
        <p className="eyebrow mb-4">About this edition</p>
        <h1
          className="font-display text-4xl md:text-5xl leading-tight text-ink mb-10"
          style={{ fontFeatureSettings: "'ss01'" }}
        >
          A Sailor&rsquo;s Reminiscences
        </h1>

        <div className="prose-memoir">
          <p>
            This digital edition presents the memoirs of Olavus Vullum Bj&oslash;rnson
            Vestb&oslash;, a Norwegian sailor who recounted his youth aboard the proud
            sailships of a vanished age. His voyages took him across the Atlantic in
            hurricanes, into the harbours of Jamaica, Boston, Copenhagen, and Rangoon,
            and aboard ships crewed by men of every nation and disposition.
          </p>

          <p>
            The original manuscript was translated from Norwegian by B.C. Berge, Olavus&rsquo;s
            nephew. This digital edition was transcribed and edited by Ken Tannenbaum,
            Olavus&rsquo;s great-great-grandson, as a tribute to a life lived at sea.
          </p>

          <p>
            The illustrations accompanying each chapter were gathered to evoke the world
            Olavus inhabited &mdash; the ships, the ports, the storms, and the quiet
            moments between.
          </p>
        </div>
      </div>
    </div>
  )
}
