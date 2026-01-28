'use client'

import { useRouter } from 'next/navigation'
import { Header } from '@/shared/components/layout'
import {
  Avatar,
  RoundedBox,
  ThemeToggle,
  SectionHeader,
  Button,
} from '@/shared/components/ui'
import { BackButton } from '@/shared/components/navigation'
import { getTravelerProfileById } from '@/data/dummyTravelers'
import { useAuth } from '@/shared/contexts/AuthContext'
import { USER_ROLES } from '@/config/constants'

interface TravelerProfileClientProps {
  travelerId: string
}

export default function TravelerProfileClient({ travelerId }: TravelerProfileClientProps) {
  const router = useRouter()
  const { user: currentUser } = useAuth()
  const profile = getTravelerProfileById(travelerId)

  // Only allow Agency and Admin users to view traveler profiles
  const canView =
    currentUser &&
    (currentUser.role === USER_ROLES.AGENCY || currentUser.role === USER_ROLES.ADMIN)

  if (!profile) {
    return (
      <div className="bg-background-light dark:bg-background-dark min-h-screen p-5">
        <Header title="Traveler Not Found" variant="light" showThemeToggle={false} rightAction={<ThemeToggle />} />
        <RoundedBox padding="lg" className="text-center py-12 mt-6">
          <p className="text-slate-600 dark:text-slate-400">The traveler profile you're looking for doesn't exist.</p>
          <Button variant="outline" className="mt-4" onClick={() => router.back()}>
            Go Back
          </Button>
        </RoundedBox>
      </div>
    )
  }

  if (!canView) {
    return (
      <div className="bg-background-light dark:bg-background-dark min-h-screen p-5">
        <Header title="Access Denied" variant="light" showThemeToggle={false} rightAction={<ThemeToggle />} />
        <RoundedBox padding="lg" className="text-center py-12 mt-6">
          <p className="text-slate-600 dark:text-slate-400">
            You don't have permission to view this profile.
          </p>
          <Button variant="outline" className="mt-4" onClick={() => router.back()}>
            Go Back
          </Button>
        </RoundedBox>
      </div>
    )
  }

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen pb-24">
      <Header
        title="Traveler Profile"
        variant="light"
        showThemeToggle={false}
        rightAction={
          <div className="flex items-center gap-2">
            <BackButton onClick={() => router.back()} label="Go Back" />
            <ThemeToggle />
          </div>
        }
      />

      <div className="p-5 space-y-6">
        {/* Traveler Header */}
        <RoundedBox variant="default" padding="lg">
          <div className="flex flex-col md:flex-row items-start gap-4">
            <Avatar src={profile.user.avatar} name={profile.user.fullName} size="xl" />
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                {profile.user.fullName}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mb-3">
                {profile.user.city} • Member since {new Date(profile.memberSince).getFullYear()}
              </p>
              {profile.bio && (
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">{profile.bio}</p>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">
                    {profile.stats.totalTrips}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Total Trips</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">
                    {profile.stats.totalBookings}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Total Bookings</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">
                    {profile.stats.favoriteDestinations.length}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Favorite Destinations</p>
                </div>
              </div>
            </div>
          </div>
        </RoundedBox>

        {/* Preferences */}
        <RoundedBox variant="default" padding="lg">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Travel Preferences</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Preferred Destinations
              </p>
              <div className="flex flex-wrap gap-2">
                {profile.preferences.destinations.map((dest, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-primary/10 dark:bg-primary/20 text-primary text-xs font-medium rounded-full"
                  >
                    {dest}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Trip Types</p>
              <div className="flex flex-wrap gap-2">
                {profile.preferences.tripTypes.map((type, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium rounded-lg"
                  >
                    {type}
                  </span>
                ))}
              </div>
            </div>
            {profile.preferences.budgetRange && (
              <div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Budget Range</p>
                <p className="text-slate-600 dark:text-slate-400">
                  ${profile.preferences.budgetRange.min.toLocaleString()} - $
                  {profile.preferences.budgetRange.max.toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </RoundedBox>

        {/* Favorite Destinations */}
        {profile.stats.favoriteDestinations.length > 0 && (
          <RoundedBox variant="default" padding="lg">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">Favorite Destinations</h2>
            <div className="flex flex-wrap gap-2">
              {profile.stats.favoriteDestinations.map((dest, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-sm font-medium rounded-lg"
                >
                  {dest}
                </span>
              ))}
            </div>
          </RoundedBox>
        )}

        {/* Social Links */}
        {profile.socialLinks && (
          <RoundedBox variant="default" padding="lg">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">Social Links</h2>
            <div className="space-y-2">
              {profile.socialLinks.website && (
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-slate-400 dark:text-slate-500">language</span>
                  <a
                    href={profile.socialLinks.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {profile.socialLinks.website}
                  </a>
                </div>
              )}
              {profile.socialLinks.instagram && (
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-slate-400 dark:text-slate-500">photo_camera</span>
                  <span className="text-slate-700 dark:text-slate-300">{profile.socialLinks.instagram}</span>
                </div>
              )}
              {profile.socialLinks.twitter && (
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-slate-400 dark:text-slate-500">chat</span>
                  <span className="text-slate-700 dark:text-slate-300">{profile.socialLinks.twitter}</span>
                </div>
              )}
            </div>
          </RoundedBox>
        )}

        {/* Contact Info */}
        <RoundedBox variant="default" padding="lg">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">Contact Information</h2>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-slate-400 dark:text-slate-500">email</span>
              <span className="text-slate-700 dark:text-slate-300">{profile.user.email}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-slate-400 dark:text-slate-500">location_on</span>
              <span className="text-slate-700 dark:text-slate-300">{profile.user.city}</span>
            </div>
          </div>
        </RoundedBox>

      </div>
    </div>
  )
}
