import { Trip } from './trip.entity'
import { User } from './user.entity'

export interface Booking {
  id: string
  tripId: string
  trip: Trip
  travelerId: string
  traveler: User
  startDate: string
  endDate: string
  numberOfTravelers: number
  status: BookingStatus
  specialRequests?: string
  createdAt: string
  updatedAt: string
}

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed'
