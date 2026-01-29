import { Metadata } from 'next'
import { generateMetadata } from '@/shared/utils/seo'
import { ProtectedRoute } from '@/shared/components/auth/ProtectedRoute'
import UserProfileClient from './UserProfileClient'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

export const metadata: Metadata = generateMetadata({
  title: 'Profile - Tripster',
  description: 'Manage your personal information, wallet, complaints, and settings.',
})

export default function ProfilePage() {
  // /profile is now an alias to "Profile view" inside the unified /dashboard
  const cookieStore = cookies()
  const userRole = cookieStore.get('userRole')?.value
  
  if (userRole === 'Agency') {
    // Agencies use a dedicated profile page
    redirect('/agency/profile')
  }

  if (userRole === 'Traveler') {
    // Travelers use the unified dashboard with the profile tab
    redirect('/dashboard?tab=personal')
  }

  return (
    <ProtectedRoute allowedRoles={['Traveler', 'Agency', 'Admin']}>
      <UserProfileClient />
    </ProtectedRoute>
  )
}


