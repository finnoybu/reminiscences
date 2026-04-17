import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const next = searchParams.get('next') ?? '/'
  const origin = new URL(request.url).origin

  // Default redirect: wherever `next` points, or error page
  const hasAuth = code || token_hash
  const redirectTo = hasAuth ? `${origin}${next}` : `${origin}/?auth_error=true`
  const response = NextResponse.redirect(redirectTo)

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  if (code) {
    // PKCE flow (signup confirmation, magic link, OAuth)
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      console.error('Auth callback error:', error.message)
      return NextResponse.redirect(`${origin}/?auth_error=true`)
    }
  } else if (token_hash && type) {
    // Token hash flow (password recovery, email change)
    const { error } = await supabase.auth.verifyOtp({ token_hash, type: type as any })
    if (error) {
      console.error('Auth callback OTP error:', error.message)
      return NextResponse.redirect(`${origin}/?auth_error=true`)
    }
    // For recovery, override redirect to the password update page
    if (type === 'recovery') {
      return NextResponse.redirect(`${origin}/account/update-password`)
    }
  }

  return response
}
