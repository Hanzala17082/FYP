import { createBrowserSupabaseClient } from '@/shared/lib/supabase/client'
import { formatSupabaseError } from '@/shared/lib/supabase/format-error'
import { ok } from '@/shared/lib/supabase/response'
import {
  mapTripRow,
  slugifyTitle,
} from '@/shared/lib/supabase/mappers'
import type {
  TripDTO,
  TripListResponseDTO,
  TripFiltersDTO,
  CreateTripRequestDTO,
} from '@/types/api/trips.types'
import type { PaginationParams } from '@/types/api/common.type'
import type { ApiResponse } from '@/types/api/common.type'

const SELECT_LIST =
  '*, agency:agencies(*, users(avatar_url))'

const SELECT_DETAIL =
  '*, agency:agencies(*, users(avatar_url)), trip_highlights(*), trip_schedules(*, trip_schedule_activities(*)), trip_recreational_activities(*)'

function parseUuid(slugOrUuid: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(slugOrUuid)
}

async function resolveAgencyIdForTrip(sb: ReturnType<typeof createBrowserSupabaseClient>, agencyId?: string) {
  const {
    data: { session },
  } = await sb.auth.getSession()
  if (!session) throw new Error('Authentication required.')
  const { data: me } = await sb.from('users').select('id, role').eq('id', session.user.id).single()
  if (!me) throw new Error('Profile not found.')

  const role = me.role as string
  if (role === 'Agency') {
    const { data: ag } = await sb.from('agencies').select('id').eq('user_id', session.user.id).maybeSingle()
    if (!ag) throw new Error('Agency profile not found.')
    return String((ag as { id: string }).id)
  }
  if (role === 'Admin') {
    if (!agencyId) throw new Error('Admin must provide agencyId when creating a trip.')
    return agencyId
  }
  throw new Error('Only Agency or Admin can create trips.')
}

