import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { marked } from 'marked'

export interface ChapterMeta {
  id: number
  title: string
  slug: string
  hero: {
    image: string
  }
  excerpt: string
}

export interface Chapter extends ChapterMeta {
  content: string
}

const CONTENT_DIR = path.join(process.cwd(), 'content', 'en')

function makeExcerpt(body: string, maxLen = 180): string {
  const firstPara = body
    .replace(/\r\n/g, '\n')
    .split(/\n\n+/)
    .map((p) => p.trim())
    .find((p) => p.length > 0) || ''
  const clean = firstPara.replace(/\s+/g, ' ').trim()
  if (clean.length <= maxLen) return clean
  const cut = clean.slice(0, maxLen)
  const lastSpace = cut.lastIndexOf(' ')
  return (lastSpace > 80 ? cut.slice(0, lastSpace) : cut) + '…'
}

export function getAllChapters(): ChapterMeta[] {
  if (!fs.existsSync(CONTENT_DIR)) {
    return []
  }

  const files = fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith('.md'))

  const chapters: ChapterMeta[] = files
    .map((file) => {
      const raw = fs.readFileSync(path.join(CONTENT_DIR, file), 'utf8')
      const { data, content: body } = matter(raw)
      return {
        id: data.id,
        title: data.title,
        slug: data.slug,
        hero: data.hero,
        excerpt: makeExcerpt(body),
      } as ChapterMeta
    })
    .sort((a, b) => a.id - b.id)

  return chapters
}

export function getChapterBySlug(slug: string): Chapter | null {
  const chapters = getAllChapters()
  const meta = chapters.find((c) => c.slug === slug)

  if (!meta) {
    return null
  }

  const filePath = path.join(CONTENT_DIR, `${meta.slug}.md`)
  if (!fs.existsSync(filePath)) {
    return null
  }

  const raw = fs.readFileSync(filePath, 'utf8')
  const { content: markdown, data } = matter(raw)
  const content = marked.parse(markdown)

  return {
    id: data.id,
    title: data.title,
    slug: data.slug,
    hero: data.hero,
    content,
  } as Chapter
}

export function getChapterIndex(slug: string): number {
  const chapters = getAllChapters()
  return chapters.findIndex((c) => c.slug === slug)
}

export function getAdjacentChapters(slug: string): {
  prev: ChapterMeta | null
  next: ChapterMeta | null
} {
  const chapters = getAllChapters()
  const index = chapters.findIndex((c) => c.slug === slug)

  return {
    prev: index > 0 ? chapters[index - 1] : null,
    next: index < chapters.length - 1 ? chapters[index + 1] : null,
  }
}
