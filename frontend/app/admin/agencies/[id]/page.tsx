import { Metadata } from 'next'
import { generateMetadata } from '@/shared/utils/seo'
import { ProtectedRoute } from '@/shared/components/auth/ProtectedRoute'
import AdminAgencyProfileClient from './AdminAgencyProfileClient'

export const metadata: Metadata = generateMetadata({
  title: 'Agency Details (Admin) - Tripster',
  description: 'Admin-only view of agency profile and private contact details',
})

export default function AdminAgencyProfilePage({ params }: { params: { id: string } }) {
  return (
    <ProtectedRoute allowedRoles={['Admin']}>
      <AdminAgencyProfileClient agencyId={params.id} />
    </ProtectedRoute>
  )
}

