'use client'

import { useEffect, useState, useCallback, useMemo, useRef, memo } from 'react'
import { TripCard } from '@/shared/components/ui'
import { TripDetailModal } from '@/shared/components/trips/TripDetailModal'
import { TripFilters, type TripFiltersState } from '@/features/trips/components/TripFilters'
import { Header, BottomNavigation } from '@/shared/components/layout'
import { IconButton, ThemeToggle } from '@/shared/components/ui'
import { LogoutButton } from '@/shared/components/auth/LogoutButton'
import { NavButton } from '@/shared/components/navigation'
import { useAuth } from '@/shared/contexts/AuthContext'
import { ROUTES, USER_ROLES } from '@/config/constants'
import { tripsService } from '@/services/trips.service'
import type { TripDTO } from '@/types/api/trips.types'

/** Server-side pagination: only this many trips per request; backend returns one page at a time. */
const PAGE_SIZE = 12
const SEARCH_DEBOUNCE_MS = 400

const VALID_ROLES = ['Traveler', 'Agency', 'Admin'] as const

/** Memoized card row so wishlist callback is stable per trip and list re-renders are minimal. */
const TripCardItem = memo(function TripCardItem({
  trip,
  wishlistActive,
  onWishlistToggle,
  onSelectTrip,
  showWishlist,
}: {
  trip: TripDTO
  wishlistActive: boolean
  onWishlistToggle: (slug: string) => void
  onSelectTrip: (slug: string) => void
  showWishlist: boolean
}) {
  const handleWishlistToggle = useCallback(() => {
    onWishlistToggle(trip.slug)
  }, [trip.slug, onWishlistToggle])

  const wishlistAction = useMemo(
    () =>
      showWishlist
        ? { active: wishlistActive, onToggle: handleWishlistToggle }
        : undefined,
    [showWishlist, wishlistActive, handleWishlistToggle]
  )

  const agency = useMemo(
    () => ({ name: trip.agency.name, verified: trip.agency.verified }),
    [trip.agency.name, trip.agency.verified]
  )

  const badge = useMemo(
    () =>
      trip.status
        ? { text: trip.status, status: trip.status as 'active' | 'pending' | 'completed' | 'cancelled' }
        : undefined,
    [trip.status]
  )

  return (
    <TripCard
      id={trip.slug}
      slug={trip.slug}
      title={trip.title}
      agency={agency}
      startDate={trip.startDate}
      endDate={trip.endDate}
      duration={trip.duration}
      price={trip.price}
      image={trip.images?.[0] ?? ''}
      images={trip.images}
      badge={badge}
      wishlistAction={wishlistAction}
      onSelectTrip={onSelectTrip}
    />
  )
})

