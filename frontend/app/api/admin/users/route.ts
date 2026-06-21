import { NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/shared/lib/supabase/admin'
import { requireAuthenticatedUser } from '@/shared/lib/supabase/api-auth'
import { mapUserRow } from '@/shared/lib/supabase/mappers'

export async function GET() {
  const auth = await requireAuthenticatedUser()
  if (!auth.ok) return auth.response
  if (auth.user.role !== 'Admin') {
    return NextResponse.json({ error: 'Forbidden.' }, { status: 403 })
  }

  const admin = createAdminSupabaseClient()
  const { data, error } = await admin.from('users').select('*').order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const users = (data ?? []).map((r) => mapUserRow(r as Record<string, unknown>))
  return NextResponse.json({ users, total: users.length })
}
