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
    const res = await fetch('/api/bookings/create-with-wallet', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const body = await res.json().catch(() => ({}))
    if (!res.ok) {
      throw new Error(typeof body.error === 'string' ? body.error : 'Failed to create booking.')
    }
    return ok(body.data.booking as BookingDTO)
  },

  createBookingWithWallet: async (
    data: BookingRequestDTO
  ): Promise<ApiResponse<{ booking: BookingDTO; newBalance: number; totalAmount: number }>> => {
    const res = await fetch('/api/bookings/create-with-wallet', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const body = await res.json().catch(() => ({}))
    if (!res.ok) {
      throw new Error(typeof body.error === 'string' ? body.error : 'Failed to create booking.')
    }
    return ok(body.data)
  },

  getBookings: async (
    params?: PaginationParams & { traveler_id?: string }
  ): Promise<ApiResponse<BookingListResponseDTO>> => {
    const qs = new URLSearchParams()
    if (params?.page) qs.set('page', String(params.page))
    if (params?.limit) qs.set('limit', String(params.limit))
    if (params?.traveler_id) qs.set('traveler_id', params.traveler_id)

    const query = qs.toString()
    const res = await fetch(`/api/bookings${query ? `?${query}` : ''}`, {
      method: 'GET',
      credentials: 'include',
    })
    const body = await res.json().catch(() => ({}))
    if (!res.ok) {
      throw new Error(typeof body.error === 'string' ? body.error : 'Failed to load bookings.')
    }
    return ok(body.data as BookingListResponseDTO)
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

    if (role === 'Agency' || role === 'Admin') {
      const res = await fetch(`/api/bookings/${id}/status`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(typeof body.error === 'string' ? body.error : 'Failed to update booking.')
      }
      return ok(body.data as BookingDTO)
    }

    const { data: raw, error: rawErr } = await sb.from('bookings').select('*').eq('id', id).maybeSingle()
    if (rawErr) throw new Error(formatSupabaseError(rawErr))
    if (!raw) throw new Error('Booking not found.')

    const rowMeta = raw as { traveler_id?: string; trip_id?: string }
    const okView = await bookingVisibleToViewer(sb, rowMeta, session.user.id, role)
    if (!okView) throw new Error('Forbidden.')

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
