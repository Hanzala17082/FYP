import { Metadata } from 'next'
import TravelerProfileClient from './TravelerProfileClient'
import { generateMetadata } from '@/shared/utils/seo'
import { ProtectedRoute } from '@/shared/components/auth/ProtectedRoute'
import { USER_ROLES } from '@/config/constants'

export const metadata: Metadata = generateMetadata({
  title: 'Traveler Profile - Tripster',
  description: 'View traveler profile information',
})

export default function TravelerProfilePage({ params }: { params: { id: string } }) {
  return (
    <ProtectedRoute allowedRoles={[USER_ROLES.AGENCY, USER_ROLES.ADMIN]}>
      <TravelerProfileClient travelerId={params.id} />
    </ProtectedRoute>
  )
}
