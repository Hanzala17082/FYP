/**
 * Dummy traveler profile data
 * TODO: Replace with actual database integration
 */

import { findUserByEmail, toUser } from './dummyUsers'
import { User } from '@/types/entities/user.entity'

export interface TravelerProfile {
  id: string
  user: User
  bio?: string
  preferences: {
    destinations: string[]
    tripTypes: string[]
    budgetRange?: {
      min: number
      max: number
    }
  }
  stats: {
    totalTrips: number
    totalBookings: number
    favoriteDestinations: string[]
  }
  socialLinks?: {
    website?: string
    instagram?: string
    twitter?: string
  }
  memberSince: string
}

const dummyTravelerProfiles: TravelerProfile[] = [
  {
    id: 'traveler-1',
    user: toUser(findUserByEmail('john.doe@example.com')!),
    bio: 'Passionate traveler exploring the world one destination at a time. Love adventure, culture, and meeting new people.',
    preferences: {
      destinations: ['Europe', 'Asia', 'North America'],
      tripTypes: ['Adventure', 'Cultural', 'Business'],
      budgetRange: {
        min: 500,
        max: 5000,
      },
    },
    stats: {
      totalTrips: 12,
      totalBookings: 15,
      favoriteDestinations: ['Tokyo', 'Paris', 'New York'],
    },
    socialLinks: {
      instagram: '@johndoe_travels',
      twitter: '@johndoe',
    },
    memberSince: '2024-03-01',
  },
  {
    id: 'traveler-2',
    user: toUser(findUserByEmail('jane.smith@example.com')!),
    bio: 'Business professional who loves combining work with travel. Always looking for the next great conference or networking opportunity.',
    preferences: {
      destinations: ['North America', 'Europe'],
      tripTypes: ['Business', 'Luxury'],
      budgetRange: {
        min: 1000,
        max: 10000,
      },
    },
    stats: {
      totalTrips: 8,
      totalBookings: 10,
      favoriteDestinations: ['San Francisco', 'London', 'New York'],
    },
    memberSince: '2024-03-05',
  },
]

/**
 * Get traveler profile by ID
 */
export function getTravelerProfileById(id: string): TravelerProfile | null {
  return dummyTravelerProfiles.find((profile) => profile.id === id) || null
}

/**
 * Get traveler profile by email
 */
export function getTravelerProfileByEmail(email: string): TravelerProfile | null {
  const user = findUserByEmail(email)
  if (!user || user.role !== 'Traveler') {
    return null
  }
  return dummyTravelerProfiles.find((profile) => profile.user.email === email) || null
}

/**
 * Get all traveler profiles
 */
export function getAllTravelerProfiles(): TravelerProfile[] {
  return dummyTravelerProfiles
}
