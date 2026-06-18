import { Metadata } from 'next'
import dynamic from 'next/dynamic'
import { generateMetadata } from '@/shared/utils/seo'
import { ProtectedRoute } from '@/shared/components/auth/ProtectedRoute'
import { PageLoader } from '@/shared/components/ui/PageLoader'

const UserProfileClient = dynamic(() => import('../profile/UserProfileClient'), {
  loading: () => <PageLoader label="Loading dashboard…" />,
})

export const metadata: Metadata = generateMetadata({
  title: 'Dashboard - Tripster',
  description: 'View your account overview, metrics, trips, and manage your settings.',
})

export default function DashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['Traveler', 'Agency', 'Admin']}>
      <UserProfileClient />
    </ProtectedRoute>
  )
}
