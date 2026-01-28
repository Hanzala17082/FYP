'use client'

import { useState } from 'react'
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

export default function TripListingsClient() {
  const [searchQuery, setSearchQuery] = useState('')
  const { isAuthenticated, user, isLoading } = useAuth()
  const router = useRouter()

  // Ensure user role is valid and matches expected values
  const userRole = user?.role && ['Traveler', 'Agency', 'Admin'].includes(user.role) ? user.role : null

  // Mock data - will be replaced with API call
  const trips = [
    {
      id: '1',
      title: 'Tech Conference 2024 - San Francisco',
      agency: { name: 'Global Corp Travel', verified: true },
      startDate: 'Oct 12',
      endDate: 'Oct 16',
      duration: 4,
      price: 1250,
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuB976Fq05Wg6VqoNWnn0h7n3_L8fLph0yDJCZcPrJfVi5OftNdiZOqeaQBXGVHAObFO9sOjwAP_yY0EQ0HM2voe6S3TP2sSIW_v1824MIAv1QIqcuJXKduZcCg_Lo9HOUD9nLYxEyaou3_UGbMiGyCz5MXKhr9n5F449USjn1oXR48hAmWwNW8vshZDi54Hs1Eh93syd4cD3iH7ywKV805SVUsImkuDTKpAqzjNvZ1Zc1D3nKQYv3QwFxhY3RhWfLszUsOija17vyY',
      badge: { text: 'Company Approved', status: 'approved' as const },
    },
    {
      id: '2',
      title: 'Team Retreat - Bali',
      agency: { name: 'Zenith Experiences', verified: true },
      startDate: 'Nov 01',
      endDate: 'Nov 08',
      duration: 7,
      price: 2100,
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBOMq-Qvj6UPiHUEMmuhkqCsaLoR2Am8FTkRSgnHfeCrqi_v1H8ABo1aeDiwEGHd3EL2hMhXI79Vq560zcY17r3uCy5936HGN_aE_xPXjetT2kyNFxUELESK5dNqi_Bso-EundsfiRAgXtiTnDz_jGj8Gmbq-_at-wO4cxbHFI_dqe7lltcpZ_LdQD4h3NNrCuYU3w5jhJF5ktHloAJVw-OqsQ1RfzfSly34iGRKVK4_ROuBEw-a_a81PCGpyTbYamSzxqqws6s75c',
      badge: { text: 'Trending', status: 'trending' as const },
    },
    {
      id: '3',
      title: 'Financial Summit - London',
      agency: { name: 'EuroExec Travel', verified: true },
      startDate: 'Dec 05',
      endDate: 'Dec 08',
      duration: 3,
      price: 950,
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuA_QlhZhBz5YC9ZcxTT4Mr_-n_DfGBQGs8f8DYElLF48g0aBx5jGBszWimY-BWbtBnpH_oPRIYXoqL94jdRFk7K13Vz4h2MWEEAXBDp6jE7skW_m0D5w-0MtvekdiuFFgjh_p4OpSJyjWG1lAkmCmr5YmrYbwT3xyVntx8W6oP6Zm6Gr4M-u8rOGVTz-FycH4lsXgMVxqmTfsLur6_BKhgBAnrhmnVZybN_bKsr-Gl_AP-4ehx6_uq2eyEm-TboVRTH23PXxGdb45w',
    },
  ]

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
                <BackButton
                  href={ROUTES.DASHBOARD.AGENCY}
                  label="Back to Dashboard"
                  validateRole={true}
                  expectedRole="Agency"
                />
              )}
              {!isLoading && isAuthenticated && userRole === USER_ROLES.TRAVELER && (
                <NavButton
                  href={ROUTES.DASHBOARD.TRAVELER}
                  label="Dashboard"
                  icon="dashboard"
                  variant="default"
                  validateRole={true}
                  expectedRole="Traveler"
                />
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
              id={trip.id}
              title={trip.title}
              agency={trip.agency}
              startDate={trip.startDate}
              endDate={trip.endDate}
              duration={trip.duration}
              price={trip.price}
              image={trip.image}
              badge={trip.badge}
            />
          ))}
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation
        items={[
          { href: '/trips', icon: 'explore', label: 'Explore' },
          ...(isAuthenticated && user?.role === 'Traveler'
            ? [{ href: ROUTES.DASHBOARD.TRAVELER, icon: 'dashboard', label: 'Dashboard' }]
            : []),
          { href: '/profile', icon: 'person', label: 'Profile' },
        ]}
        variant="default"
      />
    </div>
  )
}
