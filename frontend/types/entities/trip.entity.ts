export interface Trip {
  id: string
  title: string
  slug: string
  description: string
  shortDescription: string
  destination: string
  price: number
  duration: number
  images: string[]
  agencyId: string
  agency: Agency
  rating: number
  reviewCount: number
  availableDates: string[]
  startDate: string
  endDate: string
  status: TripStatus
  tags: string[]
  createdAt: string
  updatedAt: string
}

export type TripStatus = 'active' | 'pending' | 'completed' | 'cancelled'

import { Agency } from './user.entity'
