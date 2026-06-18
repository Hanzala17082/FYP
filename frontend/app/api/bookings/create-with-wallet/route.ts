import { NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/shared/lib/supabase/admin'
import { requireAuthenticatedUser } from '@/shared/lib/supabase/api-auth'
import { formatSupabaseError } from '@/shared/lib/supabase/format-error'
import { mapBookingRow } from '@/shared/lib/supabase/mappers'
import { getSiteOrigin } from '@/shared/lib/email/site-url'
import { sendBookingConfirmationEmail } from '@/shared/lib/email/send-booking-confirmation'
import { logger } from '@/shared/utils/logger'

const TRIP_EMBED = '*, agency:agencies(*, users(avatar_url))'
const BOOKING_SELECT = `*, trip:trips(${TRIP_EMBED}), traveler:users(*)`

export async function POST(request: Request) {
  try {
    const auth = await requireAuthenticatedUser()
    if (!auth.ok) return auth.response

    if (auth.user.role !== 'Traveler') {
      return NextResponse.json({ error: 'Only travelers can create bookings.' }, { status: 403 })
    }

    const body = await request.json()
    const tripId = String(body.tripId ?? '').trim()
    const startDate = String(body.startDate ?? '').trim()
    const endDate = String(body.endDate ?? '').trim()
    const numberOfTravelers = Number(body.numberOfTravelers)
    const specialRequests = body.specialRequests ? String(body.specialRequests).trim() : null

    if (!tripId || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'tripId, startDate, and endDate are required.' },
        { status: 400 }
      )
    }
    if (!Number.isInteger(numberOfTravelers) || numberOfTravelers < 1) {
      return NextResponse.json({ error: 'numberOfTravelers must be a positive integer.' }, { status: 400 })
    }

    const admin = createAdminSupabaseClient()
    const { ensureTravelerWallet } = await import('@/shared/lib/wallet/server')
    await ensureTravelerWallet(admin, auth.user.id)

    const { data: rpcData, error: rpcErr } = await admin.rpc('create_booking_with_wallet_debit', {
      p_traveler_id: auth.user.id,
      p_trip_id: tripId,
      p_start_date: startDate,
      p_end_date: endDate,
      p_number_of_travelers: numberOfTravelers,
      p_special_requests: specialRequests,
    })

    if (rpcErr) {
      const message = formatSupabaseError(rpcErr)
      const status = message.toLowerCase().includes('insufficient wallet balance') ? 402 : 400
      return NextResponse.json({ error: message }, { status })
    }

    const bookingId = String((rpcData as { booking_id?: string })?.booking_id ?? '')
    if (!bookingId) {
      return NextResponse.json({ error: 'Booking created but id missing.' }, { status: 500 })
    }

    const { data: row, error: fetchErr } = await admin
      .from('bookings')
      .select(BOOKING_SELECT)
      .eq('id', bookingId)
      .single()

    if (fetchErr || !row) {
      return NextResponse.json(
        { error: fetchErr ? formatSupabaseError(fetchErr) : 'Booking created but failed to load.' },
        { status: 500 }
      )
    }

    const booking = mapBookingRow(row as Record<string, unknown>)
    const totalAmount = Number((rpcData as { total_amount?: number })?.total_amount ?? 0)
    const newBalance = Number((rpcData as { new_balance?: number })?.new_balance ?? 0)
    const travelerEmail = auth.user.email || booking.traveler?.email || ''

    void sendBookingConfirmationEmail({
      booking,
      travelerEmail,
      totalAmount,
      newBalance,
      siteOrigin: getSiteOrigin(request),
    }).catch((err) => {
      logger.error('[booking-email]', err instanceof Error ? err.message : err)
    })

    return NextResponse.json({
      ok: true,
      data: {
        booking,
        newBalance,
        totalAmount,
      },
    })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to create booking.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
