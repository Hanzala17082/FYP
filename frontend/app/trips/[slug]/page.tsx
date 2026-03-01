import { Metadata } from 'next'
import TripDetailClient from './TripDetailClient'
import { generateMetadata } from '@/shared/utils/seo'

export const metadata: Metadata = generateMetadata({
  title: 'Trip Details - Tripster',
  description: 'View detailed information about this trip',
})

type PageProps = { params: Promise<{ slug: string }> | { slug: string } }

export default async function TripDetailPage({ params }: PageProps) {
  const resolved = await Promise.resolve(params)
  const slug = resolved?.slug ?? ''
  return <TripDetailClient slug={slug} />
}