function activityTimeSql(timeStr: string): string {
  const parts = timeStr.split(':').map((p) => p.trim())
  const h = Number(parts[0] ?? 0)
  const m = Number(parts[1] ?? 0)
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`
}

/** Optional request config (e.g. signal for AbortController). */
export interface GetTripsConfig {
  signal?: AbortSignal
}

export const tripsService = {
  getTrips: async (
    filters?: TripFiltersDTO & PaginationParams,
    config?: GetTripsConfig
  ): Promise<ApiResponse<TripListResponseDTO>> => {
    const sb = createBrowserSupabaseClient()
    const page = Math.max(1, filters?.page ?? 1)
    const limit = Math.min(100, Math.max(1, filters?.limit ?? 12))
    const start = (page - 1) * limit
    const end = start + limit - 1

    let q = sb.from('trips').select(SELECT_LIST, { count: 'exact' }).eq('status', 'active')

    if (filters?.destination) q = q.ilike('destination', `%${filters.destination}%`)
    if (filters?.minPrice != null) q = q.gte('price', filters.minPrice)
    if (filters?.maxPrice != null) q = q.lte('price', filters.maxPrice)
    if (filters?.duration != null) q = q.eq('duration_days', filters.duration)
    if (filters?.agencyId) q = q.eq('agency_id', filters.agencyId)
    if (filters?.startDate) q = q.gte('start_date', filters.startDate)
    if (filters?.endDate) q = q.lte('end_date', filters.endDate)

    const sortBy = filters?.sortBy ?? 'date'
    const order = filters?.sortOrder === 'asc'
    if (sortBy === 'price') q = q.order('price', { ascending: order })
    else if (sortBy === 'rating') q = q.order('rating', { ascending: order })
    else if (sortBy === 'popularity') q = q.order('review_count', { ascending: false })
    else q = q.order('start_date', { ascending: order })

    q = q.range(start, end)

    const { data, error, count } = await q
    if (error) throw new Error(formatSupabaseError(error))
    const rows = (data ?? []) as Record<string, unknown>[]
    const total = count ?? rows.length
    const totalPages = Math.ceil(total / limit) || 1

    return ok({
      trips: rows.map((r) => mapTripRow(r, false)),
      total,
      page,
      limit,
      totalPages,
    })
  },

  getTrip: async (slug: string): Promise<ApiResponse<TripDTO>> => {
    const sb = createBrowserSupabaseClient()
    let row: Record<string, unknown> | null = null

    if (parseUuid(slug)) {
      const { data, error } = await sb.from('trips').select(SELECT_DETAIL).eq('id', slug).maybeSingle()
      if (error) throw new Error(formatSupabaseError(error))
      row = data as Record<string, unknown> | null
    }
    if (!row) {
      const { data, error } = await sb.from('trips').select(SELECT_DETAIL).eq('slug', slug).maybeSingle()
      if (error) throw new Error(formatSupabaseError(error))
      row = data as Record<string, unknown> | null
    }

    if (!row) throw new Error('Trip not found.')
    return ok(mapTripRow(row, true))
  },

  getFeaturedTrips: async (): Promise<ApiResponse<TripDTO[]>> => {
    const sb = createBrowserSupabaseClient()
    const { data, error } = await sb
      .from('trips')
      .select(SELECT_LIST)
      .eq('status', 'active')
      .order('rating', { ascending: false })
      .order('review_count', { ascending: false })
      .limit(10)

    if (error) throw new Error(formatSupabaseError(error))
    const rows = (data ?? []) as Record<string, unknown>[]
    return ok(rows.map((r) => mapTripRow(r, false)))
  },

  searchTrips: async (query: string, filters?: TripFiltersDTO): Promise<ApiResponse<TripListResponseDTO>> => {
    const sb = createBrowserSupabaseClient()
    const page = Math.max(1, filters?.page ?? 1)
    const limit = Math.min(100, Math.max(1, filters?.limit ?? 12))
    const start = (page - 1) * limit
    const end = start + limit - 1
    const qStr = query.trim()

    let qb = sb.from('trips').select(SELECT_LIST, { count: 'exact' }).eq('status', 'active')
    if (qStr) {
      qb = qb.or(
        `title.ilike.%${qStr}%,destination.ilike.%${qStr}%,description.ilike.%${qStr}%,short_description.ilike.%${qStr}%`
      )
    }
    if (filters?.destination) qb = qb.ilike('destination', `%${filters.destination}%`)
    if (filters?.minPrice != null) qb = qb.gte('price', filters.minPrice)
    if (filters?.maxPrice != null) qb = qb.lte('price', filters.maxPrice)
    if (filters?.agencyId) qb = qb.eq('agency_id', filters.agencyId)

    const sortBy = filters?.sortBy ?? 'date'
    const order = filters?.sortOrder === 'asc'
    if (sortBy === 'price') qb = qb.order('price', { ascending: order })
    else if (sortBy === 'rating') qb = qb.order('rating', { ascending: order })
    else qb = qb.order('start_date', { ascending: order })

    qb = qb.range(start, end)

    const { data, error, count } = await qb
    if (error) throw new Error(formatSupabaseError(error))
    const rows = (data ?? []) as Record<string, unknown>[]
    const total = count ?? rows.length

    return ok({
      trips: rows.map((r) => mapTripRow(r, false)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    })
  },

  createTrip: async (data: CreateTripRequestDTO): Promise<ApiResponse<TripDTO>> => {
    const sb = createBrowserSupabaseClient()
    const agencyId = await resolveAgencyIdForTrip(sb, data.agencyId)

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

    const { error: tripErr } = await sb.from('trips').insert(payload)
    if (tripErr) throw new Error(formatSupabaseError(tripErr))

    let sortOrder = 0
    for (const text of data.highlights ?? []) {
      const { error } = await sb.from('trip_highlights').insert({
        id: crypto.randomUUID(),
        trip_id: tripId,
        text,
        sort_order: sortOrder++,
      })
      if (error) throw new Error(formatSupabaseError(error))
    }

    for (const s of data.schedule ?? []) {
      const schId = crypto.randomUUID()
      const { error: schErr } = await sb.from('trip_schedules').insert({
        id: schId,
        trip_id: tripId,
        day: s.day ?? 0,
        date: s.date,
        title: s.title ?? '',
      })
      if (schErr) throw new Error(formatSupabaseError(schErr))
      for (const a of s.activities ?? []) {
        const { error: actErr } = await sb.from('trip_schedule_activities').insert({
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
      const { error: recErr } = await sb.from('trip_recreational_activities').insert({
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

    const { data: row, error: fetchErr } = await sb
      .from('trips')
      .select(SELECT_DETAIL)
      .eq('id', tripId)
      .single()

    if (fetchErr || !row) throw new Error(fetchErr ? formatSupabaseError(fetchErr) : 'Trip created but failed to load.')
    return ok(mapTripRow(row as Record<string, unknown>, true))
  },
}
