import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch about A Sailor\'s Reminiscences.',
}

export default function ContactPage() {
  return (
    <div className="max-w-shell mx-auto px-6 py-16 md:py-24">
      <div className="max-w-prose mx-auto">
        <p className="eyebrow mb-4">Get in touch</p>
        <h1
          className="font-display text-4xl md:text-5xl leading-tight text-ink mb-10"
          style={{ fontFeatureSettings: "'ss01'" }}
        >
          Contact
        </h1>

        <div className="prose-memoir">
          <p>
            This edition is maintained by Ken Tannenbaum. For inquiries about the
            manuscript, corrections, or permissions, please reach out:
          </p>

          <p>
            <strong>Email:</strong>{' '}
            <a href="mailto:finnoybu@gmail.com">finnoybu@gmail.com</a>
          </p>

          <p>
            <strong>Publisher:</strong> Finnoybu Press
          </p>
        </div>
      </div>
    </div>
  )
}
