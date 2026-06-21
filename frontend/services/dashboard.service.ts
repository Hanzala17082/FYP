import { createBrowserSupabaseClient } from '@/shared/lib/supabase/client'
import { formatSupabaseError } from '@/shared/lib/supabase/format-error'
import { mapAgencyRow, mapBookingRow } from '@/shared/lib/supabase/mappers'
import type { BookingDTO } from '@/types/api/bookings.types'
import type { TripDTO, AgencyDTO } from '@/types/api/trips.types'
import type { UserDTO } from '@/types/api/auth.types'

const TRIP_EMBED = '*, agency:agencies(*, users(avatar_url))'
const BOOKING_SELECT = `*, trip:trips(${TRIP_EMBED}), traveler:users(*)`

export interface TravelerDashboardStats {
  totalBookings: number
  upcomingCount: number
  pastCount: number
}

export interface TravelerDashboardResponse {
  stats: TravelerDashboardStats
  upcomingBookings: BookingDTO[]
  pastBookings: BookingDTO[]
}

export interface AgencyDashboardStats {
  totalTrips: number
  totalBookings: number
  pendingBookings: number
  confirmedBookings: number
}

export interface AgencyDashboardResponse {
  stats: AgencyDashboardStats
  recentBookings: BookingDTO[]
  agency: AgencyDTO
}

export interface AdminDashboardStats {
  totalUsers: number
  activeUsers: number
  newUsersThisMonth: number
  totalAgencies: number
  verifiedAgencies: number
  basicAgencies: number
  pendingVerifications: number
  totalTrips: number
  activeTrips: number
  upcomingTrips: number
  totalBookings: number
  revenue: number
  verificationFees: number
  tripListingFees: number
  newUsersToday: number
  tripsCreatedToday: number
  bookingsToday: number
  revenueToday: number
}

export type AgencyVerificationStatus = 'none' | 'pending_approval' | 'approved' | 'rejected'

export interface AdminDashboardResponse {
  stats: AdminDashboardStats
  recentUsers: UserDTO[]
  recentTrips: AdminTripSummary[]
}

export interface AdminTripSummary extends TripDTO {
  bookingCount: number
}

export interface AdminAgencySummary extends AgencyDTO {
  email: string
  tripCount: number
  joinedAt: string
  verificationStatus: AgencyVerificationStatus
}

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10)
}

export const dashboardService = {
  getTravelerDashboard: async (): Promise<TravelerDashboardResponse> => {
    const sb = createBrowserSupabaseClient()
    const {
      data: { session },
    } = await sb.auth.getSession()
    if (!session) throw new Error('Authentication required.')
    const uid = session.user.id
    const today = todayIsoDate()

    const { data: all, error } = await sb
      .from('bookings')
      .select(BOOKING_SELECT)
      .eq('traveler_id', uid)
      .order('start_date', { ascending: true })

    if (error) throw new Error(formatSupabaseError(error))
    const bookings = ((all ?? []) as Record<string, unknown>[]).map((r) => mapBookingRow(r))

    const upcoming = bookings.filter(
      (b) => b.startDate >= today && (b.status === 'pending' || b.status === 'confirmed')
    )
    const past = bookings.filter((b) => b.endDate < today || b.status === 'completed' || b.status === 'cancelled')

    return {
      stats: {
        totalBookings: bookings.length,
        upcomingCount: upcoming.length,
        pastCount: past.length,
      },
      upcomingBookings: upcoming.slice(0, 20),
      pastBookings: past.slice(0, 50),
    }
  },

  getAgencyDashboard: async (): Promise<AgencyDashboardResponse> => {
    const sb = createBrowserSupabaseClient()
    const {
      data: { session },
    } = await sb.auth.getSession()
    if (!session) throw new Error('Authentication required.')

    const { data: agRow, error: agErr } = await sb
      .from('agencies')
      .select('*, users(avatar_url)')
      .eq('user_id', session.user.id)
      .maybeSingle()
    if (agErr) throw new Error(formatSupabaseError(agErr))
    if (!agRow) throw new Error('Agency profile not found.')

    const agency = mapAgencyRow(agRow as Record<string, unknown>)
    const agencyId = agency.id

    const { count: tripCount } = await sb
      .from('trips')
      .select('*', { count: 'exact', head: true })
      .eq('agency_id', agencyId)

    const { data: tripIds } = await sb.from('trips').select('id').eq('agency_id', agencyId)
    const ids = (tripIds ?? []).map((t: { id: string }) => t.id)
    if (ids.length === 0) {
      return {
        stats: {
          totalTrips: 0,
          totalBookings: 0,
          pendingBookings: 0,
          confirmedBookings: 0,
        },
        recentBookings: [],
        agency,
      }
    }

    const { data: bookRows, error: bErr } = await sb
      .from('bookings')
      .select(BOOKING_SELECT)
      .in('trip_id', ids)
      .order('created_at', { ascending: false })
      .limit(50)

    if (bErr) throw new Error(formatSupabaseError(bErr))
    const bookings = ((bookRows ?? []) as Record<string, unknown>[]).map((r) => mapBookingRow(r))

    return {
      stats: {
        totalTrips: tripCount ?? 0,
        totalBookings: bookings.length,
        pendingBookings: bookings.filter((b) => b.status === 'pending').length,
        confirmedBookings: bookings.filter((b) => b.status === 'confirmed').length,
      },
      recentBookings: bookings.slice(0, 15),
      agency,
    }
  },

  getAdminDashboard: async (): Promise<AdminDashboardResponse> => {
    const sb = createBrowserSupabaseClient()
    const {
      data: { session },
    } = await sb.auth.getSession()
    if (!session?.access_token) throw new Error('Authentication required.')

    const res = await fetch('/api/admin/dashboard', {
      headers: { Authorization: `Bearer ${session.access_token}` },
      cache: 'no-store',
    })
    const body = (await res.json().catch(() => ({}))) as AdminDashboardResponse & { error?: string }
    if (!res.ok) throw new Error(body.error ?? 'Failed to load admin dashboard.')
    return body
  },
}
