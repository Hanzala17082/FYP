import { apiClient } from '@/shared/lib/api-client'
import type { AgencyDTO, TripDTO, TripListResponseDTO } from '@/types/api/trips.types'
import type { PaginationParams } from '@/types/api/common.type'
import type { ReviewDTO } from '@/types/api/reviews.types'

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
  getAgencies: async (params?: PaginationParams) => {
    return apiClient.get<AgencyListResponseDTO>('/agencies', { params })
  },

  getAgency: async (idOrSlug: string) => {
    return apiClient.get<AgencyDTO>(`/agencies/${encodeURIComponent(idOrSlug)}`)
  },

  getAgencyTrips: async (idOrSlug: string, params?: PaginationParams) => {
    return apiClient.get<{ trips: TripDTO[]; total: number; page: number; limit: number }>(
      `/agencies/${encodeURIComponent(idOrSlug)}/trips`,
      { params }
    )
  },

  getAgencyReviews: async (idOrSlug: string, params?: PaginationParams) => {
    return apiClient.get<ReviewListResponseDTO>(
      `/agencies/${encodeURIComponent(idOrSlug)}/reviews`,
      { params }
    )
  },
}
