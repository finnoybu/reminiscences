import type { MetadataRoute } from 'next'
import { getAllChapters } from '@/lib/chapters'

const BASE = 'https://memoirs.finnoybu.com'

export default function sitemap(): MetadataRoute.Sitemap {
  const chapters = getAllChapters()
  const now = new Date()

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/contact`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE}/legal`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
  ]

  const chapterPages: MetadataRoute.Sitemap = chapters.map((c) => ({
    url: `${BASE}/chapters/${c.slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  return [...staticPages, ...chapterPages]
}
