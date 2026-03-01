import { apiClient } from '@/shared/lib/api-client'
import {
  TripDTO,
  TripListResponseDTO,
  TripFiltersDTO,
  CreateTripRequestDTO,
} from '@/types/api/trips.types'
import { PaginationParams } from '@/types/api/common.type'

/** Optional request config (e.g. signal for AbortController). */
export interface GetTripsConfig {
  signal?: AbortSignal
}

export const tripsService = {
  getTrips: async (
    filters?: TripFiltersDTO & PaginationParams,
    config?: GetTripsConfig
  ) => {
    return apiClient.get<TripListResponseDTO>('/trips', {
      params: filters,
      ...(config?.signal != null && { signal: config.signal }),
    })
  },

  getTrip: async (slug: string) => {
    return apiClient.get<TripDTO>(`/trips/${encodeURIComponent(slug)}`)
  },

  getFeaturedTrips: async () => {
    return apiClient.get<TripDTO[]>('/trips/featured')
  },

  searchTrips: async (query: string, filters?: TripFiltersDTO) => {
    return apiClient.get<TripListResponseDTO>('/trips/search', {
      params: { q: query, ...filters },
    })
  },

  createTrip: async (data: CreateTripRequestDTO) => {
    return apiClient.post<TripDTO>('/trips', data)
  },
}
