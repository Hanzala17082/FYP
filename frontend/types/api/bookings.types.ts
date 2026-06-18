/**
 * Booking-related API types. Data comes from the API, which reads/writes Supabase.
 */
import { TripDTO } from './trips.types'
import { UserDTO } from './auth.types'

export interface BookingRequestDTO {
  tripId: string
  startDate: string
  endDate: string
  numberOfTravelers: number
  specialRequests?: string
}

export interface BookingDTO {
  id: string
  trip: TripDTO
  traveler: UserDTO
  startDate: string
  endDate: string
  numberOfTravelers: number
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'rejected'
  specialRequests?: string
  totalAmount?: number
  paymentStatus?: 'paid' | 'refunded'
  createdAt: string
  updatedAt: string
}

export interface BookingListResponseDTO {
  bookings: BookingDTO[]
  total: number
  page: number
  limit: number
}
