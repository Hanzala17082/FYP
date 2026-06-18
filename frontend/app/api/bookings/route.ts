import { NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/shared/lib/supabase/admin'
import { requireAuthenticatedUser } from '@/shared/lib/supabase/api-auth'
import { loadBookings } from '@/shared/lib/bookings/load-bookings'

export async function GET(request: Request) {
  try {
    const auth = await requireAuthenticatedUser()
    if (!auth.ok) return auth.response

    const { searchParams } = new URL(request.url)
    const page = Number(searchParams.get('page') ?? '1')
    const limit = Number(searchParams.get('limit') ?? '20')
    const travelerId = searchParams.get('traveler_id') ?? undefined

    const admin = createAdminSupabaseClient()
    const data = await loadBookings(admin, {
      userId: auth.user.id,
      role: auth.user.role,
      page: Number.isFinite(page) ? page : 1,
      limit: Number.isFinite(limit) ? limit : 20,
      travelerId,
    })

    return NextResponse.json({ ok: true, data })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to load bookings.'
    const status = message === 'Forbidden.' ? 403 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
