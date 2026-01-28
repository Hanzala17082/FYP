import { apiClient } from '@/shared/lib/api-client'
import {
  BookingRequestDTO,
  BookingDTO,
  BookingListResponseDTO,
} from '@/types/api/bookings.dto'
import { PaginationParams } from '@/types/api/common.type'

export const bookingsService = {
  createBooking: async (data: BookingRequestDTO) => {
    return apiClient.post<BookingDTO>('/bookings', data)
  },

  getBookings: async (params?: PaginationParams) => {
    return apiClient.get<BookingListResponseDTO>('/bookings', { params })
  },

  getBooking: async (id: string) => {
    return apiClient.get<BookingDTO>(`/bookings/${id}`)
  },

  updateBookingStatus: async (id: string, status: string) => {
    return apiClient.patch<BookingDTO>(`/bookings/${id}/status`, { status })
  },
}
