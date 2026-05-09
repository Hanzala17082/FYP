import { createBrowserSupabaseClient } from '@/shared/lib/supabase/client'
import { formatSupabaseError } from '@/shared/lib/supabase/format-error'
import { ok } from '@/shared/lib/supabase/response'
import { mapBookingRow } from '@/shared/lib/supabase/mappers'
import type { BookingRequestDTO, BookingDTO, BookingListResponseDTO } from '@/types/api/bookings.types'
import type { PaginationParams } from '@/types/api/common.type'
import type { ApiResponse } from '@/types/api/common.type'

const TRIP_EMBED = '*, agency:agencies(*, users(avatar_url))'

const BOOKING_SELECT = `
  *,
  trip:trips(${TRIP_EMBED}),
  traveler:users(*)
`

async function agencyTripIds(sb: ReturnType<typeof createBrowserSupabaseClient>, userId: string): Promise<string[]> {
  const { data: ag } = await sb.from('agencies').select('id').eq('user_id', userId).maybeSingle()
  if (!ag) throw new Error('Agency profile not found.')
  const agencyId = String((ag as { id: string }).id)
  const { data: tripRows } = await sb.from('trips').select('id').eq('agency_id', agencyId)
  return (tripRows ?? []).map((t: { id: string }) => t.id)
}

async function bookingVisibleToViewer(
  sb: ReturnType<typeof createBrowserSupabaseClient>,
  bookingRow: { traveler_id?: string; trip_id?: string },
  viewerId: string,
  role: string
): Promise<boolean> {
  if (role === 'Admin') return true
  if (bookingRow.traveler_id === viewerId) return true
  if (role === 'Agency' && bookingRow.trip_id) {
    const { data: trip } = await sb.from('trips').select('agency_id').eq('id', bookingRow.trip_id).maybeSingle()
    if (!trip) return false
    const { data: ag } = await sb
      .from('agencies')
      .select('id')
      .eq('id', (trip as { agency_id: string }).agency_id)
      .eq('user_id', viewerId)
      .maybeSingle()
    return !!ag
  }
  return false
}

export const bookingsService = {
  createBooking: async (data: BookingRequestDTO): Promise<ApiResponse<BookingDTO>> => {
    const sb = createBrowserSupabaseClient()
    const {
      data: { session },
    } = await sb.auth.getSession()
    if (!session) throw new Error('Authentication required.')

    const payload = {
      id: crypto.randomUUID(),
      trip_id: data.tripId,
      traveler_id: session.user.id,
      start_date: data.startDate,
      end_date: data.endDate,
      number_of_travelers: data.numberOfTravelers,
      status: 'pending',
      special_requests: data.specialRequests ?? null,
    }

    const { error } = await sb.from('bookings').insert(payload)
    if (error) throw new Error(formatSupabaseError(error))

    const { data: row, error: fetchErr } = await sb.from('bookings').select(BOOKING_SELECT).eq('id', payload.id).single()

    if (fetchErr || !row) throw new Error(fetchErr ? formatSupabaseError(fetchErr) : 'Booking created but failed to load.')
    return ok(mapBookingRow(row as Record<string, unknown>))
  },

  getBookings: async (
    params?: PaginationParams & { traveler_id?: string }
  ): Promise<ApiResponse<BookingListResponseDTO>> => {
    const sb = createBrowserSupabaseClient()
    const {
      data: { session },
    } = await sb.auth.getSession()
    if (!session) throw new Error('Authentication required.')

    const { data: me } = await sb.from('users').select('role').eq('id', session.user.id).maybeSingle()
    if (!me) throw new Error('Profile not found.')
    const role = String((me as { role: string }).role)

    const page = Math.max(1, params?.page ?? 1)
    const limit = Math.min(100, Math.max(1, params?.limit ?? 20))
    const start = (page - 1) * limit
    const end = start + limit - 1

    let q = sb.from('bookings').select(BOOKING_SELECT, { count: 'exact' }).order('created_at', { ascending: false })

    const travelerFilter = params?.traveler_id

    if (role === 'Traveler') {
      const only = travelerFilter ?? session.user.id
      if (travelerFilter && travelerFilter !== session.user.id) {
        throw new Error('Forbidden.')
      }
      q = q.eq('traveler_id', only)
    } else if (role === 'Agency') {
      const ids = await agencyTripIds(sb, session.user.id)
      if (ids.length === 0) {
        return ok({ bookings: [], total: 0, page, limit })
      }
      q = q.in('trip_id', ids)
      if (travelerFilter) q = q.eq('traveler_id', travelerFilter)
    } else if (role === 'Admin') {
      if (travelerFilter) q = q.eq('traveler_id', travelerFilter)
    } else {
      throw new Error('Forbidden.')
    }

    q = q.range(start, end)

    const { data, error, count } = await q
    if (error) throw new Error(formatSupabaseError(error))
    const rows = (data ?? []) as Record<string, unknown>[]
    const total = count ?? rows.length

    return ok({
      bookings: rows.map((r) => mapBookingRow(r)),
      total,
      page,
      limit,
    })
  },

  getBooking: async (id: string): Promise<ApiResponse<BookingDTO>> => {
    const sb = createBrowserSupabaseClient()
    const {
      data: { session },
    } = await sb.auth.getSession()
    if (!session) throw new Error('Authentication required.')

    const { data: me } = await sb.from('users').select('role').eq('id', session.user.id).maybeSingle()
    if (!me) throw new Error('Profile not found.')
    const role = String((me as { role: string }).role)

    const { data: raw, error } = await sb.from('bookings').select('*').eq('id', id).maybeSingle()
    if (error) throw new Error(formatSupabaseError(error))
    if (!raw) throw new Error('Booking not found.')

    const rowMeta = raw as { traveler_id?: string; trip_id?: string }
    const okView = await bookingVisibleToViewer(sb, rowMeta, session.user.id, role)
    if (!okView) throw new Error('Forbidden.')

    const { data, error: fetchErr } = await sb.from('bookings').select(BOOKING_SELECT).eq('id', id).maybeSingle()
    if (fetchErr) throw new Error(formatSupabaseError(fetchErr))
    if (!data) throw new Error('Booking not found.')
    return ok(mapBookingRow(data as Record<string, unknown>))
  },

  updateBookingStatus: async (id: string, status: string): Promise<ApiResponse<BookingDTO>> => {
    const sb = createBrowserSupabaseClient()
    const {
      data: { session },
    } = await sb.auth.getSession()
    if (!session) throw new Error('Authentication required.')

    const { data: me } = await sb.from('users').select('role').eq('id', session.user.id).maybeSingle()
    if (!me) throw new Error('Profile not found.')
    const role = String((me as { role: string }).role)

    const { data: raw, error: rawErr } = await sb.from('bookings').select('*').eq('id', id).maybeSingle()
    if (rawErr) throw new Error(formatSupabaseError(rawErr))
    if (!raw) throw new Error('Booking not found.')

    const rowMeta = raw as { traveler_id?: string; trip_id?: string }
    let allowed = role === 'Admin'
    if (role === 'Agency' && rowMeta.trip_id) {
      allowed = await bookingVisibleToViewer(sb, rowMeta, session.user.id, role)
    }
    if (!allowed) throw new Error('Forbidden.')

    const { data, error } = await sb
      .from('bookings')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select(BOOKING_SELECT)
      .single()

    if (error) throw new Error(formatSupabaseError(error))
    return ok(mapBookingRow(data as Record<string, unknown>))
  },
}
