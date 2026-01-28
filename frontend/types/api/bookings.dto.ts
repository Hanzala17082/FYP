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
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  specialRequests?: string
  createdAt: string
  updatedAt: string
}

export interface BookingListResponseDTO {
  bookings: BookingDTO[]
  total: number
  page: number
  limit: number
}

import { TripDTO } from './trips.dto'
import { UserDTO } from './auth.dto'
