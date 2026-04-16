import type { Metadata } from 'next'
import Image from 'next/image'
import Arrowhead from '@/components/Arrowhead'

export const metadata: Metadata = {
  title: 'About',
  description: 'About Olavus Vullum Bjørnson Vestbø and this digital edition of A Sailor\'s Reminiscences.',
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

        <div className="my-16 flex justify-center"><Arrowhead /></div>

        <div className="flex flex-col items-center mb-10">
          <div className="relative w-64 h-80 rounded-lg overflow-hidden shadow-lift">
            <Image
              src="/images/olavus-portrait.PNG"
              alt="Olaus Wullum Bjornsen Westbo holding a model ship"
              fill
              sizes="256px"
              className="object-cover grayscale sepia-[.15]"
            />
          </div>
          <p className="mt-4 font-sans text-xs uppercase tracking-widest text-ink-faint">
            Olaus Wullum Bjornsen Westbo, 1859&ndash;1940
          </p>
        </div>

        <div className="prose-memoir">
          <h2>The Author</h2>

          <p>
            Olaus Wullum Bjornsen Westbo (1859&ndash;1940) was a Norwegian-born pioneer
            and family patriarch who helped shape the Scandinavian-American community
            in the Pacific Northwest. Born in Norway as one of twelve children to
            Bj&oslash;rn Nilson Vestb&oslash; and Gunhild Olsdatter Berge, Olaus
            carried his family&rsquo;s heritage across the Atlantic, eventually settling
            in Tacoma, Washington.
          </p>

          <p>
            A central figure in the Westbo lineage, Olaus established a lasting legacy
            alongside his wife, Bertha Olava, raising a family that bridged Old World
            traditions with New World opportunities. His life story is one of migration,
            resilience, and the quiet strength of the immigrant experience. He is
            remembered today by his descendants for his role in anchoring the Westbo
            name in American soil. He rests at the Old Tacoma Cemetery, leaving behind
            a sprawling family tree that continues to honor his journey.
          </p>
        </div>

        <div className="my-16 flex justify-center"><Arrowhead /></div>

        <div className="prose-memoir">
          <h2>About the Contributors</h2>

          <p>
            <strong>Bernhard O. &ldquo;B. O.&rdquo; Berge</strong> was a prominent figure in
            the Norwegian-American community of Illinois, known for his leadership in legal
            and fraternal organizations. He was the son of Ole B. Berge and Gunhild Bjornson,
            making him a direct grandson of Olaus Wullum Bjornsen Westbo&rsquo;s parents (and
            thus Olaus&rsquo;s nephew, though often linked as a &ldquo;grandson&rdquo; in broader
            family contexts due to the close multi-generational ties of the Berge and Westbo
            families).
          </p>

          <p>
            <strong>Kenneth Tannenbaum</strong> is a fifth-generation Norwegian-American and a
            great-great-grandson of the pioneer Olaus Wullum Bjornsen Westbo. Carrying forward
            a family legacy of exploration and structural building that began on the Vestb&oslash;
            farm in Norway and moved to the shores of the Pacific Northwest, Kenneth now
            navigates the digital frontiers of Silicon Valley.
          </p>
        </div>
      </div>
    </div>
  )
}
