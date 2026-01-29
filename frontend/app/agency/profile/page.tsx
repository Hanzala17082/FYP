import { Metadata } from 'next'
import { generateMetadata } from '@/shared/utils/seo'
import { ProtectedRoute } from '@/shared/components/auth/ProtectedRoute'
import AgencyProfilePageClient from './AgencyProfilePageClient'

export const metadata: Metadata = generateMetadata({
  title: 'My Agency Profile - Tripster',
  description: 'View how your agency appears to travelers',
})

export default function AgencyProfilePage() {
  return (
    <ProtectedRoute allowedRoles={['Agency']}>
      <AgencyProfilePageClient />
    </ProtectedRoute>
  )
}
