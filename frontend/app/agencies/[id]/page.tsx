import { Metadata } from 'next'
import AgencyProfileClient from './AgencyProfileClient'
import { generateMetadata } from '@/shared/utils/seo'

export const metadata: Metadata = generateMetadata({
  title: 'Agency Profile - Tripster',
  description: 'View detailed information about this travel agency',
})

export default function AgencyProfilePage({ params }: { params: { id: string } }) {
  return <AgencyProfileClient agencyId={params.id} />
}
