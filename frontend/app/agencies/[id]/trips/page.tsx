import { Metadata } from 'next'
import AgencyTripsClient from './AgencyTripsClient'
import { generateMetadata } from '@/shared/utils/seo'

export const metadata: Metadata = generateMetadata({
  title: 'Agency Trips - Tripster',
  description: 'View all trips offered by this travel agency',
})

export default function AgencyTripsPage({ params }: { params: { id: string } }) {
  return <AgencyTripsClient agencyId={params.id} />
}
