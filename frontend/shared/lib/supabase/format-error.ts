const FRIENDLY_MESSAGES: Record<string, string> = {
  user_already_exists: 'An account with this email already exists. Try logging in instead.',
  email_address_invalid: 'Please enter a valid email address.',
  email_not_confirmed: 'Please confirm your email before signing in. Check your inbox and spam folder.',
  invalid_credentials: 'Invalid email or password. If you signed up with Google, use Continue with Google instead.',
}

/** Turn Supabase / PostgREST errors into a readable string (code, message, details, hint). */
export function formatSupabaseError(e: unknown): string {
  if (e && typeof e === 'object') {
    const o = e as Record<string, unknown>
    const code = o.code != null ? String(o.code) : ''
    if (code && FRIENDLY_MESSAGES[code]) {
      return FRIENDLY_MESSAGES[code]
    }
    const msg = o.message != null ? String(o.message) : ''
    const details = o.details != null ? String(o.details) : ''
    const hint = o.hint != null ? String(o.hint) : ''
    const parts = [code && `[${code}]`, msg, details, hint].filter(Boolean) as string[]
    if (parts.length) return parts.join(' — ')
  }
  return String(e)
}
