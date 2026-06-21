import { NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/shared/lib/supabase/admin'
import { requireAuthenticatedUser } from '@/shared/lib/supabase/api-auth'
import { mapTripRow } from '@/shared/lib/supabase/mappers'

const TRIP_EMBED = '*, agency:agencies(*, users(avatar_url))'

export async function GET() {
  const auth = await requireAuthenticatedUser()
  if (!auth.ok) return auth.response
  if (auth.user.role !== 'Admin') {
    return NextResponse.json({ error: 'Forbidden.' }, { status: 403 })
  }

  const admin = createAdminSupabaseClient()

  const [{ data: tripsData, error: tripsErr }, { data: bookingsData }] = await Promise.all([
    admin.from('trips').select(TRIP_EMBED).order('created_at', { ascending: false }),
    admin.from('bookings').select('trip_id'),
  ])

  if (tripsErr) {
    return NextResponse.json({ error: tripsErr.message }, { status: 500 })
  }

  const bookingCountByTrip = new Map<string, number>()
  for (const b of bookingsData ?? []) {
    const tripId = String((b as { trip_id?: string }).trip_id ?? '')
    if (tripId) bookingCountByTrip.set(tripId, (bookingCountByTrip.get(tripId) ?? 0) + 1)
  }

  const trips = (tripsData ?? []).map((r) => {
    const dto = mapTripRow(r as Record<string, unknown>, false)
    return { ...dto, bookingCount: bookingCountByTrip.get(dto.id) ?? 0 }
  })

  return NextResponse.json({ trips, total: trips.length })
}
