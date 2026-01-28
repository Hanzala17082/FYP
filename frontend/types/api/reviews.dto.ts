export interface ReviewDTO {
  id: string
  tripId?: string
  agencyId?: string
  traveler: UserDTO
  rating: number
  comment: string
  createdAt: string
  updatedAt: string
}

export interface ReviewRequestDTO {
  tripId?: string
  agencyId?: string
  rating: number
  comment: string
}

import { UserDTO } from './auth.dto'
