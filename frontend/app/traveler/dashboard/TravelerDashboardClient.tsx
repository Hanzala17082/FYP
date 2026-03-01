'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Header, BottomNavigation } from '@/shared/components/layout'
import {
  AlertBox,
  Avatar,
  QuickActionGrid,
  SectionHeader,
  ImageCard,
  PastTripItem,
  StatusBadge,
  RoundedBox,
  IconButton,
} from '@/shared/components/ui'
import { ThemeToggle } from '@/shared/components/ui/ThemeToggle'
import { LogoutButton } from '@/shared/components/auth/LogoutButton'
import { NavButton } from '@/shared/components/navigation'
import { ROUTES } from '@/config/constants'
import { dashboardService } from '@/services/dashboard.service'
import { useAuth } from '@/shared/contexts/AuthContext'

export default function TravelerDashboardClient() {
  const router = useRouter()
  const { user } = useAuth()
  const [upcomingBookings, setUpcomingBookings] = useState<Array<{ id: string; destination: string; image: string; dates: string; status: string; type: string }>>([])
  const [pastBookings, setPastBookings] = useState<Array<{ id: string; title: string; image: string; dates: string }>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    dashboardService
      .getTravelerDashboard()
      .then((dash) => {
        setUpcomingBookings(
          (dash.upcomingBookings ?? []).map((b) => ({
            id: b.id,
            destination: b.trip?.destination ?? 'Trip',
            image: (b.trip?.images?.[0] as string) ?? '',
            dates: `${b.startDate} – ${b.endDate}`,
            status: b.status,
            type: `${b.numberOfTravelers} traveler(s)`,
          }))
        )
        setPastBookings(
          (dash.pastBookings ?? []).map((b) => ({
            id: b.id,
            title: b.trip?.title ?? 'Trip',
            image: (b.trip?.images?.[0] as string) ?? '',
            dates: `${b.startDate} – ${b.endDate}`,
          }))
        )
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const quickActions = [
    { icon: 'explore', label: 'Browse Trips', onClick: () => router.push(ROUTES.TRIPS) },
    { icon: 'settings', label: 'Settings', onClick: () => {} },
    { icon: 'help', label: 'Support', onClick: () => {} },
  ]

  const wishlist: Array<{ id: string; title: string; image: string; subtitle: string }> = []

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark">
      <div className="max-w-7xl mx-auto w-full">
        <header className="flex flex-col gap-4 p-5 pb-2 md:p-8">
          <div className="flex items-center justify-between">
            <Link href={ROUTES.TRIPS} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="flex items-center justify-center size-9 rounded-xl bg-primary text-white shadow-sm">
                <span className="material-symbols-outlined text-[20px]">travel_explore</span>
              </div>
              <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                Tripster
              </span>
            </Link>
            <div className="flex items-center gap-2">
              <NavButton
                href={ROUTES.DASHBOARD.TRAVELER}
                label="Dashboard"
                icon="dashboard"
                variant="default"
              />
              <NavButton
                href={ROUTES.TRIPS}
                label="Browse Trips"
                icon="explore"
                variant="default"
              />
              <ThemeToggle />
              <IconButton
                icon={<span className="material-symbols-outlined">notifications</span>}
                variant="default"
                size="md"
                badge={true}
              />
              <LogoutButton />
            </div>
          </div>
        <div className="flex items-center gap-3">
          <Avatar
            src={user?.avatar ?? ''}
            name={user?.fullName ?? 'Traveler'}
            size="lg"
          />
          <div className="flex flex-col">
            <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
              Welcome back
            </p>
            <p className="text-slate-900 dark:text-white text-lg font-bold leading-tight">
              {user?.fullName ?? 'Traveler'}
            </p>
          </div>
        </div>
      </header>

      <div className="px-5 py-2 md:px-8">
        <AlertBox
          title="Approval Required"
          message="Your business trip to London requires manager approval."
          variant="info"
          icon={<span className="material-symbols-outlined">verified_user</span>}
          action={{ label: 'Review Details', onClick: () => {} }}
        />
      </div>

      <div className="px-5 py-4 md:px-8">
        <QuickActionGrid actions={quickActions} columns={4} />
      </div>

      <section className="flex flex-col pt-2 pb-4">
        <SectionHeader title="Upcoming Trips" className="px-5 md:px-8 mb-3" />
        {loading ? (
          <p className="px-5 md:px-8 text-slate-500 dark:text-slate-400">Loading...</p>
        ) : (
        <div className="flex overflow-x-auto hide-scrollbar pl-5 md:pl-8 pb-4 gap-4 snap-x snap-mandatory md:grid md:grid-cols-2 lg:grid-cols-3 md:snap-none md:overflow-x-visible md:pl-8">
          {upcomingBookings.map((trip) => (
            <RoundedBox
              key={trip.id}
              variant="default"
              rounded="lg"
              padding="none"
              className="snap-start shrink-0 w-[280px] md:w-full overflow-hidden flex flex-col"
            >
              <div className="relative h-36 w-full">
                <div
                  className="absolute inset-0 bg-cover bg-center bg-slate-200 dark:bg-slate-700"
                  style={trip.image ? { backgroundImage: `url('${trip.image}')` } : undefined}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute top-3 left-3">
                  <StatusBadge
                    status={trip.status === 'confirmed' ? 'confirmed' : 'pending'}
                    size="sm"
                  />
                </div>
              </div>
              <div className="p-4 flex flex-col gap-2">
                <div className="flex justify-between items-start">
                  <h3 className="text-slate-900 dark:text-white text-lg font-bold">{trip.destination}</h3>
                  <div className="bg-slate-100 dark:bg-slate-700 p-1.5 rounded-lg">
                    <span className="material-symbols-outlined text-slate-500 dark:text-slate-400 text-[20px]">
                      flight
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
                  <span className="material-symbols-outlined text-[16px]">calendar_month</span>
                  <span>{trip.dates}</span>
                </div>
                <div className="mt-2 pt-3 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center">
                  <span className="text-xs font-medium text-slate-400">{trip.type}</span>
                  <span className="text-primary text-sm font-bold">View Itinerary</span>
                </div>
              </div>
            </RoundedBox>
          ))}
          <div className="w-1 shrink-0"></div>
        </div>
        )}
      </section>

      <section className="flex flex-col py-2 px-5 md:px-8">
        <SectionHeader title="Your Wishlist" className="mb-3" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {wishlist.map((item) => (
            <ImageCard
              key={item.id}
              image={item.image}
              title={item.title}
              subtitle={item.subtitle}
              imageHeight="sm"
            />
          ))}
          <ImageCard variant="add" onClick={() => {}} />
        </div>
      </section>

      <section className="flex flex-col py-4 px-5 md:px-8 pb-24 md:pb-8">
        <SectionHeader title="Past Adventures" className="mb-3" />
        <div className="flex flex-col gap-3 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-4">
          {pastBookings.map((trip) => (
            <PastTripItem
              key={trip.id}
              image={trip.image}
              title={trip.title}
              dates={trip.dates}
              onViewReceipt={() => {}}
            />
          ))}
        </div>
      </section>
      </div>

      <BottomNavigation
        items={[
          { href: '/traveler/dashboard', icon: 'home', label: 'Home' },
          { href: '/trips', icon: 'explore', label: 'Explore' },
          { href: '/profile', icon: 'person', label: 'Profile' },
          { href: '/agencies', icon: 'business', label: 'Agencies' },
        ]}
        variant="default"
      />
    </div>
  )
}
