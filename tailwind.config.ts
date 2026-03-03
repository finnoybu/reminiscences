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
        'high-contrast-bg': '#000000',
        'high-contrast-fg': '#FFFFFF',
      }
    }
  },
  plugins: []
}

export default config
