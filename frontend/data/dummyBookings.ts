/**
 * Dummy traveler booking/request data
 * TODO: Replace with real API integration
 */
import { getTripById } from './dummyTrips'

export type TravelerBookingStatus = 'pending' | 'confirmed' | 'rejected' | 'cancelled'

export interface TravelerBooking {
  id: string
  travelerId: string
  tripId: string
  status: TravelerBookingStatus
  createdAt: string
}

const dummyTravelerBookings: TravelerBooking[] = [
  // Traveler-1 (John Doe)
  {
    id: 'bk-1',
    travelerId: 'traveler-1',
    tripId: 'trip-1',
    status: 'pending',
    createdAt: new Date('2024-09-01').toISOString(),
  },
  {
    id: 'bk-2',
    travelerId: 'traveler-1',
    tripId: 'trip-2',
    status: 'confirmed',
    createdAt: new Date('2024-08-20').toISOString(),
  },
  {
    id: 'bk-3',
    travelerId: 'traveler-1',
    tripId: 'trip-3',
    status: 'rejected',
    createdAt: new Date('2024-08-15').toISOString(),
  },
  // Traveler-2 (Jane Smith)
  {
    id: 'bk-4',
    travelerId: 'traveler-2',
    tripId: 'trip-2',
    status: 'pending',
    createdAt: new Date('2024-09-05').toISOString(),
  },
]

export function getTravelerBookingsByTravelerId(travelerId: string): TravelerBooking[] {
  // Filter out entries whose trip no longer exists (e.g. if an agency deletes it)
  return dummyTravelerBookings
    .filter((b) => b.travelerId === travelerId)
    .filter((b) => !!getTripById(b.tripId))
}

