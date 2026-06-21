import { NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/shared/lib/supabase/admin'
import { requireAuthenticatedUser } from '@/shared/lib/supabase/api-auth'
import { formatSupabaseError } from '@/shared/lib/supabase/format-error'
import { mapAgencyRow } from '@/shared/lib/supabase/mappers'
import { phoneInTextValidationMessage } from '@/shared/utils/phone-in-text'
import { USER_ROLES } from '@/config/constants'

const AGENCY_SELECT = '*, users(avatar_url)'

export async function PATCH(request: Request) {
  try {
    const auth = await requireAuthenticatedUser()
    if (!auth.ok) return auth.response

    if (auth.user.role !== USER_ROLES.AGENCY) {
      return NextResponse.json({ error: 'Only agencies can edit an agency profile.' }, { status: 403 })
    }

    const body = await request.json().catch(() => ({}))
    const updates: Record<string, string | null> = {}

    if (body.description != null) {
      const description = String(body.description).trim()
      // Block phone numbers in the bio (digits or spelled-out words).
      const phoneError = phoneInTextValidationMessage(description)
      if (phoneError) {
        return NextResponse.json({ error: phoneError }, { status: 400 })
      }
      updates.description = description || null
    }

    if (body.location != null) {
      updates.location = String(body.location).trim() || null
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No agency fields to update.' }, { status: 400 })
    }

    updates.updated_at = new Date().toISOString()

    const admin = createAdminSupabaseClient()
    const { data: row, error } = await admin
      .from('agencies')
      .update(updates)
      .eq('user_id', auth.user.id)
      .select(AGENCY_SELECT)
      .single()

    if (error || !row) {
      return NextResponse.json(
        { error: error ? formatSupabaseError(error) : 'Agency profile not found.' },
        { status: 400 }
      )
    }

    return NextResponse.json({ ok: true, data: mapAgencyRow(row as Record<string, unknown>) })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to update agency profile.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
