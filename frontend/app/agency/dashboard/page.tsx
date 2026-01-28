import { Metadata } from 'next'
import AgencyDashboardClient from './AgencyDashboardClient'
import { generateMetadata } from '@/shared/utils/seo'
import { ProtectedRoute } from '@/shared/components/auth/ProtectedRoute'

export const metadata: Metadata = generateMetadata({
  title: 'Agency Dashboard - Tripster',
  description: 'Manage your travel agency, trips, and bookings',
})

export default function AgencyDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['Agency']}>
      <AgencyDashboardClient />
    </ProtectedRoute>
  )
}
