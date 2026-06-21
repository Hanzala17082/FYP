import { Metadata } from 'next'
import dynamic from 'next/dynamic'
import { generateMetadata } from '@/shared/utils/seo'
import { ProtectedRoute } from '@/shared/components/auth/ProtectedRoute'
import { PageLoader } from '@/shared/components/ui/PageLoader'

const AdminTripsClient = dynamic(() => import('./AdminTripsClient'), {
  loading: () => <PageLoader label="Loading trips…" />,
})

export const metadata: Metadata = generateMetadata({
  title: 'All Trips - Tripster Admin',
  description: 'View all trips listed on the platform',
})

export default function AdminTripsPage() {
  return (
    <ProtectedRoute allowedRoles={['Admin']}>
      <AdminTripsClient />
    </ProtectedRoute>
  )
}
