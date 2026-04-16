import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        bg: 'var(--color-bg)',
        'bg-elev': 'var(--color-bg-elev)',
        'bg-sunk': 'var(--color-bg-sunk)',
        ink: 'var(--color-ink)',
        'ink-muted': 'var(--color-ink-muted)',
        'ink-faint': 'var(--color-ink-faint)',
        rule: 'var(--color-rule)',
        'rule-soft': 'var(--color-rule-soft)',
        accent: 'var(--color-accent)',
        'accent-hi': 'var(--color-accent-hi)',
        brass: 'var(--color-brass)',
        'high-contrast-bg': '#000000',
        'high-contrast-fg': '#ffffff',
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        prose: '38rem',
        measure: '42rem',
        shell: '76rem',
      },
      boxShadow: {
        soft: '0 1px 2px rgb(0 0 0 / 0.04), 0 8px 32px rgb(0 0 0 / 0.08)',
        lift: '0 2px 4px rgb(0 0 0 / 0.06), 0 16px 48px rgb(0 0 0 / 0.12)',
      },
      letterSpacing: {
        wider: '0.08em',
        widest: '0.22em',
      },
      transitionTimingFunction: {
        tide: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
      },
    }
  },
  plugins: []
}

export default config
