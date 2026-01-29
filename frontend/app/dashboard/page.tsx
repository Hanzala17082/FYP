import { Metadata } from 'next'
import { generateMetadata } from '@/shared/utils/seo'
import { ProtectedRoute } from '@/shared/components/auth/ProtectedRoute'
import UserProfileClient from '../profile/UserProfileClient'

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
