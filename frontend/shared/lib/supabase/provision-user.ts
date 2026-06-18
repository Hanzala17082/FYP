import type { SupabaseClient } from '@supabase/supabase-js'
import { formatSupabaseError } from '@/shared/lib/supabase/format-error'

export type AppUserRole = 'Traveler' | 'Agency'

export async function appUserExists(sb: SupabaseClient, userId: string): Promise<boolean> {
  const { data, error } = await sb.from('users').select('id').eq('id', userId).maybeSingle()
  if (error) throw new Error(formatSupabaseError(error))
  return !!data
}

export async function provisionAppUser(
  sb: SupabaseClient,
  params: {
    uid: string
    email: string
    fullName: string
    role: AppUserRole
    city?: string | null
    cnic?: string | null
    isEmailVerified?: boolean
  }
): Promise<void> {
  const exists = await appUserExists(sb, params.uid)
  if (exists) return

  const now = new Date().toISOString()
  const row = {
    id: params.uid,
    email: params.email.trim(),
    password: '!managed_by_supabase_auth',
    full_name: params.fullName,
    role: params.role,
    city: params.city?.trim() || null,
    avatar_url: null,
    is_email_verified: params.isEmailVerified ?? true,
    is_active: true,
    is_staff: false,
    is_superuser: false,
    last_login: null,
    created_at: now,
    updated_at: now,
  }

  const { error: insertUserErr } = await sb.from('users').insert(row)
  if (insertUserErr) throw new Error(formatSupabaseError(insertUserErr))

  if (params.role === 'Traveler') {
    const { error: tpErr } = await sb.from('traveler_profiles').insert({
      id: crypto.randomUUID(),
      user_id: params.uid,
      cnic: params.cnic?.trim() || null,
      preferences: {},
      created_at: now,
      updated_at: now,
    })
    if (tpErr) throw new Error(formatSupabaseError(tpErr))
  } else {
    const base =
      params.fullName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 40) || 'agency'
    const slug = `${base}-${params.uid.slice(0, 8)}`
    const { error: agErr } = await sb.from('agencies').insert({
      id: crypto.randomUUID(),
      user_id: params.uid,
      agency_name: params.fullName,
      agency_slug: slug,
      description: '',
      location: params.city?.trim() || '',
      verified: false,
      created_at: now,
      updated_at: now,
    })
    if (agErr) throw new Error(formatSupabaseError(agErr))
  }
}
