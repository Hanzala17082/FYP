/** Supabase URL + publishable or anon JWT (`NEXT_PUBLIC_*` — exposed to browser). */

export const SUPABASE_ENV_HINT =
  'Set NEXT_PUBLIC_SUPABASE_URL plus NEXT_PUBLIC_SUPABASE_ANON_KEY (JWT, best for PostgREST) and/or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in REHNUM/frontend/.env.local. Dashboard → Settings → API. Restart `npm run dev` after editing.'

/** True when URL and at least one client key are non-empty. */
export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim()
  return Boolean(url && key)
}

export function getSupabaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  if (!url) {
    throw new Error(`Missing NEXT_PUBLIC_SUPABASE_URL. ${SUPABASE_ENV_HINT}`)
  }
  return url
}

/**
 * JWT anon first — most reliable with PostgREST. Some `sb_publishable_…` setups return PGRST301
 * or empty behaviour until the project fully migrates keys; publishable is the fallback.
 */
export function getSupabaseAnonKey(): string {
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim()
  if (!key) {
    throw new Error(`Missing NEXT_PUBLIC_SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY. ${SUPABASE_ENV_HINT}`)
  }
  return key
}
