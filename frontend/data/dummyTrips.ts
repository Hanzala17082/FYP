/**
 * Dummy trips data source
 * TODO: Replace with actual database integration
 */

import { TripDTO, CreateTripRequestDTO } from '@/types/api/trips.dto'
import { findAgencyById } from './dummyAgencies'

// Helper to generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

// Dummy trips data
let dummyTripsData: TripDTO[] = [
  {
    id: 'trip-1',
    title: 'Tech Conference 2024 - San Francisco',
    slug: 'tech-conference',
    description:
      'Join us for an exciting tech conference in the heart of San Francisco. Network with industry leaders, attend workshops, and explore the latest innovations in technology. This comprehensive 4-day experience combines professional development with cultural exploration.',
    shortDescription: 'Join industry leaders for a 4-day tech conference in San Francisco',
    destination: 'San Francisco, CA',
    price: 1250,
    duration: 4,
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB976Fq05Wg6VqoNWnn0h7n3_L8fLph0yDJCZcPrJfVi5OftNdiZOqeaQBXGVHAObFO9sOjwAP_yY0EQ0HM2voe6S3TP2sSIW_v1824MIAv1QIqcuJXKduZcCg_Lo9HOUD9nLYxEyaou3_UGbMiGyCz5MXKhr9n5F449USjn1oXR48hAmWwNW8vshZDi54Hs1Eh93syd4cD3iH7ywKV805SVUsImkuDTKpAqzjNvZ1Zc1D3nKQYv3QwFxhY3RhWfLszUsOija17vyY',
    ],
    agency: {
      id: 'agency-1',
      name: 'Global Travels Inc',
      slug: 'global-travels',
      description: 'Premier travel agency specializing in corporate and luxury travel',
      logo: 'https://ui-avatars.com/api/?name=Global+Travels&background=10B981&color=fff',
      rating: 4.8,
      reviewCount: 124,
      location: 'London, UK',
      verified: true,
      avatar: 'https://ui-avatars.com/api/?name=Global+Travels&background=10B981&color=fff',
    },
    rating: 4.8,
    reviewCount: 124,
    availableDates: ['2024-10-12', '2024-11-15', '2024-12-10'],
    startDate: '2024-10-12',
    endDate: '2024-10-16',
    status: 'active',
    tags: ['Business', 'Conference', 'Networking', 'Technology'],
    createdAt: new Date('2024-01-15').toISOString(),
    updatedAt: new Date('2024-01-15').toISOString(),
  },
  {
    id: 'trip-2',
    title: 'Bali Paradise Retreat',
    slug: 'bali-paradise-retreat',
    description:
      'Experience the ultimate tropical getaway in beautiful Bali. Relax on pristine beaches, explore ancient temples, and indulge in world-class spa treatments.',
    shortDescription: 'Ultimate tropical getaway in beautiful Bali',
    destination: 'Bali, Indonesia',
    price: 899,
    duration: 7,
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBEgIScqGkIVftRRaeJHC_hdObj1Lpm-Ka96KF79X5kg4WgcRJKOY7QaiqThZW6ZM9vhFQ8ZPP8iR0cLHjl7AUjRZ5cOhHTeKd35c35RFLOFNtVNbbfftu78izR9MKLT4_jGIv52TbEb3pOtWxWlUjBusKQ2utZ3Dol4Iaxnl_GId-mVvsa3vZql3dU2SBFvAFgJ02qB5qneCXVZ_Ey8EB1PiuylvWcfT0M_FsW4l3aHiZlRBHZ98uaYWe7Yx3m8HMaDAEZhVrft-c',
    ],
    agency: {
      id: 'agency-1',
      name: 'Global Travels Inc',
      slug: 'global-travels',
      description: 'Premier travel agency specializing in corporate and luxury travel',
      logo: 'https://ui-avatars.com/api/?name=Global+Travels&background=10B981&color=fff',
      rating: 4.8,
      reviewCount: 124,
      location: 'London, UK',
      verified: true,
      avatar: 'https://ui-avatars.com/api/?name=Global+Travels&background=10B981&color=fff',
    },
    rating: 4.9,
    reviewCount: 89,
    availableDates: ['2024-09-01', '2024-10-15', '2024-11-20'],
    startDate: '2024-09-01',
    endDate: '2024-09-08',
    status: 'active',
    tags: ['Luxury', 'Beach', 'Relaxation', 'Spa'],
    createdAt: new Date('2024-02-01').toISOString(),
    updatedAt: new Date('2024-02-01').toISOString(),
  },
  {
    id: 'trip-3',
    title: 'Tokyo Business Conference',
    slug: 'tokyo-business-conference',
    description:
      'Attend a prestigious business conference in Tokyo. Network with global executives and explore Japan\'s vibrant business culture.',
    shortDescription: 'Prestigious business conference in Tokyo',
    destination: 'Tokyo, Japan',
    price: 1499,
    duration: 5,
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCxmWDsIkXAsVqGnpCtc1Vyv2qkRrUb08_FOxVFn1ZMbSJFG9CbeIEf6Op957d44rKcURMs8D4_ebvS9z5fao7VESH-GV__Jp1uCerJMMWqe4YEI3Z3nmT4FyjwRmN6mVPvzyaM5OBh1ILh3AfMcG-woKpe95ahKSC2QqiHfViX4c6g4IM77srkrJNcvtIhqPgynhWIYh9I1GK2QfkTRs8JOqE-gg63I_P7YfYrU6kxDjQcwWd3JSIIgStM7ROyPN1B3hwnwQo4_G4',
    ],
    agency: {
      id: 'agency-1',
      name: 'Global Travels Inc',
      slug: 'global-travels',
      description: 'Premier travel agency specializing in corporate and luxury travel',
      logo: 'https://ui-avatars.com/api/?name=Global+Travels&background=10B981&color=fff',
      rating: 4.8,
      reviewCount: 124,
      location: 'London, UK',
      verified: true,
      avatar: 'https://ui-avatars.com/api/?name=Global+Travels&background=10B981&color=fff',
    },
    rating: 4.7,
    reviewCount: 56,
    availableDates: ['2024-11-10', '2024-12-05'],
    startDate: '2024-11-10',
    endDate: '2024-11-15',
    status: 'active',
    tags: ['Business', 'Conference', 'Japan', 'Networking'],
    createdAt: new Date('2024-03-01').toISOString(),
    updatedAt: new Date('2024-03-01').toISOString(),
  },
]

