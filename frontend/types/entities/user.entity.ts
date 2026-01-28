export type UserRole = 'Traveler' | 'Agency' | 'Admin'

export interface User {
  id: string
  email: string
  fullName: string
  role: UserRole
  city?: string
  avatar?: string
  createdAt: string
  updatedAt: string
}

export interface Traveler extends User {
  role: 'Traveler'
  bookings?: Booking[]
  wishlist?: Trip[]
}

export interface Agency extends User {
  role: 'Agency'
  agencyName: string
  agencySlug: string
  verified: boolean
  trips?: Trip[]
  bookings?: Booking[]
}

import { Booking } from './booking.entity'
import { Trip } from './trip.entity'
