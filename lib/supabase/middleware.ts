import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Routes that recovery sessions are allowed to access
const RECOVERY_ALLOWED = ['/', '/auth/callback']

const cookieDomain = process.env.NEXT_PUBLIC_COOKIE_DOMAIN

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    return supabaseResponse
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(
              name,
              value,
              cookieDomain ? { ...options, domain: cookieDomain } : options
            )
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Block recovery sessions from accessing anything except the password reset flow.
  // Supabase does not expose the JWT amr claim on the session object, so we detect
  // recovery sessions via recovery_sent_at on the user. If it's within the last hour,
  // this is an active recovery — block all routes except the password reset flow.
  // This mitigates supabase/supabase#32681.
  if (user?.recovery_sent_at) {
    const elapsed = Date.now() - new Date(user.recovery_sent_at).getTime()
    if (elapsed < 60 * 60 * 1000) {
      const pathname = request.nextUrl.pathname
      if (!RECOVERY_ALLOWED.includes(pathname)) {
        const url = request.nextUrl.clone()
        url.pathname = '/'
        url.searchParams.set('recovery', 'true')
        return NextResponse.redirect(url)
      }
    }
  }

  return supabaseResponse
}
