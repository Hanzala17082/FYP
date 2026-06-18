import type { SupabaseClient } from '@supabase/supabase-js'
import { formatSupabaseError } from '@/shared/lib/supabase/format-error'
import { mapBookingRow } from '@/shared/lib/supabase/mappers'
import type { BookingDTO } from '@/types/api/bookings.types'

const TRIP_EMBED = '*, agency:agencies(*, users(avatar_url))'
export const BOOKING_SELECT = `*, trip:trips(${TRIP_EMBED}), traveler:users(*)`

async function agencyTripIds(admin: SupabaseClient, userId: string): Promise<string[]> {
  const { data: ag } = await admin.from('agencies').select('id').eq('user_id', userId).maybeSingle()
  if (!ag) throw new Error('Agency profile not found.')
  const agencyId = String((ag as { id: string }).id)
  const { data: tripRows } = await admin.from('trips').select('id').eq('agency_id', agencyId)
  return (tripRows ?? []).map((t: { id: string }) => t.id)
}

export interface LoadBookingsParams {
  userId: string
  role: string
  page?: number
  limit?: number
  travelerId?: string
}

export interface LoadBookingsResult {
  bookings: BookingDTO[]
  total: number
  page: number
  limit: number
}

export async function loadBookings(
  admin: SupabaseClient,
  params: LoadBookingsParams
): Promise<LoadBookingsResult> {
  const page = Math.max(1, params.page ?? 1)
  const limit = Math.min(100, Math.max(1, params.limit ?? 20))
  const start = (page - 1) * limit
  const end = start + limit - 1
  const travelerFilter = params.travelerId?.trim()

  let q = admin.from('bookings').select(BOOKING_SELECT, { count: 'exact' }).order('created_at', { ascending: false })

  if (params.role === 'Traveler') {
    const only = travelerFilter ?? params.userId
    if (travelerFilter && travelerFilter !== params.userId) {
      throw new Error('Forbidden.')
    }
    q = q.eq('traveler_id', only)
  } else if (params.role === 'Agency') {
    const ids = await agencyTripIds(admin, params.userId)
    if (ids.length === 0) {
      return { bookings: [], total: 0, page, limit }
    }
    q = q.in('trip_id', ids)
    if (travelerFilter) q = q.eq('traveler_id', travelerFilter)
  } else if (params.role === 'Admin') {
    if (travelerFilter) q = q.eq('traveler_id', travelerFilter)
  } else {
    throw new Error('Forbidden.')
  }

  const { data, error, count } = await q.range(start, end)
  if (error) throw new Error(formatSupabaseError(error))

  const rows = (data ?? []) as Record<string, unknown>[]
  return {
    bookings: rows.map((row) => mapBookingRow(row)),
    total: count ?? rows.length,
    page,
    limit,
  }
}
