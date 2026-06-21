import { NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/shared/lib/supabase/admin'
import { requireAuthenticatedUser } from '@/shared/lib/supabase/api-auth'
import { formatSupabaseError } from '@/shared/lib/supabase/format-error'
import { mapTripRow, slugifyTitle } from '@/shared/lib/supabase/mappers'
import { TRIP_LISTING_FEE_PKR } from '@/config/fees'
import type { CreateTripRequestDTO } from '@/types/api/trips.types'

const SELECT_DETAIL =
  '*, agency:agencies(*, users(avatar_url)), trip_highlights(*), trip_schedules(*, trip_schedule_activities(*)), trip_recreational_activities(*)'

function activityTimeSql(timeStr: string): string {
  const parts = timeStr.split(':').map((p) => p.trim())
  const h = Number(parts[0] ?? 0)
  const m = Number(parts[1] ?? 0)
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`
}

type Admin = ReturnType<typeof createAdminSupabaseClient>

async function resolveAgency(
  admin: Admin,
  role: string,
  userId: string,
  agencyId?: string
): Promise<{ agencyId: string; agencyUserId: string }> {
  if (role === 'Agency') {
    const { data: ag } = await admin
      .from('agencies')
      .select('id, user_id')
      .eq('user_id', userId)
      .maybeSingle()
    if (!ag) throw new Error('Agency profile not found.')
    return { agencyId: String(ag.id), agencyUserId: String(ag.user_id) }
  }
  if (role === 'Admin') {
    if (!agencyId) throw new Error('Admin must provide agencyId when creating a trip.')
    const { data: ag } = await admin
      .from('agencies')
      .select('id, user_id')
      .eq('id', agencyId)
      .maybeSingle()
    if (!ag) throw new Error('Agency not found.')
    return { agencyId: String(ag.id), agencyUserId: String(ag.user_id) }
  }
  throw new Error('Only Agency or Admin can create trips.')
}

export async function POST(request: Request) {
  const auth = await requireAuthenticatedUser()
  if (!auth.ok) return auth.response

  if (auth.user.role !== 'Agency' && auth.user.role !== 'Admin') {
    return NextResponse.json({ error: 'Only Agency or Admin can create trips.' }, { status: 403 })
  }

  try {
    const data = (await request.json()) as CreateTripRequestDTO

    if (!data.title || !data.destination || !data.startDate || !data.endDate) {
      return NextResponse.json(
        { error: 'Title, destination, start date and end date are required.' },
        { status: 400 }
      )
    }

    const admin = createAdminSupabaseClient()
    const { agencyId, agencyUserId } = await resolveAgency(
      admin,
      auth.user.role,
      auth.user.id,
      data.agencyId
    )

    // Pre-check the agency wallet so we never create a trip we cannot charge for.
    const { data: wallet } = await admin
      .from('wallets')
      .select('balance')
      .eq('user_id', agencyUserId)
      .eq('wallet_type', 'agency')
      .maybeSingle()

    if (!wallet || Number(wallet.balance) < TRIP_LISTING_FEE_PKR) {
      return NextResponse.json(
        {
          error: `Insufficient wallet balance. A Rs ${TRIP_LISTING_FEE_PKR.toLocaleString()} listing fee is required to post a trip.`,
        },
        { status: 402 }
      )
    }

    const tripId = crypto.randomUUID()
    const slug = `${slugifyTitle(data.title)}-${tripId.slice(0, 8)}`

    const payload = {
      id: tripId,
      agency_id: agencyId,
      title: data.title,
      slug,
      description: data.description ?? '',
      short_description: (data.shortDescription || data.title).slice(0, 500),
      destination: data.destination ?? '',
      price: data.price,
      duration_days: data.duration,
      images: data.images ?? [],
      rating: 0,
      review_count: 0,
      available_dates: data.availableDates ?? [],
      start_date: data.startDate,
      end_date: data.endDate,
      status: 'pending',
      tags: data.tags ?? [],
    }

    const { error: tripErr } = await admin.from('trips').insert(payload)
    if (tripErr) throw new Error(formatSupabaseError(tripErr))

    let sortOrder = 0
    for (const text of data.highlights ?? []) {
      const { error } = await admin.from('trip_highlights').insert({
        id: crypto.randomUUID(),
        trip_id: tripId,
        text,
        sort_order: sortOrder++,
      })
      if (error) throw new Error(formatSupabaseError(error))
    }

    for (const s of data.schedule ?? []) {
      const schId = crypto.randomUUID()
      const { error: schErr } = await admin.from('trip_schedules').insert({
        id: schId,
        trip_id: tripId,
        day: s.day ?? 0,
        date: s.date,
        title: s.title ?? '',
      })
      if (schErr) throw new Error(formatSupabaseError(schErr))
      for (const a of s.activities ?? []) {
        const { error: actErr } = await admin.from('trip_schedule_activities').insert({
          id: crypto.randomUUID(),
          schedule_id: schId,
          time: activityTimeSql(a.time || '00:00'),
          activity: a.activity ?? '',
        })
        if (actErr) throw new Error(formatSupabaseError(actErr))
      }
    }

    let rSort = 0
    for (const r of data.recreationalActivities ?? []) {
      const { error: recErr } = await admin.from('trip_recreational_activities').insert({
        id: crypto.randomUUID(),
        trip_id: tripId,
        name: r.name ?? '',
        description: r.description ?? '',
        duration: r.duration ?? '',
        included: r.included ?? false,
        additional_cost: r.additionalCost ?? null,
        sort_order: rSort++,
      })
      if (recErr) throw new Error(formatSupabaseError(recErr))
    }

    // Charge the listing fee. Balance was pre-checked, so this should succeed.
    const { error: feeErr } = await admin.rpc('pay_agency_platform_fee', {
      p_agency_user_id: agencyUserId,
      p_amount: TRIP_LISTING_FEE_PKR,
      p_fee_type: 'trip_listing',
      p_trip_id: tripId,
    })
    if (feeErr) {
      await admin.from('trips').delete().eq('id', tripId)
      return NextResponse.json(
        { error: 'Could not charge the listing fee. Please try again.' },
        { status: 402 }
      )
    }

    const { data: row, error: fetchErr } = await admin
      .from('trips')
      .select(SELECT_DETAIL)
      .eq('id', tripId)
      .single()

    if (fetchErr || !row) {
      throw new Error(fetchErr ? formatSupabaseError(fetchErr) : 'Trip created but failed to load.')
    }

    return NextResponse.json({ trip: mapTripRow(row as Record<string, unknown>, true) })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to create trip.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
