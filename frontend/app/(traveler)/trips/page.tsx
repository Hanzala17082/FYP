import { Metadata } from 'next'
import dynamic from 'next/dynamic'
import { generateMetadata } from '@/shared/utils/seo'
import { PageLoader } from '@/shared/components/ui/PageLoader'

const TripListingsClient = dynamic(() => import('./TripListingsClient'), {
  loading: () => <PageLoader label="Loading trips…" />,
})

export const metadata: Metadata = generateMetadata({
  title: 'Discover Amazing Trips - Tripster',
  description: 'Browse and book trips from verified travel agencies. Find your next adventure with Tripster.',
  keywords: ['trips', 'travel', 'booking', 'destinations', 'vacation'],
  url: '/trips',
})

export default function TripsPage() {
  return <TripListingsClient />
}
