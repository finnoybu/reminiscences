import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import path from 'path'
import fs from 'fs'

const FILES: Record<string, { filename: string; contentType: string }> = {
  pdf: {
    filename: 'a-sailors-reminiscences.pdf',
    contentType: 'application/pdf',
  },
  epub: {
    filename: 'a-sailors-reminiscences.epub',
    contentType: 'application/epub+zip',
  },
}

export async function GET(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Sign in required' }, { status: 401 })
  }

  const { data: purchases } = await supabase
    .from('purchases')
    .select('id')
    .eq('user_id', user.id)
    .eq('product_id', 'pdf-epub')
    .limit(1)

  if (!purchases || purchases.length === 0) {
    return NextResponse.json({ error: 'Purchase required' }, { status: 403 })
  }

  const format = request.nextUrl.searchParams.get('format')
  const file = FILES[format as string]

  if (!file) {
    return NextResponse.json({ error: 'Invalid format (pdf or epub)' }, { status: 400 })
  }

  const filePath = path.join(process.cwd(), 'output', file.filename)

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 })
  }

  const buffer = fs.readFileSync(filePath)

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': file.contentType,
      'Content-Disposition': `attachment; filename="${file.filename}"`,
    },
  })
}
