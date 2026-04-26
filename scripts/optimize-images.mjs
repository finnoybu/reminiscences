// Reads source PNGs from src/images/, writes 1200x630 cover-cropped WebP
// to public/images/. Used for both browser rendering (next/image) and OG/social
// previews — Facebook/Twitter accept WebP.
//
// Run: pnpm optimize:images

import { readdir, mkdir, stat } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const SRC = path.join(ROOT, 'src', 'images')
const OUT = path.join(ROOT, 'public', 'images')

const TARGET_WIDTH = 1200
const TARGET_HEIGHT = 630
const QUALITY = 82

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) files.push(...(await walk(full)))
    else if (entry.isFile() && /\.png$/i.test(entry.name)) files.push(full)
  }
  return files
}

async function processOne(srcPath) {
  const rel = path.relative(SRC, srcPath)
  const outPath = path.join(OUT, rel).replace(/\.png$/i, '.webp')
  await mkdir(path.dirname(outPath), { recursive: true })

  const skip =
    existsSync(outPath) &&
    (await stat(outPath)).mtimeMs >= (await stat(srcPath)).mtimeMs

  if (skip) return { rel, status: 'skip' }

  const info = await sharp(srcPath)
    .resize(TARGET_WIDTH, TARGET_HEIGHT, { fit: 'cover', position: 'centre' })
    .webp({ quality: QUALITY })
    .toFile(outPath)

  return { rel, status: 'wrote', bytes: info.size }
}

async function main() {
  if (!existsSync(SRC)) {
    console.error(`source dir not found: ${SRC}`)
    process.exit(1)
  }

  const files = await walk(SRC)
  if (files.length === 0) {
    console.log('no source images found')
    return
  }

  let wrote = 0
  let skipped = 0
  for (const file of files) {
    const result = await processOne(file)
    if (result.status === 'wrote') {
      wrote++
      console.log(`  wrote  ${result.rel.replace(/\.png$/i, '.webp')}  ${(result.bytes / 1024).toFixed(0)} KB`)
    } else {
      skipped++
    }
  }
  console.log(`\ndone — ${wrote} written, ${skipped} skipped (up-to-date)`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
