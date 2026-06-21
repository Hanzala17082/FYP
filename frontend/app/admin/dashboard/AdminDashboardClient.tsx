'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { Header } from '@/shared/components/layout'
import { StatCard, SectionHeader } from '@/shared/components/ui'
import { RoundedBox } from '@/shared/components/ui/RoundedBox'
import { Button } from '@/shared/components/ui/Button'
import { AdminHeaderActions } from '@/shared/components/admin/AdminHeaderActions'
import { dashboardService, type AdminDashboardStats } from '@/services/dashboard.service'
import { adminService } from '@/services/admin.service'
import { useCurrency } from '@/shared/contexts/CurrencyContext'
import { ROUTES } from '@/config/constants'
import { StatSkeleton, ListRowSkeleton } from './components/AdminSkeletons'
import { RecentUserRow, RecentTripRow } from './components/RecentRows'
import {
  DetailModal,
  AgencyModalList,
  PendingVerificationList,
  mapAgencySummary,
} from './components/AdminDashboardModals'

const INITIAL_STATS: AdminDashboardStats = {
  totalUsers: 0,
  activeUsers: 0,
  newUsersThisMonth: 0,
  totalTrips: 0,
  activeTrips: 0,
  upcomingTrips: 0,
  totalAgencies: 0,
  verifiedAgencies: 0,
  basicAgencies: 0,
  pendingVerifications: 0,
  totalBookings: 0,
  revenue: 0,
  verificationFees: 0,
  tripListingFees: 0,
  newUsersToday: 0,
  tripsCreatedToday: 0,
  bookingsToday: 0,
  revenueToday: 0,
}

type ModalKey = 'users' | 'trips' | 'agencies' | 'verified' | 'basic' | 'pending' | null

