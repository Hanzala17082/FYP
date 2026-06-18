import { NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/shared/lib/supabase/admin'
import { requireAuthenticatedUser } from '@/shared/lib/supabase/api-auth'
import { formatSupabaseError } from '@/shared/lib/supabase/format-error'
import { mapBookingRow } from '@/shared/lib/supabase/mappers'

const TRIP_EMBED = '*, agency:agencies(*, users(avatar_url))'
const BOOKING_SELECT = `*, trip:trips(${TRIP_EMBED}), traveler:users(*)`

const REFUND_STATUSES = new Set(['cancelled', 'rejected'])

async function actorCanUpdateBooking(
  admin: ReturnType<typeof createAdminSupabaseClient>,
  booking: { trip_id?: string; traveler_id?: string },
  actorId: string,
  role: string
): Promise<boolean> {
  if (role === 'Admin') return true
  if (role === 'Agency' && booking.trip_id) {
    const { data: trip } = await admin.from('trips').select('agency_id').eq('id', booking.trip_id).maybeSingle()
    if (!trip) return false
    const { data: agency } = await admin
      .from('agencies')
      .select('id')
      .eq('id', (trip as { agency_id: string }).agency_id)
      .eq('user_id', actorId)
      .maybeSingle()
    return !!agency
  }
  return false
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuthenticatedUser()
    if (!auth.ok) return auth.response

    const { id } = await context.params
    const body = await request.json()
    const status = String(body.status ?? '').trim()

    if (!status) {
      return NextResponse.json({ error: 'status is required.' }, { status: 400 })
    }

    const admin = createAdminSupabaseClient()
    const { data: raw, error: rawErr } = await admin.from('bookings').select('*').eq('id', id).maybeSingle()
    if (rawErr) return NextResponse.json({ error: formatSupabaseError(rawErr) }, { status: 400 })
    if (!raw) return NextResponse.json({ error: 'Booking not found.' }, { status: 404 })

    const bookingMeta = raw as {
      trip_id?: string
      traveler_id?: string
      status?: string
      payment_status?: string
      agency_payout_status?: string
    }

    const allowed = await actorCanUpdateBooking(admin, bookingMeta, auth.user.id, auth.user.role)
    if (!allowed) {
      return NextResponse.json({ error: 'Forbidden.' }, { status: 403 })
    }

    if (status === 'confirmed' && bookingMeta.status === 'pending') {
      const { error: payoutErr } = await admin.rpc('credit_agency_wallet_for_booking', {
        p_booking_id: id,
      })
      if (payoutErr) {
        return NextResponse.json({ error: formatSupabaseError(payoutErr) }, { status: 400 })
      }
    }

    if (REFUND_STATUSES.has(status) && bookingMeta.payment_status === 'paid') {
      if (bookingMeta.agency_payout_status === 'paid') {
        return NextResponse.json(
          { error: 'This booking was already paid to the agency and cannot be refunded automatically.' },
          { status: 400 }
        )
      }
      const { error: refundErr } = await admin.rpc('refund_booking_wallet', { p_booking_id: id })
      if (refundErr) {
        return NextResponse.json({ error: formatSupabaseError(refundErr) }, { status: 400 })
      }
    }

    const { data, error } = await admin
      .from('bookings')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select(BOOKING_SELECT)
      .single()

    if (error) {
      return NextResponse.json({ error: formatSupabaseError(error) }, { status: 400 })
    }

    return NextResponse.json({ ok: true, data: mapBookingRow(data as Record<string, unknown>) })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to update booking.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
