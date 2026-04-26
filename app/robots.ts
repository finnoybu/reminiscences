import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/account/', '/api/', '/auth/', '/shop/'],
      },
    ],
    sitemap: 'https://memoirs.finnoybu.com/sitemap.xml',
    host: 'https://memoirs.finnoybu.com',
  }
}
