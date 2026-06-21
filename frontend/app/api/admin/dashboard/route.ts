import { NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/shared/lib/supabase/admin'
import { requireAuthenticatedUser } from '@/shared/lib/supabase/api-auth'
import { mapAgencyRow, mapTripRow, mapUserRow } from '@/shared/lib/supabase/mappers'

const RECENT_TRIP_SELECT =
  'id, title, slug, price, status, created_at, agency:agencies(id, agency_name, agency_slug, logo_url, verified, rating, review_count, users(avatar_url))'

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10)
}

function startOfTodayIso(): string {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d.toISOString()
}

function monthStartIso(): string {
  const d = new Date()
  d.setDate(1)
  d.setHours(0, 0, 0, 0)
  return d.toISOString()
}

export async function GET() {
  const auth = await requireAuthenticatedUser()
  if (!auth.ok) return auth.response
  if (auth.user.role !== 'Admin') {
    return NextResponse.json({ error: 'Forbidden.' }, { status: 403 })
  }

  const admin = createAdminSupabaseClient()
  const today = todayIsoDate()
  const todayStart = startOfTodayIso()
  const monthStart = monthStartIso()

  const [
    usersCount,
    activeUsersCount,
    agenciesCount,
    tripsCount,
    activeTripsCount,
    upcomingTripsCount,
    bookingsCount,
    verifiedAgenciesCount,
    pendingVerificationsCount,
    newUsersMonthCount,
    newUsersTodayCount,
    tripsTodayCount,
    bookingsTodayCount,
    usersData,
    tripsData,
    bookingsData,
    platformFeesData,
  ] = await Promise.all([
    admin.from('users').select('*', { count: 'exact', head: true }),
    admin.from('users').select('*', { count: 'exact', head: true }).eq('is_active', true),
    admin.from('agencies').select('*', { count: 'exact', head: true }),
    admin.from('trips').select('*', { count: 'exact', head: true }),
    admin.from('trips').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    admin.from('trips').select('*', { count: 'exact', head: true }).gt('start_date', today),
    admin.from('bookings').select('*', { count: 'exact', head: true }),
    admin.from('agencies').select('*', { count: 'exact', head: true }).eq('verified', true),
    admin.from('agencies').select('*', { count: 'exact', head: true }).eq('verification_status', 'pending_approval'),
    admin.from('users').select('*', { count: 'exact', head: true }).gte('created_at', monthStart),
    admin.from('users').select('*', { count: 'exact', head: true }).gte('created_at', todayStart),
    admin.from('trips').select('*', { count: 'exact', head: true }).gte('created_at', todayStart),
    admin.from('bookings').select('*', { count: 'exact', head: true }).gte('created_at', todayStart),
    admin.from('users').select('id, email, full_name, role, city, avatar_url, created_at').order('created_at', { ascending: false }).limit(3),
    admin.from('trips').select(RECENT_TRIP_SELECT).order('created_at', { ascending: false }).limit(3),
    admin.from('bookings').select('trip_id'),
    admin.from('platform_fees').select('fee_type, amount, created_at'),
  ])

  const bookings = bookingsData.data ?? []

  const todayStartMs = new Date(todayStart).getTime()
  const fees = platformFeesData.data ?? []
  const revenue = fees.reduce((sum, f) => sum + Number(f.amount ?? 0), 0)
  const verificationFees = fees
    .filter((f) => String(f.fee_type) === 'verification')
    .reduce((sum, f) => sum + Number(f.amount ?? 0), 0)
  const tripListingFees = fees
    .filter((f) => String(f.fee_type) === 'trip_listing')
    .reduce((sum, f) => sum + Number(f.amount ?? 0), 0)
  const revenueToday = fees
    .filter((f) => {
      const ts = new Date(String(f.created_at ?? '')).getTime()
      return !Number.isNaN(ts) && ts >= todayStartMs
    })
    .reduce((sum, f) => sum + Number(f.amount ?? 0), 0)

  const bookingCountByTrip = new Map<string, number>()
  for (const b of bookings) {
    const tripId = String(b.trip_id ?? '')
    if (tripId) bookingCountByTrip.set(tripId, (bookingCountByTrip.get(tripId) ?? 0) + 1)
  }

  const totalAgenciesNum = agenciesCount.count ?? 0
  const verifiedNum = verifiedAgenciesCount.count ?? 0
  const pendingNum = pendingVerificationsCount.count ?? 0

  const recentUsers = (usersData.data ?? []).map((r) => mapUserRow(r as Record<string, unknown>))
  const recentTrips = (tripsData.data ?? []).map((r) => {
    const dto = mapTripRow(r as Record<string, unknown>, false)
    return { ...dto, bookingCount: bookingCountByTrip.get(dto.id) ?? 0 }
  })

  return NextResponse.json({
    stats: {
      totalUsers: usersCount.count ?? 0,
      activeUsers: activeUsersCount.count ?? 0,
      newUsersThisMonth: newUsersMonthCount.count ?? 0,
      totalTrips: tripsCount.count ?? 0,
      activeTrips: activeTripsCount.count ?? 0,
      upcomingTrips: upcomingTripsCount.count ?? 0,
      totalAgencies: totalAgenciesNum,
      verifiedAgencies: verifiedNum,
      basicAgencies: Math.max(0, totalAgenciesNum - verifiedNum - pendingNum),
      pendingVerifications: pendingNum,
      totalBookings: bookingsCount.count ?? 0,
      revenue,
      verificationFees,
      tripListingFees,
      newUsersToday: newUsersTodayCount.count ?? 0,
      tripsCreatedToday: tripsTodayCount.count ?? 0,
      bookingsToday: bookingsTodayCount.count ?? 0,
      revenueToday,
    },
    recentUsers,
    recentTrips,
  })
}
