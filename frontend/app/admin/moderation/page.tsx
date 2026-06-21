import { Metadata } from 'next'
import dynamic from 'next/dynamic'
import { generateMetadata } from '@/shared/utils/seo'
import { ProtectedRoute } from '@/shared/components/auth/ProtectedRoute'
import { PageLoader } from '@/shared/components/ui/PageLoader'

const AdminModerationClient = dynamic(() => import('./AdminModerationClient'), {
  loading: () => <PageLoader label="Loading moderation queue…" />,
})

export const metadata: Metadata = generateMetadata({
  title: 'Moderation Queue - Tripster Admin',
  description: 'Review flagged chat messages across the platform',
})

export default function AdminModerationPage() {
  return (
    <ProtectedRoute allowedRoles={['Admin']}>
      <AdminModerationClient />
    </ProtectedRoute>
  )
}
