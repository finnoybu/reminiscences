import Link from 'next/link'

export default function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-rule-soft">
      <div className="max-w-shell mx-auto px-6 py-8">
        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-8 font-sans text-xs uppercase tracking-widest">
          <Link href="/about" className="text-ink-muted hover:text-accent transition-colors">About</Link>
          <Link href="/contact" className="text-ink-muted hover:text-accent transition-colors">Contact</Link>
          <Link href="/legal" className="text-ink-muted hover:text-accent transition-colors">Legal</Link>
          <Link href="/legal#privacy-policy" className="text-ink-muted hover:text-accent transition-colors">Privacy Policy</Link>
        </nav>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 font-sans text-xs text-ink-faint">
          <p>
            Built and maintained by{' '}
            <a
              href="https://finnoybu.github.io/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-ink-muted hover:text-accent transition-colors"
            >
              Ken Tannenbaum
            </a>
          </p>
          <p>
            <Link href="/legal#copyright" className="hover:text-accent transition-colors">
              &copy; 2026 Finnoybu Press
            </Link>
            . All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
