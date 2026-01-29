'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { TripCard } from '@/shared/components/ui'
import { TripFilters } from '@/features/trips/components/TripFilters'
import { Header, BottomNavigation } from '@/shared/components/layout'
import { IconButton, ThemeToggle } from '@/shared/components/ui'
import { LogoutButton } from '@/shared/components/auth/LogoutButton'
import { BackButton, NavButton } from '@/shared/components/navigation'
import { useAuth } from '@/shared/contexts/AuthContext'
import { ROUTES, USER_ROLES } from '@/config/constants'
import { getAllTrips } from '@/data/dummyTrips'

export default function TripListingsClient() {
  const [searchQuery, setSearchQuery] = useState('')
  const { isAuthenticated, user, isLoading } = useAuth()
  const router = useRouter()

  // Ensure user role is valid and matches expected values
  const userRole = user?.role && ['Traveler', 'Agency', 'Admin'].includes(user.role) ? user.role : null

  const storageKey = user ? `wishlist:${user.id}` : null
  const [wishlist, setWishlist] = useState<string[]>([])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!storageKey) return
    const raw = window.localStorage.getItem(storageKey)
    if (raw) {
      try {
        setWishlist(JSON.parse(raw))
      } catch {
        setWishlist([])
      }
    } else {
      setWishlist([])
    }
  }, [storageKey])

  const toggleWishlist = (slug: string) => {
    if (typeof window === 'undefined') return
    if (!storageKey) return
    setWishlist((prev) => {
      const next = prev.includes(slug) ? prev.filter((x) => x !== slug) : [...prev, slug]
      window.localStorage.setItem(storageKey, JSON.stringify(next))
      return next
    })
  }

  const trips = useMemo(() => getAllTrips(), [])

  return (
    <div className="relative flex h-full min-h-screen w-full flex-col overflow-x-hidden pb-24 md:pb-8 bg-background-light dark:bg-background-dark text-slate-900 dark:text-white">
      <div className="max-w-7xl mx-auto w-full">
        {/* Header */}
        <Header
          title="Tripster"
          variant="light"
          showThemeToggle={false}
          rightAction={
            <div className="flex items-center gap-2">
              {!isLoading && isAuthenticated && userRole === USER_ROLES.AGENCY && (
                <>
                  <NavButton
                    href={ROUTES.DASHBOARD.AGENCY}
                    label="Dashboard"
                    icon="dashboard"
                    variant="default"
                    validateRole={true}
                    expectedRole="Agency"
                  />
                  <NavButton
                    href="/profile"
                    label="Profile"
                    icon="person"
                    variant="default"
                    validateRole={true}
                    expectedRole="Agency"
                  />
                </>
              )}
              {!isLoading && isAuthenticated && userRole === USER_ROLES.TRAVELER && (
                <>
                  <NavButton
                    href={ROUTES.DASHBOARD.TRAVELER}
                    label="Dashboard"
                    icon="dashboard"
                    variant="default"
                    validateRole={true}
                    expectedRole="Traveler"
                  />
                  <NavButton
                    href={user ? `/travelers/${user.id}` : '/profile'}
                    label="Profile"
                    icon="person"
                    variant="default"
                    validateRole={true}
                    expectedRole="Traveler"
                  />
                </>
              )}
              <ThemeToggle />
              {!isLoading && isAuthenticated && userRole && (
                <>
                  <IconButton
                    icon={<span className="material-symbols-outlined">notifications</span>}
                    variant="default"
                    size="md"
                  />
                  <LogoutButton />
                </>
              )}
            </div>
          }
          className="px-4 py-3 md:px-8 md:py-4"
        />

        {/* Search */}
        <div className="px-4 py-4 md:px-8">
          <label className="flex flex-col w-full max-w-2xl mx-auto">
            <div className="flex w-full items-center rounded-xl bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark shadow-sm transition-all focus-within:ring-2 focus-within:ring-primary/50 focus-within:border-primary">
              <div className="flex items-center justify-center pl-4 text-slate-400 dark:text-slate-400">
                <span className="material-symbols-outlined">search</span>
              </div>
              <input
                className="h-12 w-full bg-transparent border-none focus:ring-0 text-base text-slate-900 dark:text-white placeholder:text-slate-500 px-3"
                placeholder="Where do you want to go?"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </label>
        </div>

        {/* Filters */}
        <div className="px-4 md:px-8">
          <TripFilters />
        </div>

        {/* Trip Listings */}
        <div className="flex flex-col gap-5 p-4 md:p-8 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-6">
          {trips.map((trip) => (
            <TripCard
              key={trip.id}
              id={trip.slug}
              title={trip.title}
              agency={{ name: trip.agency.name, verified: trip.agency.verified }}
              startDate={trip.startDate}
              endDate={trip.endDate}
              duration={trip.duration}
              price={trip.price}
              image={trip.images?.[0] || ''}
              images={trip.images}
              badge={trip.status ? { text: trip.status, status: (trip.status as any) } : undefined}
              wishlistAction={
                !isLoading && isAuthenticated && userRole === USER_ROLES.TRAVELER && user
                  ? { active: wishlist.includes(trip.slug), onToggle: () => toggleWishlist(trip.slug) }
                  : undefined
              }
            />
          ))}
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation
        items={[
          { href: '/trips', icon: 'explore', label: 'Explore' },
          ...(!isLoading && isAuthenticated && userRole === USER_ROLES.TRAVELER
            ? [
                { href: ROUTES.DASHBOARD.TRAVELER, icon: 'dashboard', label: 'Dashboard' },
                { href: user ? `/travelers/${user.id}` : '/profile', icon: 'person', label: 'Profile' },
              ]
            : !isLoading && isAuthenticated && userRole === USER_ROLES.AGENCY
              ? [{ href: ROUTES.DASHBOARD.AGENCY, icon: 'dashboard', label: 'Dashboard' }]
              : !isLoading && isAuthenticated && userRole === USER_ROLES.ADMIN
                ? [{ href: ROUTES.DASHBOARD.ADMIN, icon: 'dashboard', label: 'Dashboard' }]
                : [{ href: ROUTES.LOGIN, icon: 'login', label: 'Login' }]),
        ]}
        variant="default"
      />
    </div>
  )
}
