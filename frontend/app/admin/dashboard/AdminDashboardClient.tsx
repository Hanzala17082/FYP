'use client'

import { useState } from 'react'
import { Header } from '@/shared/components/layout'
import { StatCard, ThemeToggle, Avatar } from '@/shared/components/ui'
import { SectionHeader } from '@/shared/components/ui'
import { RoundedBox } from '@/shared/components/ui/RoundedBox'
import { Button } from '@/shared/components/ui/Button'
import { LogoutButton } from '@/shared/components/auth/LogoutButton'
import { getAllTravelerProfiles } from '@/data/dummyTravelers'
import { getAllAgencies } from '@/data/dummyAgencies'
import Link from 'next/link'

// Detail Modal Component
function DetailModal({
  isOpen,
  onClose,
  title,
  children,
}: {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}) {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined text-slate-600 dark:text-slate-400">close</span>
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

export default function AdminDashboardClient() {
  const [selectedModal, setSelectedModal] = useState<'users' | 'trips' | 'agencies' | 'verified' | 'basic' | null>(null)

  // Mock data
  const stats = {
    totalUsers: 8456,
    activeUsers: 7234,
    newUsersThisMonth: 234,
    totalTrips: 1247,
    activeTrips: 892,
    upcomingTrips: 156,
    totalAgencies: 189,
    verifiedAgencies: 142,
    basicAgencies: 47,
    pendingVerifications: 12,
    totalBookings: 3456,
    revenue: 1245000,
  }

  const recentUsers = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Traveler', joined: '2 days ago', status: 'Active' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Traveler', joined: '5 days ago', status: 'Active' },
    { id: 3, name: 'Mike Johnson', email: 'mike@example.com', role: 'Traveler', joined: '1 week ago', status: 'Active' },
    { id: 4, name: 'Sarah Williams', email: 'sarah@example.com', role: 'Traveler', joined: '2 weeks ago', status: 'Active' },
  ]

  const recentTrips = [
    { id: 1, title: 'Paris Adventure', agency: 'Global Travels', status: 'Active', bookings: 45, price: '$1,299' },
    { id: 2, title: 'Tokyo Discovery', agency: 'Asia Tours', status: 'Active', bookings: 32, price: '$2,499' },
    { id: 3, title: 'Bali Paradise', agency: 'Tropical Escapes', status: 'Upcoming', bookings: 28, price: '$899' },
    { id: 4, title: 'New York City Tour', agency: 'Urban Adventures', status: 'Active', bookings: 67, price: '$1,599' },
  ]

  const allAgencies = getAllAgencies()
  const agencies = allAgencies.map((agency) => ({
    id: agency.id,
    name: agency.name,
    email: agency.email,
    status: agency.verified ? 'Verified' : 'Basic',
    trips: agency.tripsCount,
    joined: new Date(agency.stats.totalTrips).toLocaleDateString(),
    rating: agency.rating,
    reviewCount: agency.reviewCount,
    avatar: agency.avatar,
  }))

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen">
      <Header
        title="Tripster Admin"
        subtitle="Admin Dashboard"
        variant="light"
        showThemeToggle={false}
        rightAction={
          <div className="flex items-center gap-2">
            <NavButton
              href={ROUTES.DASHBOARD.ADMIN}
              label="Dashboard"
              icon="dashboard"
              variant="default"
            />
            <NavButton
              href="/profile"
              label="Profile"
              icon="person"
              variant="default"
            />
            <ThemeToggle />
            <LogoutButton />
          </div>
        }
      />

      <main className="flex flex-col w-full max-w-7xl mx-auto p-5 md:p-8 space-y-6">
        {/* Main Statistics Grid */}
        <section>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              title="Total Users"
              value={stats.totalUsers.toLocaleString()}
              subtitle={`${stats.activeUsers.toLocaleString()} active`}
              icon={<span className="material-symbols-outlined">people</span>}
              trend={{ value: `+${stats.newUsersThisMonth}`, isPositive: true }}
              clickable
              onClick={() => setSelectedModal('users')}
            />
            <StatCard
              title="Active Trips"
              value={stats.activeTrips}
              subtitle={`${stats.upcomingTrips} upcoming`}
              icon={<span className="material-symbols-outlined">flight_takeoff</span>}
              trend={{ value: '+12%', isPositive: true }}
              clickable
              onClick={() => setSelectedModal('trips')}
            />
            <StatCard
              title="Total Agencies"
              value={stats.totalAgencies}
              subtitle={`${stats.verifiedAgencies} verified, ${stats.basicAgencies} basic`}
              icon={<span className="material-symbols-outlined">business</span>}
              trend={{ value: '+5%', isPositive: true }}
              clickable
              onClick={() => setSelectedModal('agencies')}
            />
            <StatCard
              title="Total Bookings"
              value={stats.totalBookings.toLocaleString()}
              subtitle={`$${(stats.revenue / 1000).toFixed(0)}k revenue`}
              icon={<span className="material-symbols-outlined">bookmark</span>}
              trend={{ value: '+18%', isPositive: true }}
            />
          </div>
        </section>

        {/* Agency Breakdown */}
        <section>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              title="Verified Agencies"
              value={stats.verifiedAgencies}
              subtitle="Fully verified and active"
              icon={<span className="material-symbols-outlined text-emerald-500">verified</span>}
              variant="highlight"
              clickable
              onClick={() => setSelectedModal('verified')}
              className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-500/10 dark:to-emerald-500/5 border-emerald-200 dark:border-emerald-500/20"
            />
            <StatCard
              title="Basic Agencies"
              value={stats.basicAgencies}
              subtitle="Pending verification"
              icon={<span className="material-symbols-outlined text-amber-500">pending</span>}
              clickable
              onClick={() => setSelectedModal('basic')}
              className="bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-500/10 dark:to-amber-500/5 border-amber-200 dark:border-amber-500/20"
            />
            <StatCard
              title="Pending Verifications"
              value={stats.pendingVerifications}
              subtitle="Requires approval"
              icon={<span className="material-symbols-outlined text-blue-500">schedule</span>}
              trend={{ value: '-2', isPositive: false }}
              className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-500/10 dark:to-blue-500/5 border-blue-200 dark:border-blue-500/20"
            />
          </div>
        </section>

        {/* Quick Stats Row */}
        <section>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <RoundedBox padding="md" className="text-center">
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">New Users Today</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">23</p>
            </RoundedBox>
            <RoundedBox padding="md" className="text-center">
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Trips Created Today</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">8</p>
            </RoundedBox>
            <RoundedBox padding="md" className="text-center">
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Bookings Today</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">45</p>
            </RoundedBox>
            <RoundedBox padding="md" className="text-center">
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Revenue Today</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">$12.4k</p>
            </RoundedBox>
          </div>
        </section>

        {/* Recent Activity */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RoundedBox padding="lg">
            <SectionHeader title="Recent Users" action={{ label: 'View All', href: '/admin/users' }} className="mb-4" />
            <div className="space-y-3">
              {recentUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-700/30 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary">person</span>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">{user.name}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500 dark:text-slate-400">{user.joined}</p>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400">
                      {user.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </RoundedBox>

          <RoundedBox padding="lg">
            <SectionHeader title="Recent Trips" action={{ label: 'View All', href: '/admin/trips' }} className="mb-4" />
            <div className="space-y-3">
              {recentTrips.map((trip) => (
                <div
                  key={trip.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-700/30 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-blue-500">flight_takeoff</span>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">{trip.title}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{trip.agency}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{trip.price}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{trip.bookings} bookings</p>
                  </div>
                </div>
              ))}
            </div>
          </RoundedBox>
        </section>

        {/* Modals */}
        <DetailModal
          isOpen={selectedModal === 'users'}
          onClose={() => setSelectedModal(null)}
          title="All Users"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 mb-6">
              <RoundedBox padding="md" className="text-center">
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-1">Total</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalUsers.toLocaleString()}</p>
              </RoundedBox>
              <RoundedBox padding="md" className="text-center">
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-1">Active</p>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.activeUsers.toLocaleString()}</p>
              </RoundedBox>
              <RoundedBox padding="md" className="text-center">
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-1">New This Month</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">+{stats.newUsersThisMonth}</p>
              </RoundedBox>
            </div>
            <div className="space-y-2">
              {recentUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary text-xl">person</span>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">{user.name}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                      {user.role}
                    </span>
                    <span className="px-3 py-1 rounded-full text-sm font-semibold bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400">
                      {user.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
              <Button variant="outline" className="w-full">
                View All Users
              </Button>
            </div>
          </div>
        </DetailModal>

        <DetailModal
          isOpen={selectedModal === 'trips'}
          onClose={() => setSelectedModal(null)}
          title="Active Trips"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 mb-6">
              <RoundedBox padding="md" className="text-center">
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-1">Total</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalTrips}</p>
              </RoundedBox>
              <RoundedBox padding="md" className="text-center">
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-1">Active</p>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.activeTrips}</p>
              </RoundedBox>
              <RoundedBox padding="md" className="text-center">
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-1">Upcoming</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.upcomingTrips}</p>
              </RoundedBox>
            </div>
            <div className="space-y-2">
              {recentTrips.map((trip) => (
                <div
                  key={trip.id}
                  className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-blue-500 text-xl">flight_takeoff</span>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">{trip.title}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{trip.agency}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{trip.price}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{trip.bookings} bookings</p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-sm font-semibold bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400">
                      {trip.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
              <Button variant="outline" className="w-full">
                View All Trips
              </Button>
            </div>
          </div>
        </DetailModal>

        <DetailModal
          isOpen={selectedModal === 'agencies'}
          onClose={() => setSelectedModal(null)}
          title="All Agencies"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 mb-6">
              <RoundedBox padding="md" className="text-center">
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-1">Total</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalAgencies}</p>
              </RoundedBox>
              <RoundedBox padding="md" className="text-center">
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-1">Verified</p>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.verifiedAgencies}</p>
              </RoundedBox>
              <RoundedBox padding="md" className="text-center">
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-1">Basic</p>
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.basicAgencies}</p>
              </RoundedBox>
            </div>
            <div className="space-y-2">
              {agencies.map((agency) => (
                <Link
                  key={agency.id}
                  href={`/admin/agencies/${agency.id}`}
                  className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <Avatar src={agency.avatar} name={agency.name} size="md" />
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">{agency.name}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{agency.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="material-symbols-outlined text-amber-400 text-sm">star</span>
                        <span className="text-xs text-slate-600 dark:text-slate-400">
                          {agency.rating.toFixed(1)} ({agency.reviewCount} reviews)
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{agency.trips} trips</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Joined {agency.joined}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        agency.status === 'Verified'
                          ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400'
                          : 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400'
                      }`}
                    >
                      {agency.status}
                    </span>
                    <span className="material-symbols-outlined text-slate-400 dark:text-slate-500">
                      arrow_forward
                    </span>
                  </div>
                </Link>
              ))}
            </div>
            <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
              <Button variant="outline" className="w-full">
                View All Agencies
              </Button>
            </div>
          </div>
        </DetailModal>

        <DetailModal
          isOpen={selectedModal === 'verified'}
          onClose={() => setSelectedModal(null)}
          title="Verified Agencies"
        >
          <div className="space-y-4">
            <div className="mb-4">
              <p className="text-slate-600 dark:text-slate-400">
                These agencies have completed verification and are fully active on the platform.
              </p>
            </div>
            <div className="space-y-2">
              {agencies
                .filter((a) => a.status === 'Verified')
                .map((agency) => (
                  <Link
                    key={agency.id}
                    href={`/admin/agencies/${agency.id}`}
                    className="flex items-center justify-between p-4 rounded-xl border border-emerald-200 dark:border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-500/5 hover:bg-emerald-100/50 dark:hover:bg-emerald-500/10 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar src={agency.avatar} name={agency.name} size="md" />
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">{agency.name}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{agency.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="material-symbols-outlined text-amber-400 text-sm">star</span>
                          <span className="text-xs text-slate-600 dark:text-slate-400">
                            {agency.rating.toFixed(1)} ({agency.reviewCount} reviews)
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{agency.trips} active trips</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Joined {agency.joined}</p>
                      </div>
                      <span className="px-3 py-1 rounded-full text-sm font-semibold bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">verified</span>
                        Verified
                      </span>
                      <span className="material-symbols-outlined text-slate-400 dark:text-slate-500">
                        arrow_forward
                      </span>
                    </div>
                  </Link>
                ))}
            </div>
          </div>
        </DetailModal>

        <DetailModal
          isOpen={selectedModal === 'basic'}
          onClose={() => setSelectedModal(null)}
          title="Basic Agencies"
        >
          <div className="space-y-4">
            <div className="mb-4">
              <p className="text-slate-600 dark:text-slate-400">
                These agencies are registered but haven&apos;t completed verification yet. They have limited access to platform
                features.
              </p>
            </div>
            <div className="space-y-2">
              {agencies
                .filter((a) => a.status === 'Basic')
                .map((agency) => (
                  <Link
                    key={agency.id}
                    href={`/admin/agencies/${agency.id}`}
                    className="flex items-center justify-between p-4 rounded-xl border border-amber-200 dark:border-amber-500/20 bg-amber-50/50 dark:bg-amber-500/5 hover:bg-amber-100/50 dark:hover:bg-amber-500/10 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar src={agency.avatar} name={agency.name} size="md" />
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">{agency.name}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{agency.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="material-symbols-outlined text-amber-400 text-sm">star</span>
                          <span className="text-xs text-slate-600 dark:text-slate-400">
                            {agency.rating.toFixed(1)} ({agency.reviewCount} reviews)
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{agency.trips} trips</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Joined {agency.joined}</p>
                      </div>
                      <span className="px-3 py-1 rounded-full text-sm font-semibold bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400">
                        Basic
                      </span>
                      <span className="material-symbols-outlined text-slate-400 dark:text-slate-500">
                        arrow_forward
                      </span>
                    </div>
                  </Link>
                ))}
            </div>
          </div>
        </DetailModal>
      </main>
    </div>
  )
}
