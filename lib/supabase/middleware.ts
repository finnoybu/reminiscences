import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Routes that recovery sessions are allowed to access
const RECOVERY_ALLOWED = ['/', '/auth/callback']

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
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  await supabase.auth.getUser()

  // Block recovery sessions from accessing anything except the password reset flow.
  // The JWT's amr (Authentication Methods Reference) claim contains { method: "recovery" }
  // for sessions created via a password reset link. Without this check, clicking a reset
  // link grants full app access — a known Supabase issue (supabase/supabase#32681).
  const { data: { session } } = await supabase.auth.getSession()
  if (session) {
    const amr = (session as any).amr as Array<{ method: string }> | undefined
    console.log('[middleware] session amr:', JSON.stringify(amr))
    const isRecovery = amr?.some((entry) => entry.method === 'recovery')
    if (isRecovery) {
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
