import { apiClient } from '@/shared/lib/api-client'
import { TripDTO, TripListResponseDTO, TripFiltersDTO } from '@/types/api/trips.dto'
import { PaginationParams } from '@/types/api/common.type'

export const tripsService = {
  getTrips: async (filters?: TripFiltersDTO & PaginationParams) => {
    return apiClient.get<TripListResponseDTO>('/trips', { params: filters })
  },

  getTrip: async (slug: string) => {
    return apiClient.get<TripDTO>(`/trips/${slug}`)
  },

  getFeaturedTrips: async () => {
    return apiClient.get<TripDTO[]>('/trips/featured')
  },

  searchTrips: async (query: string, filters?: TripFiltersDTO) => {
    return apiClient.get<TripListResponseDTO>('/trips/search', {
      params: { q: query, ...filters },
    })
  },
}
