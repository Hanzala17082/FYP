import { createBrowserSupabaseClient } from '@/shared/lib/supabase/client'
import { formatSupabaseError } from '@/shared/lib/supabase/format-error'
import { ok } from '@/shared/lib/supabase/response'
import { mapAgencyRow, mapTripRow, mapReviewRow } from '@/shared/lib/supabase/mappers'
import type { AgencyDTO, TripDTO, TripListResponseDTO } from '@/types/api/trips.types'
import type { PaginationParams } from '@/types/api/common.type'
import type { ReviewDTO } from '@/types/api/reviews.types'
import type { ApiResponse } from '@/types/api/common.type'

const AGENCY_SELECT = '*, users(avatar_url)'

function isUuid(s: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s)
}

export interface AgencyListResponseDTO {
  agencies: AgencyDTO[]
  total: number
  page: number
  limit: number
}

export interface ReviewListResponseDTO {
  reviews: ReviewDTO[]
  total: number
  page: number
  limit: number
}

export const agenciesService = {
  getAgencies: async (params?: PaginationParams): Promise<ApiResponse<AgencyListResponseDTO>> => {
    const sb = createBrowserSupabaseClient()
    const page = Math.max(1, params?.page ?? 1)
    const limit = Math.min(100, Math.max(1, params?.limit ?? 50))
    const start = (page - 1) * limit
    const end = start + limit - 1

    const { data, error, count } = await sb
      .from('agencies')
      .select(AGENCY_SELECT, { count: 'exact' })
      .order('agency_name')
      .range(start, end)

    if (error) throw new Error(formatSupabaseError(error))
    const rows = (data ?? []) as Record<string, unknown>[]
    const total = count ?? rows.length

    return ok({
      agencies: rows.map((r) => mapAgencyRow(r)),
      total,
      page,
      limit,
    })
  },

  getAgency: async (idOrSlug: string): Promise<ApiResponse<AgencyDTO>> => {
    const sb = createBrowserSupabaseClient()
    let row: Record<string, unknown> | null = null

    if (isUuid(idOrSlug)) {
      const { data, error } = await sb.from('agencies').select(AGENCY_SELECT).eq('id', idOrSlug).maybeSingle()
      if (error) throw new Error(formatSupabaseError(error))
      row = data as Record<string, unknown> | null
    }
    if (!row) {
      const { data, error } = await sb
        .from('agencies')
        .select(AGENCY_SELECT)
        .eq('agency_slug', idOrSlug)
        .maybeSingle()
      if (error) throw new Error(formatSupabaseError(error))
      row = data as Record<string, unknown> | null
    }

    if (!row) throw new Error('Agency not found.')
    return ok(mapAgencyRow(row))
  },

  getAgencyTrips: async (
    idOrSlug: string,
    params?: PaginationParams
  ): Promise<ApiResponse<{ trips: TripDTO[]; total: number; page: number; limit: number }>> => {
    const sb = createBrowserSupabaseClient()
    let agencyId = idOrSlug
    if (!isUuid(idOrSlug)) {
      const { data: ag } = await sb.from('agencies').select('id').eq('agency_slug', idOrSlug).maybeSingle()
      if (!ag) throw new Error('Agency not found.')
      agencyId = String((ag as { id: string }).id)
    }

    const page = Math.max(1, params?.page ?? 1)
    const limit = Math.min(100, Math.max(1, params?.limit ?? 12))
    const start = (page - 1) * limit
    const end = start + limit - 1

    const TRIP_SEL = '*, agency:agencies(*, users(avatar_url))'

    const { data, error, count } = await sb
      .from('trips')
      .select(TRIP_SEL, { count: 'exact' })
      .eq('agency_id', agencyId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .range(start, end)

    if (error) throw new Error(formatSupabaseError(error))
    const rows = (data ?? []) as Record<string, unknown>[]
    const total = count ?? rows.length

    return ok({
      trips: rows.map((r) => mapTripRow(r, false)),
      total,
      page,
      limit,
    })
  },

  getAgencyReviews: async (
    idOrSlug: string,
    params?: PaginationParams
  ): Promise<ApiResponse<ReviewListResponseDTO>> => {
    const sb = createBrowserSupabaseClient()
    let agencyId = idOrSlug
    if (!isUuid(idOrSlug)) {
      const { data: ag } = await sb.from('agencies').select('id').eq('agency_slug', idOrSlug).maybeSingle()
      if (!ag) throw new Error('Agency not found.')
      agencyId = String((ag as { id: string }).id)
    }

    const page = Math.max(1, params?.page ?? 1)
    const limit = Math.min(100, Math.max(1, params?.limit ?? 20))
    const start = (page - 1) * limit
    const end = start + limit - 1

    const { data, error, count } = await sb
      .from('reviews')
      .select('*, users(*)', { count: 'exact' })
      .eq('agency_id', agencyId)
      .order('created_at', { ascending: false })
      .range(start, end)

    if (error) throw new Error(formatSupabaseError(error))
    const rows = (data ?? []) as Record<string, unknown>[]
    return ok({
      reviews: rows.map((r) => mapReviewRow(r)),
      total: count ?? rows.length,
      page,
      limit,
    })
  },
}
