import { NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/shared/lib/supabase/admin'
import { requireAuthenticatedUser } from '@/shared/lib/supabase/api-auth'
import { mapAgencyRow } from '@/shared/lib/supabase/mappers'

export async function GET() {
  const auth = await requireAuthenticatedUser()
  if (!auth.ok) return auth.response
  if (auth.user.role !== 'Admin') {
    return NextResponse.json({ error: 'Forbidden.' }, { status: 403 })
  }

  const admin = createAdminSupabaseClient()

  const [{ data: agenciesData }, { data: tripsData }] = await Promise.all([
    admin.from('agencies').select('*, users(id, email, avatar_url)').order('created_at', { ascending: false }),
    admin.from('trips').select('id, agency_id'),
  ])

  const tripCountByAgency = new Map<string, number>()
  for (const t of tripsData ?? []) {
    const agencyId = String((t as { agency_id?: string }).agency_id ?? '')
    if (agencyId) tripCountByAgency.set(agencyId, (tripCountByAgency.get(agencyId) ?? 0) + 1)
  }

  const agencies = (agenciesData ?? []).map((r) => {
    const row = r as Record<string, unknown>
    const dto = mapAgencyRow(row)
    const usersNested = row.users as Record<string, unknown> | Record<string, unknown>[] | undefined
    const u = Array.isArray(usersNested) ? usersNested[0] : usersNested
    return {
      ...dto,
      email: u?.email ? String(u.email) : '',
      tripCount: tripCountByAgency.get(dto.id) ?? 0,
      joinedAt: row.created_at ? String(row.created_at) : '',
      verificationStatus: row.verification_status ? String(row.verification_status) : 'none',
    }
  })

  return NextResponse.json({ agencies })
}
