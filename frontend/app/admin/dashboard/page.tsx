import { Metadata } from 'next'
import AdminDashboardClient from './AdminDashboardClient'
import { generateMetadata } from '@/shared/utils/seo'
import { ProtectedRoute } from '@/shared/components/auth/ProtectedRoute'

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
