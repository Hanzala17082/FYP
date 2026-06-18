import {
  createRouteHandlerSupabaseClient,
  linkExpiredRedirect,
  redirectWithCookies,
  sanitizeNextPath,
} from '@/shared/lib/supabase/route-handler'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next')
  const authError = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

  if (authError || errorDescription) {
    return linkExpiredRedirect(origin)
  }

  if (code) {
    const { supabase, pendingCookies } = await createRouteHandlerSupabaseClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      if (next === '/reset-password') {
        return redirectWithCookies(`${origin}/reset-password`, pendingCookies)
      }
      const destination = next ? sanitizeNextPath(next, '/auth/oauth-complete') : '/auth/oauth-complete'
      return redirectWithCookies(`${origin}${destination}`, pendingCookies)
    }
  }

  return linkExpiredRedirect(origin)
}
