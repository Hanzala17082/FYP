import { Metadata } from 'next'
import { generateMetadata } from '@/shared/utils/seo'
import TripListingsClient from './TripListingsClient'

export const metadata: Metadata = generateMetadata({
  title: 'Discover Amazing Trips - Tripster',
  description: 'Browse and book trips from verified travel agencies. Find your next adventure with Tripster.',
  keywords: ['trips', 'travel', 'booking', 'destinations', 'vacation'],
  url: '/trips',
})

export default function TripsPage() {
  return <TripListingsClient />
}