/**
 * Get all trips
 */
export function getAllTrips(): TripDTO[] {
  return dummyTripsData
}

/**
 * Get trips by agency ID
 */
export function getTripsByAgencyId(agencyId: string): TripDTO[] {
  return dummyTripsData.filter((trip) => trip.agency.id === agencyId)
}

/**
 * Get trip by ID
 */
export function getTripById(id: string): TripDTO | null {
  return dummyTripsData.find((trip) => trip.id === id) || null
}

/**
 * Get trip by slug
 */
export function getTripBySlug(slug: string): TripDTO | null {
  return dummyTripsData.find((trip) => trip.slug === slug) || null
}

/**
 * Create a new trip
 */
export function createTrip(agencyId: string, tripData: CreateTripRequestDTO): TripDTO {
  const agency = findAgencyById(agencyId)
  if (!agency) {
    throw new Error('Agency not found')
  }

  const newTrip: TripDTO = {
    id: `trip-${Date.now()}`,
    slug: generateSlug(tripData.title),
    ...tripData,
    agency: {
      id: agency.id,
      name: agency.name,
      slug: generateSlug(agency.name),
      description: agency.description,
      logo: agency.avatar,
      rating: agency.rating,
      reviewCount: agency.reviewCount,
      location: `${agency.city}, ${agency.country}`,
      verified: agency.verified,
      avatar: agency.avatar,
    },
    rating: 0,
    reviewCount: 0,
    status: 'pending', // New trips start as pending
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  dummyTripsData.push(newTrip)
  return newTrip
}

/**
 * Update a trip
 */
export function updateTrip(id: string, updates: Partial<TripDTO>): TripDTO | null {
  const tripIndex = dummyTripsData.findIndex((trip) => trip.id === id)
  if (tripIndex === -1) {
    return null
  }

  dummyTripsData[tripIndex] = {
    ...dummyTripsData[tripIndex],
    ...updates,
    updatedAt: new Date().toISOString(),
  }

  return dummyTripsData[tripIndex]
}

/**
 * Delete a trip
 */
export function deleteTrip(id: string): boolean {
  const tripIndex = dummyTripsData.findIndex((trip) => trip.id === id)
  if (tripIndex === -1) {
    return false
  }

  dummyTripsData.splice(tripIndex, 1)
  return true
}

/**
 * Get trips with filters
 */
export function getTripsWithFilters(filters: {
  agencyId?: string
  status?: string
  destination?: string
  minPrice?: number
  maxPrice?: number
}): TripDTO[] {
  let filtered = [...dummyTripsData]

  if (filters.agencyId) {
    filtered = filtered.filter((trip) => trip.agency.id === filters.agencyId)
  }

  if (filters.status) {
    filtered = filtered.filter((trip) => trip.status === filters.status)
  }

  if (filters.destination) {
    filtered = filtered.filter((trip) =>
      trip.destination.toLowerCase().includes(filters.destination!.toLowerCase())
    )
  }

  if (filters.minPrice !== undefined) {
    filtered = filtered.filter((trip) => trip.price >= filters.minPrice!)
  }

  if (filters.maxPrice !== undefined) {
    filtered = filtered.filter((trip) => trip.price <= filters.maxPrice!)
  }

  return filtered
}
