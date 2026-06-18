import { NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/shared/lib/supabase/admin'
import { requireAuthenticatedUser } from '@/shared/lib/supabase/api-auth'
import { formatSupabaseError } from '@/shared/lib/supabase/format-error'
import { mapUserRow } from '@/shared/lib/supabase/mappers'

export async function PATCH(request: Request) {
  try {
    const auth = await requireAuthenticatedUser()
    if (!auth.ok) return auth.response

    const body = await request.json()
    const updates: Record<string, string | null> = {}

    if (body.fullName != null) {
      const fullName = String(body.fullName).trim()
      if (!fullName) {
        return NextResponse.json({ error: 'Full name cannot be empty.' }, { status: 400 })
      }
      updates.full_name = fullName
    }

    if (body.city != null) {
      updates.city = String(body.city).trim() || null
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No profile fields to update.' }, { status: 400 })
    }

    updates.updated_at = new Date().toISOString()

    const admin = createAdminSupabaseClient()
    const { data: row, error } = await admin
      .from('users')
      .update(updates)
      .eq('id', auth.user.id)
      .select('*')
      .single()

    if (error || !row) {
      return NextResponse.json(
        { error: error ? formatSupabaseError(error) : 'Failed to update profile.' },
        { status: 400 }
      )
    }

    return NextResponse.json({ ok: true, data: mapUserRow(row as Record<string, unknown>) })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to update profile.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
