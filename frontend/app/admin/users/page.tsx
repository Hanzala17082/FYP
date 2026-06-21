import { Metadata } from 'next'
import dynamic from 'next/dynamic'
import { generateMetadata } from '@/shared/utils/seo'
import { ProtectedRoute } from '@/shared/components/auth/ProtectedRoute'
import { PageLoader } from '@/shared/components/ui/PageLoader'

const AdminUsersClient = dynamic(() => import('./AdminUsersClient'), {
  loading: () => <PageLoader label="Loading users…" />,
})

export const metadata: Metadata = generateMetadata({
  title: 'All Users - Tripster Admin',
  description: 'View all registered users on the platform',
})

export default function AdminUsersPage() {
  return (
    <ProtectedRoute allowedRoles={['Admin']}>
      <AdminUsersClient />
    </ProtectedRoute>
  )
}
