'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Header, BottomNavigation } from '@/shared/components/layout'
import {
  AlertBox,
  Avatar,
  ActionButton,
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

export default function TravelerDashboardClient() {
  const router = useRouter()
  
  const quickActions = [
    { icon: 'explore', label: 'Browse Trips', onClick: () => router.push(ROUTES.TRIPS) },
    { icon: 'settings', label: 'Settings', onClick: () => {} },
    { icon: 'help', label: 'Support', onClick: () => {} },
  ]

  const upcomingTrips = [
    {
      id: '1',
      destination: 'Tokyo, Japan',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCxmWDsIkXAsVqGnpCtc1Vyv2qkRrUb08_FOxVFn1ZMbSJFG9CbeIEf6Op957d44rKcURMs8D4_ebvS9z5fao7VESH-GV__Jp1uCerJMMWqe4YEI3Z3nmT4FyjwRmN6mVPvzyaM5OBh1ILh3AfMcG-woKpe95ahKSC2QqiHfViX4c6g4IM77srkrJNcvtIhqPgynhWIYh9I1GK2QfkTRs8JOqE-gg63I_P7YfYrU6kxDjQcwWd3JSIIgStM7ROyPN1B3hwnwQo4_G4',
      dates: 'Oct 12 - Oct 20',
      status: 'confirmed',
      type: 'Business Class',
    },
    {
      id: '2',
      destination: 'New York, USA',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCTTKDU4zUi0mIk2QD2z6eqd6QprhTL0cMrAp25DjroANmP4ZS1HWntsiYtfXktp9NqHbnqmr9fvwT0Jnco9sDBI_lCO2sHo-MlNiKWxMUI9TN7kq6QZUrJWwh_zCALNrE1bmvcqFRDR9mmuBUI839jlo0TsBxcg8eBDxJzYSbuFZQjeA9cOt03AC8UiJow4CyyG2sinuPw4NhVuk8E6DK-8LASlPH_fgNNYAt8RkphrDrg1voT2a16iW3OQOacwuGQtcz6KfYGbUA',
      dates: 'Nov 05 - Nov 08',
      status: 'pending',
      type: 'Standard Room',
    },
  ]

  const wishlist = [
    {
      id: '1',
      title: 'Bali Retreat',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBEgIScqGkIVftRRaeJHC_hdObj1Lpm-Ka96KF79X5kg4WgcRJKOY7QaiqThZW6ZM9vhFQ8ZPP8iR0cLHjl7AUjRZ5cOhHTeKd35c35RFLOFNtVNbbfftu78izR9MKLT4_jGIv52TbEb3pOtWxWlUjBusKQ2utZ3Dol4Iaxnl_GId-mVvsa3vZql3dU2SBFvAFgJ02qB5qneCXVZ_Ey8EB1PiuylvWcfT0M_FsW4l3aHiZlRBHZ98uaYWe7Yx3m8HMaDAEZhVrft-c',
      subtitle: 'Est. $1,200',
    },
  ]

  const pastTrips = [
    {
      id: '1',
      title: 'Berlin Conference',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBWI-B6hTuVWrgrONX2j2vtZVf3Q0Y7HrUZTAxL1GrZIJ90K0jxcWvSkZgRjWGEnEZoDZt4ULBfmrDKu09XwHud1C6iohq4tBluNX_ptRbwBFdU1q-4Nq_cYOTz-SXla3D4yE0V4NbynqtZDKkR3RG_AboI67TJKvidD9z9HbFsXwHsdqJO3I1dwvss8M0FCcTlqGJ_8AyvioIstWwpYV4aSfkZ5msyKJy5diLYySt0Pj2qHzfmriE4T5ZR_XICBSlVmvIvN1Mzz1I',
      dates: 'Sept 14 - Sept 18, 2023',
    },
    {
      id: '2',
      title: 'San Francisco HQ',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuDQl9Ik4GWgaxJKdX46HMBI3DMv357bYH-ZfW_rJu1DjtBSIPhd3i-FaPZMsGGkKGxBU5CmNmwiY_IN-ON3HBQ3-6wXySj4mYv3AT-Cs7ghLaTsa8tG86Z7aWX7zJrEkM0cMNcGaZOI2LmHaI6vgwEKJx24I7CV1mm1usK638jjE3fpaA1K5k3Ussip6hzuoBQPmZx4dXxrH-OrTfORu89T_nCbsOwIts8fxLjCCV-P9lYPKk5MtP-lN2k2BdxTP_n2RqUzRXfwt3k',
      dates: 'July 02 - July 05, 2023',
    },
  ]

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
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAtQvhVyGhF9vZ2gsk0k12yfZjV1oZtLzZ-UIRwC7O2kA_1CnL84yqN4ftXTib6f6aBfGO1OG7wLhddpC-l-wmrR_Tii_i_F9pcGhCN8mwO9RE95-e4aJ-PHyJmofmLaxf3ihyT0R7BU4nCj-lhB6p0g0kx-hno1eWq0yCT4LNRuKILXyFBKIWGhDM-B9FUuGE4_PfSLjFqlA_X9XHaz4UYKbONkatEm6R5uqz-YIda0WwyqPS-5KuUpewqj8m--XOBZEnQGTO0QDc"
            name="Sarah Jenkins"
            size="lg"
          />
          <div className="flex flex-col">
            <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
              Welcome back
            </p>
            <p className="text-slate-900 dark:text-white text-lg font-bold leading-tight">
              Sarah Jenkins
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
        <div className="flex overflow-x-auto hide-scrollbar pl-5 md:pl-8 pb-4 gap-4 snap-x snap-mandatory md:grid md:grid-cols-2 lg:grid-cols-3 md:snap-none md:overflow-x-visible md:pl-8">
          {upcomingTrips.map((trip) => (
            <RoundedBox
              key={trip.id}
              variant="default"
              rounded="lg"
              padding="none"
              className="snap-start shrink-0 w-[280px] md:w-full overflow-hidden flex flex-col"
            >
              <div className="relative h-36 w-full">
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url('${trip.image}')` }}
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
          {pastTrips.map((trip) => (
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
