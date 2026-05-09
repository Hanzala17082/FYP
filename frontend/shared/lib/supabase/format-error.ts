/** Turn Supabase / PostgREST errors into a readable string (code, message, details, hint). */
export function formatSupabaseError(e: unknown): string {
  if (e && typeof e === 'object') {
    const o = e as Record<string, unknown>
    const code = o.code != null ? String(o.code) : ''
    const msg = o.message != null ? String(o.message) : ''
    const details = o.details != null ? String(o.details) : ''
    const hint = o.hint != null ? String(o.hint) : ''
    const parts = [code && `[${code}]`, msg, details, hint].filter(Boolean) as string[]
    if (parts.length) return parts.join(' — ')
  }
  return String(e)
}
