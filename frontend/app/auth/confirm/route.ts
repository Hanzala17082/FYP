import type { EmailOtpType } from '@supabase/supabase-js'
import {
  createRouteHandlerSupabaseClient,
  linkExpiredRedirect,
  redirectWithCookies,
  sanitizeNextPath,
} from '@/shared/lib/supabase/route-handler'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = sanitizeNextPath(searchParams.get('next'))
  const authError = searchParams.get('error')

  if (authError) {
    return linkExpiredRedirect(origin)
  }

  if (code) {
    const { supabase, pendingCookies } = await createRouteHandlerSupabaseClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return redirectWithCookies(`${origin}${next}`, pendingCookies)
    }
    return linkExpiredRedirect(origin)
  }

  if (tokenHash && type) {
    const { supabase, pendingCookies } = await createRouteHandlerSupabaseClient()
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    })

    if (!error) {
      return redirectWithCookies(`${origin}${next}`, pendingCookies)
    }
  }

  return linkExpiredRedirect(origin)
}
