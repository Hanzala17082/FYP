import type { UserDTO } from '@/types/api/auth.types'
import type { BookingDTO } from '@/types/api/bookings.types'
import type { ReviewDTO } from '@/types/api/reviews.types'
import type { AgencyDTO, TripDTO, TripScheduleDTO } from '@/types/api/trips.types'

export function mapUserRow(row: Record<string, unknown>): UserDTO {
  return {
    id: String(row.id),
    email: String(row.email ?? ''),
    fullName: String(row.full_name ?? ''),
    role: row.role as UserDTO['role'],
    city: row.city ? String(row.city) : undefined,
    avatar: row.avatar_url ? String(row.avatar_url) : undefined,
    createdAt: row.created_at ? String(row.created_at) : '',
  }
}

export function mapAgencyRow(row: Record<string, unknown>, userAvatar?: string | null): AgencyDTO {
  const nestedUser = row.users as Record<string, unknown> | Record<string, unknown>[] | null | undefined
  const u = Array.isArray(nestedUser) ? nestedUser[0] : nestedUser
  const avatar =
    userAvatar ??
    (u?.avatar_url ? String(u.avatar_url) : undefined) ??
    (row.logo_url ? String(row.logo_url) : '')
  return {
    id: String(row.id),
    name: String(row.agency_name ?? ''),
    slug: String(row.agency_slug ?? ''),
    description: row.description ? String(row.description) : '',
    logo: row.logo_url ? String(row.logo_url) : '',
    rating: Number(row.rating ?? 0),
    reviewCount: Number(row.review_count ?? 0),
    location: row.location ? String(row.location) : '',
    verified: Boolean(row.verified),
    avatar,
  }
}

function formatTime(t: unknown): string {
  if (t == null) return '00:00'
  const s = String(t)
  if (s.length >= 5 && s.includes(':')) return s.slice(0, 5)
  return s
}

export function mapTripRow(row: Record<string, unknown>, includeSchedule = false): TripDTO {
  const agencyRaw = row.agency ?? row.agencies
  const agencyObj = Array.isArray(agencyRaw) ? agencyRaw[0] : agencyRaw
  const agency = agencyObj
    ? mapAgencyRow(agencyObj as Record<string, unknown>)
    : ({
        id: '',
        name: '',
        slug: '',
        description: '',
        logo: '',
        rating: 0,
        reviewCount: 0,
        location: '',
        verified: false,
      } satisfies AgencyDTO)

  const trip: TripDTO = {
    id: String(row.id),
    title: String(row.title ?? ''),
    slug: String(row.slug ?? ''),
    description: String(row.description ?? ''),
    shortDescription: String(row.short_description ?? ''),
    destination: String(row.destination ?? ''),
    price: Number(row.price ?? 0),
    duration: Number(row.duration_days ?? 0),
    images: Array.isArray(row.images) ? (row.images as string[]) : [],
    agency,
    rating: Number(row.rating ?? 0),
    reviewCount: Number(row.review_count ?? 0),
    availableDates: Array.isArray(row.available_dates)
      ? (row.available_dates as string[])
      : [],
    startDate: row.start_date ? String(row.start_date) : '',
    endDate: row.end_date ? String(row.end_date) : '',
    status: row.status as TripDTO['status'],
    tags: Array.isArray(row.tags) ? (row.tags as string[]) : [],
    createdAt: row.created_at ? String(row.created_at) : '',
    updatedAt: row.updated_at ? String(row.updated_at) : '',
  }

  if (!includeSchedule) return trip

  const hl = row.trip_highlights as Record<string, unknown>[] | undefined
  trip.highlights = Array.isArray(hl)
    ? hl.sort((a, b) => Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0)).map((x) => String(x.text ?? ''))
    : []

  const schedulesRaw = row.trip_schedules as Record<string, unknown>[] | undefined
  const schedule: TripScheduleDTO[] = []
  if (Array.isArray(schedulesRaw)) {
    const sorted = [...schedulesRaw].sort((a, b) => Number(a.day ?? 0) - Number(b.day ?? 0))
    for (const s of sorted) {
      const acts = (s.trip_schedule_activities as Record<string, unknown>[]) || []
      const sortedActs = [...acts].sort((a, b) => String(a.id).localeCompare(String(b.id)))
      schedule.push({
        day: Number(s.day ?? 0),
        date: s.date ? String(s.date) : '',
        title: String(s.title ?? ''),
        activities: sortedActs.map((a) => ({
          time: formatTime(a.time),
          activity: String(a.activity ?? ''),
        })),
      })
    }
  }
  trip.schedule = schedule

  const rec = row.trip_recreational_activities as Record<string, unknown>[] | undefined
  trip.recreationalActivities = Array.isArray(rec)
    ? [...rec]
        .sort((a, b) => Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0))
        .map((r) => ({
          name: String(r.name ?? ''),
          description: String(r.description ?? ''),
          duration: String(r.duration ?? ''),
          included: Boolean(r.included),
          additionalCost:
            r.additional_cost != null && r.additional_cost !== ''
              ? Number(r.additional_cost)
              : undefined,
        }))
    : []

  return trip
}

export function mapBookingRow(row: Record<string, unknown>): BookingDTO {
  const tripRaw = row.trip ?? row.trips
  const tripObj = Array.isArray(tripRaw) ? tripRaw[0] : tripRaw
  const travelerRaw = row.traveler ?? row.users
  const travelerObj = Array.isArray(travelerRaw) ? travelerRaw[0] : travelerRaw

  return {
    id: String(row.id),
    trip: tripObj ? mapTripRow(tripObj as Record<string, unknown>, false) : ({} as TripDTO),
    traveler: travelerObj ? mapUserRow(travelerObj as Record<string, unknown>) : ({} as UserDTO),
    startDate: row.start_date ? String(row.start_date) : '',
    endDate: row.end_date ? String(row.end_date) : '',
    numberOfTravelers: Number(row.number_of_travelers ?? 0),
    status: row.status as BookingDTO['status'],
    specialRequests: row.special_requests ? String(row.special_requests) : undefined,
    createdAt: row.created_at ? String(row.created_at) : '',
    updatedAt: row.updated_at ? String(row.updated_at) : '',
  }
}

export function mapReviewRow(row: Record<string, unknown>): ReviewDTO {
  const travelerRaw = row.traveler ?? row.users
  const travelerObj = Array.isArray(travelerRaw) ? travelerRaw[0] : travelerRaw
  return {
    id: String(row.id),
    tripId: row.trip_id ? String(row.trip_id) : undefined,
    agencyId: row.agency_id ? String(row.agency_id) : undefined,
    traveler: travelerObj ? mapUserRow(travelerObj as Record<string, unknown>) : ({} as UserDTO),
    rating: Number(row.rating ?? 0),
    comment: String(row.comment ?? ''),
    createdAt: row.created_at ? String(row.created_at) : '',
    updatedAt: row.updated_at ? String(row.updated_at) : '',
  }
}

export function slugifyTitle(title: string): string {
  const s = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48)
  return s || 'trip'
}
