import { Metadata } from 'next'
import dynamic from 'next/dynamic'
import { generateMetadata } from '@/shared/utils/seo'
import { ProtectedRoute } from '@/shared/components/auth/ProtectedRoute'
import { PageLoader } from '@/shared/components/ui/PageLoader'

const AdminDashboardClient = dynamic(() => import('./AdminDashboardClient'), {
  loading: () => <PageLoader label="Loading admin dashboard…" />,
})

export const metadata: Metadata = generateMetadata({
  title: 'Admin Dashboard - Tripster',
  description: 'Admin panel for managing users, agencies, and system settings',
})

export default function AdminDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['Admin']}>
      <AdminDashboardClient />
    </ProtectedRoute>
  )
}
