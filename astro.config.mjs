import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import cloudflare from '@astrojs/cloudflare';

// memoirs.finnoybu.com runs on Cloudflare Pages. The cloudflare adapter
// wires Astro.locals.runtime.env so route handlers can access D1 / R2 /
// other bindings declared in wrangler.toml. SSR output; content collections
// (chapters) still prerender at build time.
//
// Tailwind integration: applyBaseStyles=false so we own the @tailwind
// directives in src/styles/global.css (mixes with our design tokens).
export default defineConfig({
  site: 'https://memoirs.finnoybu.com',
  trailingSlash: 'never',
  output: 'server',
  adapter: cloudflare({
    imageService: 'compile',
  }),
  build: {
    format: 'directory',
  },
  integrations: [
    react(),
    sitemap(),
    tailwind({ applyBaseStyles: false }),
  ],
});
