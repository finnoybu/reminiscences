import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Legal',
  description: 'Legal information, terms, and policies for A Sailor\'s Reminiscences.',
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2>{title}</h2>
      {children}
    </section>
  )
}

export default function LegalPage() {
  return (
    <div className="max-w-shell mx-auto px-6 py-16 md:py-24">
      <div className="max-w-prose mx-auto">
        <p className="eyebrow mb-4">Legal</p>
        <h1
          className="font-display text-4xl md:text-5xl leading-tight text-ink mb-4"
          style={{ fontFeatureSettings: "'ss01'" }}
        >
          Terms &amp; Policies
        </h1>
        <p className="font-serif text-sm text-ink-muted mb-12">Last updated: April 2026</p>

        <nav className="mb-12 p-6 bg-bg-elev border border-rule-soft rounded-lg">
          <p className="eyebrow mb-3 text-[10px]">On this page</p>
          <ul className="space-y-1.5 font-sans text-sm">
            <li><a href="#copyright" className="text-accent hover:text-accent-hi transition-colors">Copyright</a></li>
            <li><a href="#terms-of-use" className="text-accent hover:text-accent-hi transition-colors">Terms of Use</a></li>
            <li><a href="#privacy-policy" className="text-accent hover:text-accent-hi transition-colors">Privacy Policy</a></li>
            <li><a href="#acceptable-use" className="text-accent hover:text-accent-hi transition-colors">Acceptable Use</a></li>
            <li><a href="#accessibility" className="text-accent hover:text-accent-hi transition-colors">Accessibility</a></li>
            <li><a href="#cookie-policy" className="text-accent hover:text-accent-hi transition-colors">Cookie Policy</a></li>
            <li><a href="#disclaimer" className="text-accent hover:text-accent-hi transition-colors">Disclaimer</a></li>
            <li><a href="#dmca" className="text-accent hover:text-accent-hi transition-colors">DMCA &amp; Takedown</a></li>
            <li><a href="#impressum" className="text-accent hover:text-accent-hi transition-colors">Impressum</a></li>
          </ul>
        </nav>

        <div className="prose-memoir">
          <Section id="copyright" title="Copyright">
            <p>
              &copy; 2026 Finnoybu Press. All rights reserved. The text of
              &ldquo;A Sailor&rsquo;s Reminiscences from the Days of the Sailships&rdquo;
              and all accompanying illustrations are the property of Finnoybu Press and
              may not be reproduced, distributed, or transmitted in any form without prior
              written permission.
            </p>
            <p>
              Original memoir by Olavus Vullum Bj&oslash;rnson Vestb&oslash;. Translated
              from Norwegian by B.C. Berge. Transcribed and edited by Ken Tannenbaum.
            </p>
          </Section>

          <Section id="terms-of-use" title="Terms of Use">
            <p>
              By accessing this site you agree to these terms. We reserve the right to
              update them at any time; continued use after changes constitutes acceptance.
            </p>
            <p>
              Registered users may access personalized features including bookmarks,
              annotations, and chapter downloads subject to the limits described on the
              site. Accounts are for personal, non-commercial use.
            </p>
            <p className="text-ink-faint italic">
              [Full terms to be drafted by legal counsel before user account features launch.]
            </p>
          </Section>

          <Section id="privacy-policy" title="Privacy Policy">
            <p>
              We collect only the minimum data necessary to provide the service:
              account credentials, reading preferences, bookmarks, and annotations.
              We do not sell personal data to third parties.
            </p>
            <p className="text-ink-faint italic">
              [Full privacy policy — including data retention, third-party processors,
              user rights under GDPR/CCPA, and data deletion procedures — to be drafted
              before user account features launch.]
            </p>
          </Section>

          <Section id="acceptable-use" title="Acceptable Use">
            <p>
              You may not use this site to distribute unauthorized copies of the
              manuscript, engage in automated scraping, or interfere with the service.
              Annotations and errata reports must be civil and constructive.
            </p>
            <p className="text-ink-faint italic">
              [Full acceptable use policy to be drafted before user account features launch.]
            </p>
          </Section>

          <Section id="accessibility" title="Accessibility">
            <p>
              We are committed to making this site accessible to all readers. The site
              supports keyboard navigation, screen readers, reduced-motion preferences,
              and multiple contrast modes (light, dark, and high-contrast).
            </p>
            <p>
              If you encounter an accessibility barrier, please contact us at{' '}
              <a href="mailto:finnoybu@gmail.com">finnoybu@gmail.com</a> and we will
              work to resolve it promptly.
            </p>
          </Section>

          <Section id="cookie-policy" title="Cookie Policy">
            <p>
              This site uses local storage to persist your reading preferences,
              bookmarks, and scroll position. No tracking cookies are used. If
              third-party services are added in the future (analytics, authentication),
              this policy will be updated accordingly.
            </p>
          </Section>

          <Section id="disclaimer" title="Disclaimer">
            <p>
              This digital edition has been prepared with care, but the publisher makes no
              warranties regarding the completeness or accuracy of the transcription. The
              views expressed in the memoir are those of the original author and reflect
              the language and attitudes of his era.
            </p>
          </Section>

          <Section id="dmca" title="DMCA &amp; Takedown">
            <p>
              If you believe content on this site infringes your copyright, please
              send a written notice to{' '}
              <a href="mailto:finnoybu@gmail.com">finnoybu@gmail.com</a>{' '}
              including: identification of the copyrighted work, the infringing URL,
              your contact information, and a statement of good-faith belief.
            </p>
          </Section>

          <Section id="impressum" title="Impressum">
            <p>
              <strong>Publisher:</strong> Finnoybu Press
            </p>
            <p>
              <strong>Responsible person:</strong> Ken Tannenbaum
            </p>
            <p>
              <strong>Contact:</strong>{' '}
              <a href="mailto:finnoybu@gmail.com">finnoybu@gmail.com</a>
            </p>
          </Section>
        </div>
      </div>
    </div>
  )
}
