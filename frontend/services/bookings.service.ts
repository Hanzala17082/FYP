import { apiClient } from '@/shared/lib/api-client'
import {
  BookingRequestDTO,
  BookingDTO,
  BookingListResponseDTO,
} from '@/types/api/bookings.types'
import { PaginationParams } from '@/types/api/common.type'

export const bookingsService = {
  createBooking: async (data: BookingRequestDTO) => {
    return apiClient.post<BookingDTO>('/bookings', data)
  },

  getBookings: async (params?: PaginationParams & { traveler_id?: string }) => {
    return apiClient.get<BookingListResponseDTO>('/bookings', { params })
  },

  getBooking: async (id: string) => {
    return apiClient.get<BookingDTO>(`/bookings/${id}`)
  },

  updateBookingStatus: async (id: string, status: string) => {
    return apiClient.patch<BookingDTO>(`/bookings/${id}/status`, { status })
  },
}