export default function TripListingsClient() {
  const [searchQuery, setSearchQuery] = useState('')
  const { isAuthenticated, user, isLoading } = useAuth()

  const userRole = useMemo(
    () =>
      user?.role && VALID_ROLES.includes(user.role as (typeof VALID_ROLES)[number])
        ? user.role
        : null,
    [user?.role]
  )

  const storageKey = useMemo(() => (user ? `wishlist:${user.id}` : null), [user?.id])
  const [wishlist, setWishlist] = useState<string[]>([])

  const wishlistSet = useMemo(() => new Set(wishlist), [wishlist])

  useEffect(() => {
    if (typeof window === 'undefined' || !storageKey) return
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

  const toggleWishlist = useCallback(
    (slug: string) => {
      if (typeof window === 'undefined' || !storageKey) return
      setWishlist((prev) => {
        const next = prev.includes(slug) ? prev.filter((x) => x !== slug) : [...prev, slug]
        window.localStorage.setItem(storageKey, JSON.stringify(next))
        return next
      })
    },
    [storageKey]
  )

  const [trips, setTrips] = useState<TripDTO[]>([])
  const [tripsLoading, setTripsLoading] = useState(true)
  const [tripsError, setTripsError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalTrips, setTotalTrips] = useState(0)

  const [filters, setFilters] = useState<TripFiltersState>({
    sortBy: 'date',
    sortOrder: 'desc',
  })
  const [tripDetailSlug, setTripDetailSlug] = useState<string | null>(null)

  const [searchDebounced, setSearchDebounced] = useState('')
  useEffect(() => {
    const t = setTimeout(() => setSearchDebounced(searchQuery), SEARCH_DEBOUNCE_MS)
    return () => clearTimeout(t)
  }, [searchQuery])

  const filterDeps = useMemo(
    () => ({
      searchDebounced,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
      startDate: filters.startDate,
      endDate: filters.endDate,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      duration: filters.duration,
      agencyId: filters.agencyId,
    }),
    [
      searchDebounced,
      filters.sortBy,
      filters.sortOrder,
      filters.startDate,
      filters.endDate,
      filters.minPrice,
      filters.maxPrice,
      filters.duration,
      filters.agencyId,
    ]
  )

  useEffect(() => {
    setCurrentPage(1)
  }, [filterDeps])

  const abortRef = useRef<AbortController | null>(null)

  const fetchTrips = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort()
    }
    abortRef.current = new AbortController()
    const signal = abortRef.current.signal

    setTripsLoading(true)
    setTripsError(null)
    const params: Record<string, string | number | undefined> = {
      page: currentPage,
      limit: PAGE_SIZE,
      sortBy: filters.sortBy ?? 'date',
      sortOrder: filters.sortOrder ?? 'desc',
    }
    if (searchDebounced.trim()) params.destination = searchDebounced.trim()
    if (filters.startDate) params.startDate = filters.startDate
    if (filters.endDate) params.endDate = filters.endDate
    if (filters.minPrice != null) params.minPrice = filters.minPrice
    if (filters.maxPrice != null) params.maxPrice = filters.maxPrice
    if (filters.duration != null) params.duration = filters.duration
    if (filters.agencyId) params.agencyId = filters.agencyId

    tripsService
      .getTrips(params, { signal })
      .then((res) => {
        if (signal.aborted) return
        const payload = res?.data
        setTrips(Array.isArray(payload?.trips) ? payload.trips : [])
        setTotalTrips(typeof payload?.total === 'number' ? payload.total : 0)
        setTotalPages(typeof payload?.totalPages === 'number' ? payload.totalPages : 1)
      })
      .catch((err) => {
        if (signal.aborted || err?.name === 'AbortError') return
        setTripsError(
          err?.response?.data?.message ?? err?.message ?? 'Failed to load trips'
        )
      })
      .finally(() => {
        if (!signal.aborted) setTripsLoading(false)
        abortRef.current = null
      })
  }, [
    currentPage,
    searchDebounced,
    filters.sortBy,
    filters.sortOrder,
    filters.startDate,
    filters.endDate,
    filters.minPrice,
    filters.maxPrice,
    filters.duration,
    filters.agencyId,
  ])

  useEffect(() => {
    fetchTrips()
    return () => {
      if (abortRef.current) abortRef.current.abort()
    }
  }, [fetchTrips])

  const handleCloseDetailModal = useCallback(() => {
    setTripDetailSlug(null)
  }, [])

  const handlePrevPage = useCallback(() => {
    setCurrentPage((p) => Math.max(1, p - 1))
  }, [])

  const handleNextPage = useCallback(() => {
    setCurrentPage((p) => Math.min(totalPages, p + 1))
  }, [totalPages])

  const bottomNavItems = useMemo(() => {
    const base = [{ href: '/trips', icon: 'explore' as const, label: 'Explore' }]
    if (isLoading) return base
    if (isAuthenticated && userRole === USER_ROLES.TRAVELER) {
      return [
        ...base,
        { href: ROUTES.DASHBOARD.TRAVELER, icon: 'dashboard' as const, label: 'Dashboard' },
        { href: user ? `/travelers/${user.id}` : '/profile', icon: 'person' as const, label: 'Profile' },
      ]
    }
    if (isAuthenticated && userRole === USER_ROLES.AGENCY) {
      return [...base, { href: ROUTES.DASHBOARD.AGENCY, icon: 'dashboard' as const, label: 'Dashboard' }]
    }
    if (isAuthenticated && userRole === USER_ROLES.ADMIN) {
      return [...base, { href: ROUTES.DASHBOARD.ADMIN, icon: 'dashboard' as const, label: 'Dashboard' }]
    }
    return [...base, { href: ROUTES.LOGIN, icon: 'login' as const, label: 'Login' }]
  }, [isLoading, isAuthenticated, userRole, user?.id])

  return (
    <div className="relative flex h-full min-h-screen w-full flex-col overflow-x-hidden pb-24 md:pb-8 bg-background-light dark:bg-background-dark text-slate-900 dark:text-white">
      <div className="max-w-7xl mx-auto w-full">
        {/* Header */}
        <Header
          title="Tripster"
          titleHref="/"
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
          <TripFilters filters={filters} onFiltersChange={setFilters} />
        </div>

        {/* Trip Listings */}
        <div className="flex flex-col gap-5 p-4 md:p-8 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-6">
          {tripsLoading && <p className="text-slate-500 dark:text-slate-400 col-span-full">Loading trips…</p>}
          {tripsError && <p className="text-red-500 dark:text-red-400 col-span-full">{tripsError}</p>}
          {!tripsLoading &&
            trips.map((trip) => (
              <TripCardItem
                key={trip.id}
                trip={trip}
                wishlistActive={wishlistSet.has(trip.slug)}
                onWishlistToggle={toggleWishlist}
                onSelectTrip={setTripDetailSlug}
                showWishlist={
                  !isLoading &&
                  !!isAuthenticated &&
                  userRole === USER_ROLES.TRAVELER &&
                  !!user
                }
              />
            ))}
        </div>

        {/* Server-side pagination */}
        {!tripsLoading && totalPages > 1 && (
          <nav
            className="flex flex-wrap items-center justify-center gap-3 px-4 py-6 md:px-8"
            aria-label="Trip list pagination"
          >
            <button
              type="button"
              onClick={handlePrevPage}
              disabled={currentPage <= 1}
              className="inline-flex items-center gap-1 rounded-xl border border-slate-200 dark:border-border-dark bg-white dark:bg-card-dark px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
              Previous
            </button>
            <span className="text-sm text-slate-600 dark:text-slate-400">
              Page {currentPage} of {totalPages}
              {totalTrips > 0 && (
                <span className="ml-1 text-slate-500 dark:text-slate-500">
                  ({totalTrips} total)
                </span>
              )}
            </span>
            <button
              type="button"
              onClick={handleNextPage}
              disabled={currentPage >= totalPages}
              className="inline-flex items-center gap-1 rounded-xl border border-slate-200 dark:border-border-dark bg-white dark:bg-card-dark px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
            >
              Next
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </nav>
        )}

        <TripDetailModal
          slug={tripDetailSlug}
          isOpen={tripDetailSlug != null}
          onClose={handleCloseDetailModal}
        />
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation items={bottomNavItems} variant="default" />
    </div>
  )
}
