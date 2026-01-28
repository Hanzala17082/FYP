import { Metadata } from 'next'
import TripDetailClient from './TripDetailClient'
import { generateMetadata } from '@/shared/utils/seo'

export const metadata: Metadata = generateMetadata({
  title: 'Trip Details - Tripster',
  description: 'View detailed information about this trip',
})

export default function TripDetailPage({ params }: { params: { slug: string } }) {
  return <TripDetailClient slug={params.slug} />
}
