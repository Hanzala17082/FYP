import { Metadata } from 'next'
import TravelerDashboardClient from './TravelerDashboardClient'
import { generateMetadata } from '@/shared/utils/seo'
import { ProtectedRoute } from '@/shared/components/auth/ProtectedRoute'

export const metadata: Metadata = generateMetadata({
  title: 'Traveler Dashboard - Tripster',
  description: 'Manage your trips, bookings, and travel preferences',
})

export default function TravelerDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['Traveler']}>
      <TravelerDashboardClient />
    </ProtectedRoute>
  )
}