export default function AdminDashboardClient() {
  const { formatPrice } = useCurrency()
  const [selectedModal, setSelectedModal] = useState<ModalKey>(null)
  const [stats, setStats] = useState<AdminDashboardStats>(INITIAL_STATS)
  const [recentUsers, setRecentUsers] = useState<
    Array<{ id: string; name: string; email: string; role: string; joined: string; status: string }>
  >([])
  const [recentTripsRaw, setRecentTripsRaw] = useState<
    Array<{ id: string; title: string; agency: string; status: string; bookings: number; price: number }>
  >([])
  const [agencies, setAgencies] = useState<ReturnType<typeof mapAgencySummary>[]>([])
  const [agenciesLoading, setAgenciesLoading] = useState(false)
  const [reviewBusyId, setReviewBusyId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    dashboardService
      .getAdminDashboard()
      .then((dash) => {
        if (cancelled) return
        setStats(dash.stats)
        setRecentUsers(
          dash.recentUsers.slice(0, 3).map((u) => ({
            id: u.id,
            name: u.fullName,
            email: u.email,
            role: u.role,
            joined: u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '',
            status: 'Active',
          }))
        )
        setRecentTripsRaw(
          dash.recentTrips.slice(0, 3).map((t) => ({
            id: t.id,
            title: t.title,
            agency: t.agency?.name ?? '',
            status: t.status ?? 'active',
            bookings: t.bookingCount ?? 0,
            price: Number(t.price ?? 0),
          }))
        )
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const needsAgencies =
    selectedModal === 'agencies' ||
    selectedModal === 'verified' ||
    selectedModal === 'basic' ||
    selectedModal === 'pending'

  const loadAgencies = useCallback(() => {
    setAgenciesLoading(true)
    return adminService
      .getAgencies()
      .then((res) => setAgencies(res.agencies.map(mapAgencySummary)))
      .catch(() => setAgencies([]))
      .finally(() => setAgenciesLoading(false))
  }, [])

  useEffect(() => {
    if (!needsAgencies || agencies.length > 0) return
    void loadAgencies()
  }, [needsAgencies, agencies.length, loadAgencies])

  const refreshStats = useCallback(() => {
    return dashboardService
      .getAdminDashboard()
      .then((dash) => setStats(dash.stats))
      .catch(() => {})
  }, [])

  const handleReview = useCallback(
    async (agencyId: string, action: 'approve' | 'reject') => {
      setReviewBusyId(agencyId)
      try {
        await adminService.reviewAgencyVerification(agencyId, action)
        await Promise.all([loadAgencies(), refreshStats()])
      } catch {
        // Error surfaced by disabled state resetting; keep UI simple for FYP demo.
      } finally {
        setReviewBusyId(null)
      }
    },
    [loadAgencies, refreshStats]
  )

  const recentTrips = useMemo(
    () => recentTripsRaw.map((t) => ({ ...t, priceLabel: formatPrice(t.price) })),
    [recentTripsRaw, formatPrice]
  )

  const closeModal = useCallback(() => setSelectedModal(null), [])

  const statGrid = 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4'
  const dailyGrid = 'grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4'

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen">
      <Header
        title="Tripster Admin"
        subtitle="Admin Dashboard"
        variant="light"
        showThemeToggle={false}
        rightAction={<AdminHeaderActions />}
      />

      <main className="flex flex-col w-full max-w-7xl mx-auto p-4 sm:p-5 md:p-8 space-y-5 sm:space-y-6">
        <section>
          {loading ? (
            <div className={statGrid}>
              {Array.from({ length: 4 }).map((_, i) => (
                <StatSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className={statGrid}>
              <StatCard
                title="Total Users"
                value={stats.totalUsers.toLocaleString()}
                subtitle={`${stats.activeUsers.toLocaleString()} active`}
                icon={<span className="material-symbols-outlined">people</span>}
                trend={
                  stats.newUsersThisMonth > 0
                    ? { value: `+${stats.newUsersThisMonth} this month`, isPositive: true }
                    : undefined
                }
                clickable
                onClick={() => setSelectedModal('users')}
              />
              <StatCard
                title="Active Trips"
                value={stats.activeTrips}
                subtitle={`${stats.upcomingTrips} upcoming`}
                icon={<span className="material-symbols-outlined">flight_takeoff</span>}
                clickable
                onClick={() => setSelectedModal('trips')}
              />
              <StatCard
                title="Total Agencies"
                value={stats.totalAgencies}
                subtitle={`${stats.verifiedAgencies} verified, ${stats.basicAgencies} basic`}
                icon={<span className="material-symbols-outlined">business</span>}
                clickable
                onClick={() => setSelectedModal('agencies')}
              />
              <StatCard
                title="Total Bookings"
                value={stats.totalBookings.toLocaleString()}
                subtitle={`${formatPrice(stats.revenue)} platform revenue`}
                icon={<span className="material-symbols-outlined">bookmark</span>}
              />
            </div>
          )}
        </section>

        <section>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <StatCard
              title="Verified Agencies"
              value={loading ? '…' : stats.verifiedAgencies}
              subtitle="Fully verified and active"
              icon={<span className="material-symbols-outlined text-emerald-500">verified</span>}
              variant="highlight"
              clickable
              onClick={() => setSelectedModal('verified')}
              className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-500/10 dark:to-emerald-500/5 border-emerald-200 dark:border-emerald-500/20"
            />
            <StatCard
              title="Basic Agencies"
              value={loading ? '…' : stats.basicAgencies}
              subtitle="Pending verification"
              icon={<span className="material-symbols-outlined text-amber-500">pending</span>}
              clickable
              onClick={() => setSelectedModal('basic')}
              className="bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-500/10 dark:to-amber-500/5 border-amber-200 dark:border-amber-500/20"
            />
            <StatCard
              title="Pending Verifications"
              value={loading ? '…' : stats.pendingVerifications}
              subtitle="Requires approval"
              icon={<span className="material-symbols-outlined text-blue-500">schedule</span>}
              clickable
              onClick={() => setSelectedModal('pending')}
              className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-500/10 dark:to-blue-500/5 border-blue-200 dark:border-blue-500/20"
            />
          </div>
        </section>

        <section>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <StatCard
              title="Platform Revenue"
              value={loading ? '…' : formatPrice(stats.revenue)}
              subtitle="Total fees collected"
              icon={<span className="material-symbols-outlined text-emerald-500">account_balance</span>}
              variant="highlight"
            />
            <StatCard
              title="Verification Fees"
              value={loading ? '…' : formatPrice(stats.verificationFees)}
              subtitle="From verified agencies"
              icon={<span className="material-symbols-outlined">workspace_premium</span>}
            />
            <StatCard
              title="Trip Listing Fees"
              value={loading ? '…' : formatPrice(stats.tripListingFees)}
              subtitle="From posted trips"
              icon={<span className="material-symbols-outlined">receipt_long</span>}
            />
          </div>
        </section>

        <section>
          <div className={dailyGrid}>
            {[
              { label: 'New Users Today', value: loading ? '…' : stats.newUsersToday },
              { label: 'Trips Created Today', value: loading ? '…' : stats.tripsCreatedToday },
              { label: 'Bookings Today', value: loading ? '…' : stats.bookingsToday },
              {
                label: 'Revenue Today',
                value: loading ? '…' : formatPrice(stats.revenueToday),
              },
            ].map((item) => (
              <RoundedBox key={item.label} padding="md" className="text-center min-w-0">
                <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-medium mb-1 truncate">
                  {item.label}
                </p>
                <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tabular-nums truncate">
                  {item.value}
                </p>
              </RoundedBox>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <RoundedBox padding="lg">
            <SectionHeader
              title="Recent Users"
              action={{ label: 'View All', href: ROUTES.ADMIN_USERS }}
              className="mb-4"
            />
            <div className="space-y-3">
              {loading ? (
                <>
                  <ListRowSkeleton />
                  <ListRowSkeleton />
                  <ListRowSkeleton />
                </>
              ) : recentUsers.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400 py-4 text-center">No users yet.</p>
              ) : (
                recentUsers.map((user) => (
                  <RecentUserRow
                    key={user.id}
                    id={user.id}
                    name={user.name}
                    email={user.email}
                    joined={user.joined}
                    status={user.status}
                  />
                ))
              )}
            </div>
          </RoundedBox>

          <RoundedBox padding="lg">
            <SectionHeader
              title="Recent Trips"
              action={{ label: 'View All', href: ROUTES.ADMIN_TRIPS }}
              className="mb-4"
            />
            <div className="space-y-3">
              {loading ? (
                <>
                  <ListRowSkeleton />
                  <ListRowSkeleton />
                  <ListRowSkeleton />
                </>
              ) : recentTrips.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400 py-4 text-center">No trips yet.</p>
              ) : (
                recentTrips.map((trip) => (
                  <RecentTripRow
                    key={trip.id}
                    title={trip.title}
                    agency={trip.agency}
                    price={trip.priceLabel}
                    bookings={trip.bookings}
                  />
                ))
              )}
            </div>
          </RoundedBox>
        </section>

        {selectedModal && (
          <DetailModal
            isOpen={!!selectedModal}
            onClose={closeModal}
            title={
              selectedModal === 'users'
                ? 'All Users'
                : selectedModal === 'trips'
                  ? 'Active Trips'
                  : selectedModal === 'verified'
                    ? 'Verified Agencies'
                    : selectedModal === 'basic'
                      ? 'Basic Agencies'
                      : selectedModal === 'pending'
                        ? 'Pending Verifications'
                        : 'All Agencies'
            }
          >
            {selectedModal === 'users' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  <RoundedBox padding="md" className="text-center">
                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-1">Total</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalUsers.toLocaleString()}</p>
                  </RoundedBox>
                  <RoundedBox padding="md" className="text-center">
                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-1">Active</p>
                    <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                      {stats.activeUsers.toLocaleString()}
                    </p>
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
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 border border-slate-200 dark:border-slate-700"
                    >
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">{user.name}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
                      </div>
                      <span className="px-3 py-1 text-sm font-medium bg-slate-100 dark:bg-slate-700">{user.role}</span>
                    </div>
                  ))}
                </div>
                <Link href={ROUTES.ADMIN_USERS}>
                  <Button variant="outline" className="w-full">
                    View All Users
                  </Button>
                </Link>
              </div>
            )}

            {selectedModal === 'trips' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  <RoundedBox padding="md" className="text-center">
                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-1">Total</p>
                    <p className="text-2xl font-bold">{stats.totalTrips}</p>
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
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 border border-slate-200 dark:border-slate-700"
                    >
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">{trip.title}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{trip.agency}</p>
                      </div>
                      <p className="text-sm font-semibold">{trip.priceLabel}</p>
                    </div>
                  ))}
                </div>
                <Link href={ROUTES.ADMIN_TRIPS}>
                  <Button variant="outline" className="w-full">
                    View All Trips
                  </Button>
                </Link>
              </div>
            )}

            {(selectedModal === 'agencies' || selectedModal === 'verified' || selectedModal === 'basic') && (
              <div className="space-y-4">
                {agenciesLoading ? (
                  <p className="text-sm text-slate-500 py-8 text-center">Loading agencies…</p>
                ) : (
                  <AgencyModalList
                    agencies={agencies}
                    filter={selectedModal === 'verified' ? 'Verified' : selectedModal === 'basic' ? 'Basic' : undefined}
                    variant={selectedModal === 'verified' ? 'verified' : selectedModal === 'basic' ? 'basic' : 'default'}
                  />
                )}
              </div>
            )}

            {selectedModal === 'pending' && (
              <div className="space-y-4">
                {agenciesLoading ? (
                  <p className="text-sm text-slate-500 py-8 text-center">Loading agencies…</p>
                ) : (
                  <PendingVerificationList
                    agencies={agencies}
                    busyId={reviewBusyId}
                    onReview={handleReview}
                  />
                )}
              </div>
            )}
          </DetailModal>
        )}
      </main>
    </div>
  )
}
