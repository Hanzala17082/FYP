import { Metadata } from 'next'
import TravelerProfileClient from './TravelerProfileClient'
import { generateMetadata } from '@/shared/utils/seo'

export const metadata: Metadata = generateMetadata({
  title: 'Traveler Profile - Tripster',
  description: 'View traveler profile information',
})

export default function TravelerProfilePage({ params }: { params: { id: string } }) {
  // Public traveler profile (only shows past trips/photos; no future trip privacy leaks)
  return <TravelerProfileClient travelerId={params.id} />
}
