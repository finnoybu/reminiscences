import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const cookieDomain = process.env.NEXT_PUBLIC_COOKIE_DOMAIN

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const next = searchParams.get('next') ?? '/'
  const origin = new URL(request.url).origin

  // Start with a default redirect; we may override the Location header below
  const hasAuth = code || token_hash
  const defaultRedirect = hasAuth ? `${origin}${next}` : `${origin}/?auth_error=true`
  const response = NextResponse.redirect(defaultRedirect)

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
            response.cookies.set(
              name,
              value,
              cookieDomain ? { ...options, domain: cookieDomain } : options
            )
          })
        },
      },
    }
  )

  if (code) {
    // PKCE flow (signup confirmation, magic link, OAuth, recovery)
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      console.error('Auth callback error:', error.message)
      response.headers.set('Location', `${origin}/?auth_error=true`)
      return response
    }
    // Detect recovery session via recovery_sent_at (amr claim is not
    // exposed by Supabase's client). Redirect to recovery modal.
    const recoverySentAt = data.user?.recovery_sent_at
    if (recoverySentAt) {
      const elapsed = Date.now() - new Date(recoverySentAt).getTime()
      if (elapsed < 60 * 60 * 1000) {
        response.headers.set('Location', `${origin}/?recovery=true`)
      }
    }
  } else if (token_hash && type) {
    // Token hash flow (password recovery, email change)
    const { error } = await supabase.auth.verifyOtp({ token_hash, type: type as any })
    if (error) {
      console.error('Auth callback OTP error:', error.message)
      response.headers.set('Location', `${origin}/?auth_error=true`)
      return response
    }
    if (type === 'recovery') {
      response.headers.set('Location', `${origin}/?recovery=true`)
    }
  }

  return response
}
