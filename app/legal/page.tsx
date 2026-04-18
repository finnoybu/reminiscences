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
        <p className="font-serif text-sm text-ink-muted mb-12">Last updated: April 18, 2026</p>

        <nav className="mb-12 p-6 bg-bg-elev border border-rule-soft rounded-lg">
          <p className="eyebrow mb-3 text-[10px]">On this page</p>
          <ul className="space-y-1.5 font-sans text-sm">
            <li><a href="#copyright" className="text-accent hover:text-accent-hi transition-colors">Copyright</a></li>
            <li><a href="#terms-of-use" className="text-accent hover:text-accent-hi transition-colors">Terms of Use</a></li>
            <li><a href="#privacy-policy" className="text-accent hover:text-accent-hi transition-colors">Privacy Policy</a></li>
            <li><a href="#data-deletion" className="text-accent hover:text-accent-hi transition-colors">Data Deletion</a></li>
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
              By accessing <strong>memoirs.finnoybu.com</strong> (&ldquo;the Site&rdquo;),
              operated by Finnoybu Press (&ldquo;we,&rdquo; &ldquo;us,&rdquo; &ldquo;our&rdquo;),
              you agree to be bound by these Terms of Use. If you do not agree, please do not
              use the Site. We may update these terms at any time by posting a revised version;
              your continued use after changes constitutes acceptance.
            </p>

            <h3>Accounts</h3>
            <p>
              You may create an account using email and password or through a supported
              third-party provider (Google, Facebook, or Apple). You are responsible for
              maintaining the confidentiality of your credentials and for all activity
              under your account. Accounts are for personal, non-commercial use only.
              You must be at least 13 years of age to create an account.
            </p>

            <h3>Purchases</h3>
            <p>
              Digital downloads (PDF/ePub) are processed through Stripe. All sales are
              final. If you experience a technical issue with your purchase, contact us
              at <a href="mailto:finnoybu@gmail.com">finnoybu@gmail.com</a> and we will
              work to resolve it.
            </p>

            <h3>User-generated content</h3>
            <p>
              You retain ownership of any bookmarks, annotations, and errata reports
              you create on the Site. By submitting an errata report, you grant us a
              non-exclusive, royalty-free license to use that report to improve the
              accuracy of the manuscript.
            </p>

            <h3>Termination</h3>
            <p>
              We reserve the right to suspend or terminate accounts that violate these
              terms or the Acceptable Use policy. You may delete your account at any
              time by contacting us (see <a href="#data-deletion">Data Deletion</a>).
            </p>

            <h3>Limitation of liability</h3>
            <p>
              The Site is provided &ldquo;as is.&rdquo; To the fullest extent permitted
              by law, Finnoybu Press shall not be liable for any indirect, incidental,
              or consequential damages arising from your use of the Site.
            </p>

            <h3>Governing law</h3>
            <p>
              These terms are governed by the laws of the Commonwealth of Virginia,
              United States, without regard to conflict-of-law principles.
            </p>
          </Section>

          <Section id="privacy-policy" title="Privacy Policy">
            <p>
              Finnoybu Press (&ldquo;we,&rdquo; &ldquo;us,&rdquo; &ldquo;our&rdquo;)
              operates <strong>memoirs.finnoybu.com</strong>. This Privacy Policy explains
              what data we collect, how we use it, and your rights regarding that data.
            </p>

            <h3>What we collect</h3>

            <h4>Account information</h4>
            <p>
              When you create an account, we collect your <strong>email address</strong> and,
              if you sign in with Google or Facebook, your <strong>name</strong> and{' '}
              <strong>profile picture</strong> as provided by those services. If you create
              an account with email and password, we store a securely hashed version of your
              password&nbsp;&mdash; we never store passwords in plain text.
            </p>

            <h4>Reading activity</h4>
            <p>
              If you are signed in, we store your <strong>reading progress</strong> (which
              chapter you are reading, your scroll position, and the percentage read) so you
              can resume where you left off across devices.
            </p>

            <h4>User-generated content</h4>
            <p>
              We store <strong>bookmarks</strong> (chapter, position, and optional label),{' '}
              <strong>annotations</strong> (selected text and your notes), and{' '}
              <strong>errata reports</strong> (selected text, your description, and review status)
              that you create while using the Site.
            </p>

            <h4>Purchase information</h4>
            <p>
              When you purchase a digital download, we record the <strong>product purchased</strong>,{' '}
              <strong>amount paid</strong>, <strong>currency</strong>, and a{' '}
              <strong>Stripe session identifier</strong>. We do not receive or store your
              payment card details&nbsp;&mdash; those are handled entirely by Stripe.
            </p>

            <h4>Automatically collected data</h4>
            <p>
              We use <strong>Vercel Web Analytics</strong> to collect anonymous, aggregated
              page-view data including page URL, referrer, browser type, and country. This
              data is not linked to individual users and no cookies are set for this purpose.
            </p>

            <h4>Browser storage</h4>
            <p>
              We store your <strong>reading preferences</strong> (theme, font size) and{' '}
              <strong>cookie-consent status</strong> in your browser&rsquo;s local storage.
              This data never leaves your device unless you are signed in, in which case
              reading progress is synced to our servers.
            </p>

            <h3>How we use your data</h3>
            <ul>
              <li>To provide and maintain the reading experience (progress sync, bookmarks, annotations)</li>
              <li>To process purchases and deliver digital downloads</li>
              <li>To send transactional emails (account verification, password reset, email change confirmation)</li>
              <li>To review and incorporate errata reports into the manuscript</li>
              <li>To understand how readers use the Site in aggregate (anonymous analytics)</li>
            </ul>
            <p>
              We do <strong>not</strong> sell, rent, or share your personal data with third
              parties for advertising or marketing purposes. We do <strong>not</strong> send
              marketing or promotional emails.
            </p>

            <h3>Third-party services</h3>
            <p>We share data with the following services, solely to operate the Site:</p>
            <ul>
              <li>
                <strong>Supabase</strong> (authentication and database)&nbsp;&mdash; stores
                your account information, reading progress, bookmarks, annotations, errata
                reports, and purchase records. Supabase also sends transactional emails on
                our behalf (verification, password reset, email change).{' '}
                <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer">
                  Supabase Privacy Policy
                </a>
              </li>
              <li>
                <strong>Stripe</strong> (payment processing)&nbsp;&mdash; receives your email
                address and processes payment card details directly.{' '}
                <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer">
                  Stripe Privacy Policy
                </a>
              </li>
              <li>
                <strong>Google</strong> (OAuth sign-in)&nbsp;&mdash; if you choose to sign in
                with Google, we receive your email, name, and profile picture from Google.{' '}
                <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
                  Google Privacy Policy
                </a>
              </li>
              <li>
                <strong>Meta / Facebook</strong> (OAuth sign-in)&nbsp;&mdash; if you choose to
                sign in with Facebook, we receive your email, name, and profile picture from Meta.{' '}
                <a href="https://www.facebook.com/privacy/policy/" target="_blank" rel="noopener noreferrer">
                  Meta Privacy Policy
                </a>
              </li>
              <li>
                <strong>Vercel</strong> (hosting and analytics)&nbsp;&mdash; hosts the Site
                and collects anonymous page-view analytics.{' '}
                <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">
                  Vercel Privacy Policy
                </a>
              </li>
            </ul>

            <h3>Data retention</h3>
            <p>
              We retain your account data and associated content (bookmarks, annotations, reading
              progress) for as long as your account is active. Purchase records are retained
              indefinitely for tax and accounting purposes. If you delete your account, all
              personal data is removed except purchase records, which are anonymized.
            </p>

            <h3>Your rights</h3>
            <p>You have the right to:</p>
            <ul>
              <li><strong>Access</strong> your personal data&nbsp;&mdash; contact us and we will provide a copy of the data we hold about you.</li>
              <li><strong>Correct</strong> inaccurate data&nbsp;&mdash; you can update your email address from your account page, or contact us for other corrections.</li>
              <li><strong>Delete</strong> your data&nbsp;&mdash; see <a href="#data-deletion">Data Deletion</a> below.</li>
              <li><strong>Export</strong> your data&nbsp;&mdash; contact us and we will provide your data in a portable format.</li>
              <li><strong>Withdraw consent</strong>&nbsp;&mdash; you can revoke third-party sign-in access at any time through your Google or Facebook account settings.</li>
            </ul>
            <p>
              If you are located in the European Economic Area, you have additional rights under
              the GDPR, including the right to restrict processing and the right to lodge a
              complaint with your local data protection authority. If you are a California
              resident, the CCPA grants you similar rights. To exercise any of these rights,
              contact us at <a href="mailto:finnoybu@gmail.com">finnoybu@gmail.com</a>.
            </p>

            <h3>Children&rsquo;s privacy</h3>
            <p>
              The Site is not directed at children under 13. We do not knowingly collect
              personal data from children under 13. If you believe a child under 13 has
              provided us with personal data, please contact us and we will delete it promptly.
            </p>

            <h3>Changes to this policy</h3>
            <p>
              We may update this Privacy Policy from time to time. Changes will be posted on
              this page with an updated &ldquo;last updated&rdquo; date. Material changes
              will be communicated by email to registered users.
            </p>
          </Section>

          <Section id="data-deletion" title="Data Deletion">
            <h3>Self-service deletion</h3>
            <p>
              You can delete your account at any time from your{' '}
              <a href="/account">account settings page</a>. Click{' '}
              &ldquo;Delete my account,&rdquo; type &ldquo;delete&rdquo; to confirm,
              and your account will be removed immediately. This will:
            </p>
            <ol>
              <li>Delete your user account and authentication credentials</li>
              <li>Delete all reading progress, bookmarks, annotations, and errata reports associated with your account</li>
              <li>Anonymize any purchase records (retaining only the transaction amount and date for accounting purposes)</li>
            </ol>
            <p>
              Data deletion is permanent and cannot be reversed.
            </p>

            <h3>Deletion by request</h3>
            <p>
              If you are unable to sign in or prefer not to use the self-service option,
              you may request deletion by emailing{' '}
              <a href="mailto:finnoybu@gmail.com">finnoybu@gmail.com</a> with the subject
              line &ldquo;Delete my account.&rdquo; Please send the request from the email
              address associated with your account. We will process your request
              within <strong>30 days</strong> and confirm by email once complete.
            </p>

            <h3>Third-party accounts</h3>
            <p>
              If you signed in with Google or Facebook, deleting your account on our Site does
              not affect your Google or Facebook account. To revoke our app&rsquo;s access to your
              third-party account, visit your Google or Facebook account settings independently.
            </p>
          </Section>

          <Section id="acceptable-use" title="Acceptable Use">
            <p>When using the Site, you agree not to:</p>
            <ul>
              <li>
                Copy, reproduce, distribute, or publicly display the manuscript text or
                illustrations without prior written permission from Finnoybu Press.
              </li>
              <li>
                Use automated tools (bots, scrapers, crawlers) to access the Site or
                download content in bulk.
              </li>
              <li>
                Attempt to gain unauthorized access to other users&rsquo; accounts or data.
              </li>
              <li>
                Interfere with the operation of the Site, including introducing malware
                or overloading the server with excessive requests.
              </li>
              <li>
                Submit annotations, errata reports, or other user-generated content that
                is abusive, threatening, defamatory, or otherwise objectionable.
              </li>
              <li>
                Use the Site for any unlawful purpose or in violation of any applicable
                local, state, national, or international law.
              </li>
              <li>
                Create multiple accounts for the purpose of circumventing restrictions
                or abusing the service.
              </li>
            </ul>
            <p>
              We reserve the right to suspend or terminate accounts that violate this policy,
              with or without notice, at our sole discretion.
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
              This site uses cookies and browser local storage to provide and
              improve the reading experience. Below is a summary of what we store
              and why.
            </p>
            <h3>Essential (always active)</h3>
            <ul>
              <li>
                <strong>Authentication cookies</strong> &mdash; set by our
                authentication provider (Supabase) to keep you signed in across
                pages and sessions.
              </li>
              <li>
                <strong>Local storage</strong> &mdash; your reading preferences
                (theme, font size), scroll position, cookie-consent acknowledgement,
                and welcome-modal dismissal are stored in your browser so
                they persist between visits.
              </li>
            </ul>
            <h3>Analytics (non-identifying)</h3>
            <ul>
              <li>
                <strong>Vercel Web Analytics</strong> &mdash; collects anonymous,
                aggregated page-view data (page URL, referrer, browser, country).
                No cookies are set; data is not linked to individual users.
              </li>
            </ul>
            <p>
              We do not use cookies for advertising, retargeting, or cross-site
              tracking. If our use of cookies changes, this policy will be updated
              and the &ldquo;last updated&rdquo; date at the top of this page will
              reflect the change.
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
