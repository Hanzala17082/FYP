'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/shared/contexts/AuthContext'
import { Header, BottomNavigation } from '@/shared/components/layout'
import { Avatar, Button, RoundedBox, SectionHeader, Input, AlertBox, StatCard, StatusBadge } from '@/shared/components/ui'
import { LogoutButton } from '@/shared/components/auth/LogoutButton'
import { ThemeToggle } from '@/shared/components/ui/ThemeToggle'
import { NavButton } from '@/shared/components/navigation'
import { ROUTES, USER_ROLES } from '@/config/constants'
import { dashboardService } from '@/services/dashboard.service'
import { bookingsService } from '@/services/bookings.service'
import { agenciesService } from '@/services/agencies.service'
import { tripsService } from '@/services/trips.service'
import { BookingCard } from '@/shared/components/ui'
import type { BookingDTO } from '@/types/api/bookings.types'
import type { TripDTO } from '@/types/api/trips.types'
import Link from 'next/link'

type ProfileTab = 'overview' | 'trips' | 'myTrips' | 'wishlist' | 'personal' | 'wallet' | 'complaints' | 'settings'
type TravelerKpiKind = 'completed' | 'enrolled' | 'pending' | 'rejected'

export default function UserProfileClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, setUser, logout } = useAuth()
  const [activeTab, setActiveTab] = useState<ProfileTab>('overview')
  const [fullName, setFullName] = useState(user?.fullName || '')
  const [city, setCity] = useState(user?.city || '')
  const [avatar, setAvatar] = useState(user?.avatar || '')
  const [showSavedBanner, setShowSavedBanner] = useState(false)
  const [agencyTrips, setAgencyTrips] = useState<TripDTO[]>([])
  const [travelerBookings, setTravelerBookings] = useState<BookingDTO[]>([])
  const [wishlistTrips, setWishlistTrips] = useState<TripDTO[]>([])
  const [profileLoading, setProfileLoading] = useState(true)
  const [isAddingTrip, setIsAddingTrip] = useState(false)
  const [newTrip, setNewTrip] = useState({
    title: '',
    destination: '',
    startDate: '',
    endDate: '',
    duration: 1,
    price: 0,
  })
  const [tripImages, setTripImages] = useState<string[]>([])
  // Track request statuses: requestId -> status
  const [requestStatuses, setRequestStatuses] = useState<Record<string, 'pending' | 'confirmed' | 'rejected'>>({})
  const wishlistStorageKey = useMemo(() => (user ? `wishlist:${user.id}` : null), [user])
  const [wishlist, setWishlist] = useState<string[]>([])
  const [travelerKpiModal, setTravelerKpiModal] = useState<TravelerKpiKind | null>(null)

  useEffect(() => {
    if (!user) return
    let cancelled = false
    setProfileLoading(true)
    if (user.role === USER_ROLES.TRAVELER) {
      Promise.all([
        bookingsService.getBookings().then((res) => res.data?.bookings ?? []),
        tripsService.getTrips({ limit: 100 }).then((res) => res.data?.trips ?? []),
      ])
        .then(([bookings, trips]) => {
          if (!cancelled) {
            setTravelerBookings(bookings)
            setWishlistTrips(trips)
          }
        })
        .catch(() => { if (!cancelled) setTravelerBookings([]); setWishlistTrips([]) })
        .finally(() => { if (!cancelled) setProfileLoading(false) })
    } else if (user.role === USER_ROLES.AGENCY) {
      dashboardService
        .getAgencyDashboard()
        .then((dash) => {
          if (cancelled) return
          const agencyId = dash.agency?.id
          if (agencyId) {
            return agenciesService.getAgencyTrips(agencyId).then((res) => (res.data?.trips ?? [])).then(setAgencyTrips)
          }
        })
        .catch(() => { if (!cancelled) setAgencyTrips([]) })
        .finally(() => { if (!cancelled) setProfileLoading(false) })
    } else {
      setProfileLoading(false)
    }
    return () => { cancelled = true }
  }, [user?.id, user?.role])

  // Support deep-linking to a specific tab (e.g. /dashboard?tab=personal)
  useEffect(() => {
    const tab = searchParams?.get('tab')
    if (!tab) return
    const allowed: ProfileTab[] = ['overview', 'trips', 'myTrips', 'wishlist', 'personal', 'wallet', 'complaints', 'settings']
    if (allowed.includes(tab as ProfileTab)) {
      setActiveTab(tab as ProfileTab)
    }
  }, [searchParams])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!wishlistStorageKey) return
    const raw = window.localStorage.getItem(wishlistStorageKey)
    if (raw) {
      try {
        setWishlist(JSON.parse(raw))
      } catch {
        setWishlist([])
      }
    } else {
      setWishlist([])
    }
  }, [wishlistStorageKey])

  const removeFromWishlist = (slug: string) => {
    if (typeof window === 'undefined') return
    if (!wishlistStorageKey) return
    setWishlist((prev) => {
      const next = prev.filter((x) => x !== slug)
      window.localStorage.setItem(wishlistStorageKey, JSON.stringify(next))
      return next
    })
  }

  const handleAcceptRequest = (requestId: string) => {
    setRequestStatuses((prev) => ({
      ...prev,
      [requestId]: 'confirmed',
    }))
  }

  const handleRejectRequest = (requestId: string) => {
    setRequestStatuses((prev) => ({
      ...prev,
      [requestId]: 'rejected',
    }))
  }

  // Hooks must run before any early return
  const travelerBookingRows = useMemo(() => {
    if (!user || user.role !== USER_ROLES.TRAVELER) return []
    return travelerBookings
      .filter((b) => b.trip)
      .map((b) => ({ booking: b, trip: b.trip! }))
  }, [user, travelerBookings])

  const travelerKpis = useMemo(() => {
    if (!user || user.role !== USER_ROLES.TRAVELER) {
      return { completed: [], enrolled: [], pending: [], rejected: [] } as const
    }
    const now = Date.now()
    const confirmed = travelerBookingRows.filter((r) => r.booking.status === 'confirmed')
    const completed = confirmed.filter((r) => new Date(r.trip.endDate).getTime() < now)
    const enrolled = confirmed.filter((r) => new Date(r.trip.endDate).getTime() >= now)
    const pending = travelerBookingRows.filter((r) => r.booking.status === 'pending')
    const rejected = travelerBookingRows.filter((r) => r.booking.status === 'rejected')
    return { completed, enrolled, pending, rejected } as const
  }, [travelerBookingRows, user])

  const modalConfig = useMemo(() => {
    const map: Record<
      TravelerKpiKind,
      { title: string; subtitle: string; badge: 'completed' | 'confirmed' | 'pending' | 'rejected' }
    > = {
      completed: {
        title: 'Completed Trips',
        subtitle: 'Trips you have finished (private dashboard view)',
        badge: 'completed',
      },
      enrolled: {
        title: 'Enrolled Trips',
        subtitle: 'Confirmed trips that are upcoming or ongoing',
        badge: 'confirmed',
      },
      pending: {
        title: 'Requests Sent',
        subtitle: 'Trips you requested to join (awaiting approval)',
        badge: 'pending',
      },
      rejected: {
        title: 'Rejected Requests',
        subtitle: 'Requests that were rejected',
        badge: 'rejected',
      },
    }
    return map
  }, [])

  if (!user) {
    router.push(ROUTES.LOGIN)
    return null
  }

  const handleSaveProfile = () => {
    setUser({
      ...user,
      fullName: fullName.trim() || user.fullName,
      city: city.trim() || undefined,
      avatar: avatar.trim() || undefined,
      updatedAt: new Date().toISOString(),
    })
    setShowSavedBanner(true)
    setTimeout(() => setShowSavedBanner(false), 3000)
  }

  const roleLabel =
    user.role === USER_ROLES.TRAVELER
      ? 'Traveler'
      : user.role === USER_ROLES.AGENCY
        ? 'Agency'
        : 'Admin'

  const renderSidebar = () => (
    <aside className="hidden md:flex md:flex-col md:w-64 md:border-r md:border-slate-200 dark:md:border-slate-800 md:py-8 md:px-6 md:gap-4">
      <div className="flex items-center gap-3 mb-6">
        <Avatar src={avatar || user.avatar} name={fullName || user.fullName} size="lg" />
        <div>
          <p className="text-slate-900 dark:text-white font-semibold">{fullName || user.fullName}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
        </div>
      </div>
      <nav className="flex flex-col gap-1 text-sm">
        {[
          { id: 'overview', label: 'Overview', icon: 'dashboard' },
          ...(user.role === USER_ROLES.TRAVELER
            ? [
                { id: 'myTrips', label: 'My Trips', icon: 'flight' as const },
                { id: 'wishlist', label: 'Wishlist', icon: 'favorite' as const },
              ]
            : []),
          ...(user.role === USER_ROLES.AGENCY
            ? [{ id: 'trips', label: 'Trips & Requests', icon: 'flight' as const }]
            : []),
          { id: 'personal', label: 'Personal Info', icon: 'badge' },
          { id: 'wallet', label: 'Wallet', icon: 'account_balance_wallet' },
          { id: 'complaints', label: 'Complaints', icon: 'report' },
          { id: 'settings', label: 'Settings & Security', icon: 'settings' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as ProfileTab)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-left transition-colors ${
              activeTab === tab.id
                ? 'bg-primary/10 text-primary'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
            <span className="font-medium">{tab.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  )

  const renderOverview = () => (
    <div className="space-y-6">
      <SectionHeader title="Account Overview" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Account Type"
          value={roleLabel}
          subtitle={user.city || 'Global traveler'}
          icon={<span className="material-symbols-outlined">verified_user</span>}
        />
        <StatCard
          title="Member Since"
          value={new Date(user.createdAt).toLocaleDateString()}
          subtitle="Welcome to Tripster"
          icon={<span className="material-symbols-outlined">calendar_month</span>}
        />
        <StatCard
          title="Last Updated"
          value={new Date(user.updatedAt).toLocaleDateString()}
          subtitle="Last updated"
          icon={<span className="material-symbols-outlined">update</span>}
        />
      </div>

      {/* Traveler dashboard metrics */}
      {user.role === USER_ROLES.TRAVELER && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            title="Trips Completed"
            value={travelerKpis.completed.length}
            subtitle="Past trips"
            icon={<span className="material-symbols-outlined">flag</span>}
            clickable
            onClick={() => setTravelerKpiModal('completed')}
          />
          <StatCard
            title="Currently Enrolled"
            value={travelerKpis.enrolled.length}
            subtitle="Upcoming/ongoing"
            icon={<span className="material-symbols-outlined">flight_takeoff</span>}
            clickable
            onClick={() => setTravelerKpiModal('enrolled')}
          />
          <StatCard
            title="Requests Sent"
            value={travelerKpis.pending.length}
            subtitle="Awaiting approval"
            icon={<span className="material-symbols-outlined">outbox</span>}
            clickable
            onClick={() => setTravelerKpiModal('pending')}
          />
          <StatCard
            title="Rejected"
            value={travelerKpis.rejected.length}
            subtitle="Not approved"
            icon={<span className="material-symbols-outlined">block</span>}
            clickable
            onClick={() => setTravelerKpiModal('rejected')}
          />
        </div>
      )}

      {/* Agency-specific dashboard metrics (moved from old agency dashboard) */}
      {user.role === USER_ROLES.AGENCY && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            title="Total Revenue"
            value="$124,500"
            subtitle="vs. last month"
            icon={<span className="material-symbols-outlined">payments</span>}
            trend={{ value: '+12%', isPositive: true }}
            className="col-span-2 md:col-span-1"
          />
          <StatCard
            title="Bookings"
            value="84"
            subtitle="All-time"
            icon={<span className="material-symbols-outlined">event_seat</span>}
            trend={{ value: '5%', isPositive: true }}
          />
          <StatCard
            title="Active Trips"
            value="12"
            subtitle="Currently live"
            icon={<span className="material-symbols-outlined">flight_takeoff</span>}
            trend={{ value: '0%', isPositive: false }}
          />
          <StatCard
            title="Pending Requests"
            value="8"
            subtitle="Awaiting action"
            icon={<span className="material-symbols-outlined">pending_actions</span>}
            trend={{ value: '-2%', isPositive: false }}
          />
        </div>
      )}
    </div>
  )

  const renderPersonalInfo = () => (
    <div className="space-y-6">
      <SectionHeader title="Personal Information" />
      <div className="flex flex-col md:flex-row gap-6 items-start">
        <div className="flex flex-col items-center gap-3">
          <Avatar src={avatar || user.avatar} name={fullName || user.fullName} size="xl" />
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const url = prompt('Enter a new avatar image URL', avatar || user.avatar || '')
              if (url !== null) setAvatar(url.trim())
            }}
          >
            <span className="material-symbols-outlined text-[18px]">image</span>
            Change Avatar
          </Button>
        </div>
        <div className="flex-1 space-y-4">
          <RoundedBox padding="lg" className="space-y-4">
            <Input
              label="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700"
            />
            <Input
              label="Email Address"
              value={user.email}
              disabled
              className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-dashed border-slate-200 dark:border-slate-700"
            />
            <Input
              label="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700"
            />
            <Button
              variant="primary"
              className="mt-2"
              onClick={handleSaveProfile}
            >
              <span className="material-symbols-outlined text-[18px]">save</span>
              Save Changes
            </Button>
          </RoundedBox>
        </div>
      </div>
    </div>
  )

  const renderAgencyTrips = () => (
    <div className="space-y-6">
      <SectionHeader title="Trips & Requests" />

      {user.role === USER_ROLES.AGENCY && (
        <div className="flex justify-between items-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Manage your posted trips and see who has requested to join.
          </p>
          <Button
            variant="primary"
            size="sm"
            className="h-10"
            onClick={() => setIsAddingTrip((prev) => !prev)}
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span>{isAddingTrip ? 'Close form' : 'Add New Trip'}</span>
          </Button>
        </div>
      )}

      {isAddingTrip && user.role === USER_ROLES.AGENCY && (
        <RoundedBox padding="lg" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Trip Title"
              value={newTrip.title}
              onChange={(e) => setNewTrip((t) => ({ ...t, title: e.target.value }))}
              placeholder="e.g., Tech Conference 2025 - Berlin"
            />
            <Input
              label="Destination"
              value={newTrip.destination}
              onChange={(e) => setNewTrip((t) => ({ ...t, destination: e.target.value }))}
              placeholder="e.g., Berlin, Germany"
            />
            <Input
              label="Start Date"
              type="date"
              value={newTrip.startDate}
              onChange={(e) => setNewTrip((t) => ({ ...t, startDate: e.target.value }))}
            />
            <Input
              label="End Date"
              type="date"
              value={newTrip.endDate}
              onChange={(e) => setNewTrip((t) => ({ ...t, endDate: e.target.value }))}
            />
            <Input
              label="Duration (days)"
              type="number"
              min={1}
              value={newTrip.duration}
              onChange={(e) =>
                setNewTrip((t) => ({ ...t, duration: parseInt(e.target.value) || 1 }))
              }
            />
            <Input
              label="Price (USD)"
              type="number"
              min={0}
              value={newTrip.price}
              onChange={(e) =>
                setNewTrip((t) => ({ ...t, price: parseInt(e.target.value) || 0 }))
              }
            />
          </div>

          {/* Image Upload Section */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-900 dark:text-white">
              Trip Images
            </label>
            <div className="flex flex-col gap-3">
              {/* Image Input */}
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files || [])
                    files.forEach((file) => {
                      const reader = new FileReader()
                      reader.onloadend = () => {
                        setTripImages((prev) => [...prev, reader.result as string])
                      }
                      reader.readAsDataURL(file)
                    })
                  }}
                  className="hidden"
                  id="trip-image-upload"
                />
                <label
                  htmlFor="trip-image-upload"
                  className="flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 dark:bg-primary/20 dark:hover:bg-primary/30 text-primary rounded-xl cursor-pointer transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">add_photo_alternate</span>
                  <span className="text-sm font-medium">Add Images</span>
                </label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const url = prompt('Or enter an image URL:')
                    if (url && url.trim()) {
                      setTripImages((prev) => [...prev, url.trim()])
                    }
                  }}
                >
                  <span className="material-symbols-outlined text-[18px]">link</span>
                  Add URL
                </Button>
              </div>

              {/* Image Previews */}
              {tripImages.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {tripImages.map((imageUrl, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-video rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        <img
                          src={imageUrl}
                          alt={`Trip image ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Fallback if image fails to load
                            ;(e.target as HTMLImageElement).src =
                              'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect width="100" height="100" fill="%23ddd"/%3E%3Ctext x="50" y="50" text-anchor="middle" dy=".3em" fill="%23999"%3EImage%3C/text%3E%3C/svg%3E'
                          }}
                        />
                      </div>
                      <button
                        onClick={() => setTripImages((prev) => prev.filter((_, i) => i !== index))}
                        className="absolute top-1 right-1 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[16px]">close</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsAddingTrip(false)
                setNewTrip({
                  title: '',
                  destination: '',
                  startDate: '',
                  endDate: '',
                  duration: 1,
                  price: 0,
                })
                setTripImages([])
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={async () => {
                if (
                  !newTrip.title ||
                  !newTrip.destination ||
                  !newTrip.startDate ||
                  !newTrip.endDate
                ) {
                  alert('Please fill in title, destination, start and end date.')
                  return
                }
                try {
                  await tripsService.createTrip({
                    title: newTrip.title,
                    description: newTrip.title,
                    shortDescription: newTrip.title,
                    destination: newTrip.destination,
                    price: newTrip.price,
                    duration: newTrip.duration,
                    images: tripImages.length > 0 ? tripImages : [],
                    availableDates: [],
                    startDate: newTrip.startDate,
                    endDate: newTrip.endDate,
                    tags: [],
                  })
                  const dash = await dashboardService.getAgencyDashboard()
                  const agencyId = dash.agency?.id
                  if (agencyId) {
                    const res = await agenciesService.getAgencyTrips(agencyId)
                    setAgencyTrips(res.data?.trips ?? [])
                  }
                } catch (e) {
                  alert((e as any)?.response?.data?.message ?? 'Failed to create trip.')
                  return
                }
                setIsAddingTrip(false)
                setNewTrip({
                  title: '',
                  destination: '',
                  startDate: '',
                  endDate: '',
                  duration: 1,
                  price: 0,
                })
                setTripImages([])
              }}
            >
              Save Trip
            </Button>
          </div>
        </RoundedBox>
      )}

      {agencyTrips.length === 0 ? (
        <RoundedBox padding="lg" className="text-center py-10">
          <p className="text-slate-600 dark:text-slate-400">You haven&apos;t posted any trips yet.</p>
          <p className="text-slate-500 dark:text-slate-500 text-sm mt-1">
            Create a trip from your agency profile to start receiving requests.
          </p>
        </RoundedBox>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              title="Active Trips"
              value={agencyTrips.filter((t) => t.status === 'active').length}
              subtitle="Currently live"
              icon={<span className="material-symbols-outlined">flight_takeoff</span>}
            />
            <StatCard
              title="Pending Trips"
              value={agencyTrips.filter((t) => t.status === 'pending').length}
              subtitle="Awaiting approval"
              icon={<span className="material-symbols-outlined">schedule</span>}
            />
            <StatCard
              title="Completed Trips"
              value={agencyTrips.filter((t) => t.status === 'completed').length}
              subtitle="Past departures"
              icon={<span className="material-symbols-outlined">flag</span>}
            />
          </div>

          <div className="space-y-4">
            {agencyTrips.map((trip) => (
              <RoundedBox key={trip.id} padding="lg" className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-slate-900 dark:text-white font-semibold">{trip.title}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {trip.destination} • {trip.startDate} – {trip.endDate} • {trip.duration} days
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-slate-400 text-[18px]">group</span>
                      <span className="text-sm text-slate-600 dark:text-slate-300">
                        {/* Dummy placeholder for number of requests */}
                        {trip.maxTravelers ?? 0} potential seats
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-9 px-3"
                        onClick={() => router.push(`/trips/${trip.slug}?from=dashboard`)}
                      >
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-9 px-3 border-slate-300 dark:border-slate-600 text-slate-500"
                        disabled
                        title="Delete trip is not available via API yet"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Placeholder: travelers who requested this trip */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                    Recent Requests (demo)
                  </p>
                  <div className="space-y-2">
                    <BookingCard
                      id={`${trip.id}-req-1`}
                      traveler={{
                        id: 'traveler-1',
                        name: 'Corporate Team A',
                        avatar:
                          'https://lh3.googleusercontent.com/aida-public/AB6AXuBzUsDXs7q9xlpRA5MQqiQ2l7826rinDU44Mrntu0P9mfbCY8ULA5qLYOlNHtKweEyQPBR35czzP2S3C7zcCmwhJ5KZAea43ZUUwOIcGGQ3vO8Bbjx69-7SrY8AJOA8aHxKsAyGVainntUTpd0pZQw1u6GWqg9XwNyIo6axrB35iW9Xqn1fwK459d4gKM6uRoklapacCDyusQGR-pIveDQon59K-I2JFLdHt5YOva_G7uqh2TlZN7o8rcyPe7m5eOxJvn4Os8Xy4fI',
                        status: 'online',
                      }}
                      trip={{
                        destination: trip.destination,
                        dates: `${trip.startDate} – ${trip.endDate}`,
                      }}
                      status={requestStatuses[`${trip.id}-req-1`] || 'pending'}
                      timeAgo="2h ago"
                      showActions={true}
                      onAccept={() => handleAcceptRequest(`${trip.id}-req-1`)}
                      onReject={() => handleRejectRequest(`${trip.id}-req-1`)}
                    />
                    <BookingCard
                      id={`${trip.id}-req-2`}
                      traveler={{
                        id: 'traveler-2',
                        name: 'Startup Group B',
                        avatar:
                          'https://lh3.googleusercontent.com/aida-public/AB6AXuATYwzdYgoDurSA5EH6Pm04tANR6UPaa_aOVipElVmXyAgkCf4DF_fqxYhWUDLfFqdHsn07JHCSqpSb2DqcLvzruuNL_hoxCxAvaeFAndRVP789U07vC7mviQ96GGOxeT2p5S_Kx1XeheYnsHormkDpxC4zHE--WfkLa2Vnbl2GkbT5BaU5azS1ZivjD0wBZtLu_JJ6_6FXL_eUm5MxaBtUoKFXdTZqYby-hETTYruaCb6FX7sGTP2NiDoBk4n78yA4JmkLrpLS3PE',
                        status: 'online',
                      }}
                      trip={{
                        destination: trip.destination,
                        dates: `${trip.startDate} – ${trip.endDate}`,
                      }}
                      status={requestStatuses[`${trip.id}-req-2`] || 'confirmed'}
                      timeAgo="1d ago"
                      showActions={true}
                      onAccept={() => handleAcceptRequest(`${trip.id}-req-2`)}
                      onReject={() => handleRejectRequest(`${trip.id}-req-2`)}
                    />
                  </div>
                </div>
              </RoundedBox>
            ))}
          </div>
        </>
      )}
    </div>
  )

  const renderTravelerTrips = () => {
    const rows = travelerBookingRows
    const enrolled = rows.filter((r) => r.booking.status === 'confirmed')
    const requested = rows.filter((r) => r.booking.status !== 'confirmed')

    return (
      <div className="space-y-6">
        <SectionHeader title="My Trips & Requests" />

        {rows.length === 0 ? (
          <RoundedBox padding="lg" className="text-center py-10">
            <p className="text-slate-600 dark:text-slate-400">No trips yet.</p>
            <p className="text-slate-500 dark:text-slate-500 text-sm mt-1">
              Browse trips and send a request to join — you&apos;ll see the status here.
            </p>
            <Button variant="primary" className="mt-4" onClick={() => router.push(ROUTES.TRIPS)}>
              <span className="material-symbols-outlined text-[18px]">explore</span>
              Browse Trips
            </Button>
          </RoundedBox>
        ) : (
          <>
            <div className="space-y-3">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                Enrolled / Confirmed
              </p>
              {enrolled.length === 0 ? (
                <RoundedBox padding="md" className="text-sm text-slate-600 dark:text-slate-400">
                  No confirmed trips yet.
                </RoundedBox>
              ) : (
                <div className="space-y-3">
                  {enrolled.map(({ booking, trip }) => (
                    <RoundedBox key={booking.id} padding="lg" className="flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-slate-900 dark:text-white font-semibold truncate">{trip.title}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                          {trip.destination} • {trip.startDate} – {trip.endDate} • {trip.agency.name}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <StatusBadge status="confirmed" size="md" />
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-9 px-3"
                          onClick={() => router.push(`/trips/${trip.slug}?from=dashboard`)}
                        >
                          View
                        </Button>
                      </div>
                    </RoundedBox>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-3">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                Requests (Pending / Rejected / Cancelled)
              </p>
              {requested.length === 0 ? (
                <RoundedBox padding="md" className="text-sm text-slate-600 dark:text-slate-400">
                  No pending requests.
                </RoundedBox>
              ) : (
                <div className="space-y-3">
                  {requested.map(({ booking, trip }) => (
                    <RoundedBox key={booking.id} padding="lg" className="flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-slate-900 dark:text-white font-semibold truncate">{trip.title}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                          {trip.destination} • {trip.startDate} – {trip.endDate} • {trip.agency.name}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <StatusBadge status={booking.status} size="md" />
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-9 px-3"
                          onClick={() => router.push(`/trips/${trip.slug}?from=dashboard`)}
                        >
                          View
                        </Button>
                      </div>
                    </RoundedBox>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    )
  }

  const renderWishlist = () => {
    const items = wishlist
      .map((slug) => wishlistTrips.find((t) => t.slug === slug))
      .filter(Boolean) as TripDTO[]

    return (
      <div className="space-y-6">
        <SectionHeader title="Wishlist" />

        {items.length === 0 ? (
          <RoundedBox padding="lg" className="text-center py-10">
            <p className="text-slate-600 dark:text-slate-400">Your wishlist is empty.</p>
            <p className="text-slate-500 dark:text-slate-500 text-sm mt-1">
              Tap the heart on any trip to save it here.
            </p>
            <Button variant="primary" className="mt-4" onClick={() => router.push(ROUTES.TRIPS)}>
              <span className="material-symbols-outlined text-[18px]">explore</span>
              Browse Trips
            </Button>
          </RoundedBox>
        ) : (
          <div className="space-y-3">
            {items.map((trip) => (
              <RoundedBox key={trip.id} padding="lg" className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-slate-900 dark:text-white font-semibold truncate">{trip.title}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                    {trip.destination} • {trip.startDate} – {trip.endDate} • {trip.agency.name}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 px-3"
                    onClick={() => router.push(`/trips/${trip.slug}`)}
                  >
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 px-3 border-red-500 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    onClick={() => removeFromWishlist(trip.slug)}
                  >
                    Remove
                  </Button>
                </div>
              </RoundedBox>
            ))}
          </div>
        )}
      </div>
    )
  }

  const renderWallet = () => (
    <div className="space-y-6">
      <SectionHeader title="Wallet" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Wallet Balance"
          value="$1,250"
          subtitle="Available to spend"
          icon={<span className="material-symbols-outlined">account_balance_wallet</span>}
          variant="highlight"
          className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-500/10 dark:to-emerald-500/5 border-emerald-200 dark:border-emerald-500/20"
        />
        <StatCard
          title="Upcoming Payments"
          value="$420"
          subtitle="For booked trips"
          icon={<span className="material-symbols-outlined">payments</span>}
        />
        <StatCard
          title="Total Spent"
          value="$8,900"
          subtitle="Across all trips"
          icon={<span className="material-symbols-outlined">bar_chart</span>}
        />
      </div>

      <RoundedBox padding="lg" className="space-y-4">
        <h3 className="text-slate-900 dark:text-white font-semibold">Recent Transactions</h3>
        <div className="space-y-3 text-sm">
          {[
            { id: 1, title: 'Bali Retreat Deposit', amount: '-$300', date: '2 days ago', type: 'debit' },
            { id: 2, title: 'Refund - Tokyo Conference', amount: '+$120', date: '1 week ago', type: 'credit' },
            { id: 3, title: 'London Summit Booking', amount: '-$980', date: '3 weeks ago', type: 'debit' },
          ].map((tx) => (
            <div
              key={tx.id}
              className="flex items-center justify-between py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-800/60"
            >
              <div>
                <p className="text-slate-900 dark:text-white font-medium">{tx.title}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{tx.date}</p>
              </div>
              <div
                className={`text-sm font-semibold ${
                  tx.type === 'credit' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'
                }`}
              >
                {tx.amount}
              </div>
            </div>
          ))}
        </div>
      </RoundedBox>
    </div>
  )

  const renderComplaints = () => (
    <div className="space-y-6">
      <SectionHeader title="Complaints & Support" />

      <RoundedBox padding="lg" className="space-y-4">
        <AlertBox
          variant="info"
          title="How complaints work"
          message="You can raise issues about trips, agencies, or payments. Our support team will get back to you within 24–48 hours."
        />
        <Button
          variant="primary"
          className="w-full md:w-auto"
          onClick={() => {
            alert('This is a prototype. In production, this would open a full complaint form or support chat.')
          }}
        >
          <span className="material-symbols-outlined text-[18px]">add_comment</span>
          New Complaint / Support Ticket
        </Button>
      </RoundedBox>

      <RoundedBox padding="lg" className="space-y-3">
        <h3 className="text-slate-900 dark:text-white font-semibold mb-1">Recent Tickets</h3>
        <div className="space-y-2 text-sm">
          {[
            {
              id: 'TCK-1243',
              subject: 'Refund for cancelled flight',
              status: 'Resolved',
              date: '3 days ago',
            },
            {
              id: 'TCK-1221',
              subject: 'Hotel room mismatch',
              status: 'In Progress',
              date: '1 week ago',
            },
          ].map((ticket) => (
            <div
              key={ticket.id}
              className="flex items-center justify-between py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-800/60"
            >
              <div>
                <p className="text-slate-900 dark:text-white font-medium">{ticket.subject}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {ticket.id} • {ticket.date}
                </p>
              </div>
              <span
                className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  ticket.status === 'Resolved'
                    ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                    : 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300'
                }`}
              >
                {ticket.status}
              </span>
            </div>
          ))}
        </div>
      </RoundedBox>
    </div>
  )

  const renderSettings = () => (
    <div className="space-y-6">
      <SectionHeader title="Settings & Security" />
      <RoundedBox padding="lg" className="space-y-4">
        <h3 className="text-slate-900 dark:text-white font-semibold">Security</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Manage your login and security settings. (This demo does not implement real password changes yet.)
        </p>
        <Button
          variant="outline"
          className="w-full md:w-auto"
          onClick={() => alert('In a real app, this would open a password change flow.')}
        >
          <span className="material-symbols-outlined text-[18px]">lock_reset</span>
          Change Password
        </Button>
      </RoundedBox>

      <RoundedBox padding="lg" className="space-y-4">
        <h3 className="text-slate-900 dark:text-white font-semibold">Danger Zone</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          You can log out of this device. For full account deletion, contact support through the Complaints tab.
        </p>
        <Button
          variant="outline"
          className="w-full md:w-auto border-red-500 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
          onClick={logout}
        >
          <span className="material-symbols-outlined text-[18px]">logout</span>
          Log Out
        </Button>
      </RoundedBox>
    </div>
  )

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'personal':
        return renderPersonalInfo()
      case 'trips':
        return renderAgencyTrips()
      case 'myTrips':
        return renderTravelerTrips()
      case 'wishlist':
        return renderWishlist()
      case 'wallet':
        return renderWallet()
      case 'complaints':
        return renderComplaints()
      case 'settings':
        return renderSettings()
      case 'overview':
      default:
        return renderOverview()
    }
  }

  // Determine appropriate dashboard route for the bottom navigation
  const dashboardHref =
    user.role === USER_ROLES.TRAVELER
      ? ROUTES.DASHBOARD.TRAVELER
      : user.role === USER_ROLES.AGENCY
        ? ROUTES.DASHBOARD.AGENCY
        : ROUTES.DASHBOARD.ADMIN

  // Determine appropriate profile route based on role
  const profileHref =
    user.role === USER_ROLES.AGENCY
      ? '/agency/profile'
      : user.role === USER_ROLES.TRAVELER
        ? `/travelers/${user.id}`
        : '/profile'

  const headerTitle = activeTab === 'personal' ? 'Profile' : 'Dashboard'

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen pb-24">
      <Header
        title={headerTitle}
        subtitle="Your personal Tripster overview"
        variant="light"
        showThemeToggle={false}
        rightAction={
          <div className="flex items-center gap-2">
            <NavButton
              href={dashboardHref}
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
            <NavButton
              href={profileHref}
              label="Profile"
              icon="person"
              variant="default"
            />
            <ThemeToggle />
            <LogoutButton />
          </div>
        }
      />

      {showSavedBanner && (
        <div className="px-4 pt-4 md:px-8">
          <AlertBox
            variant="success"
            title="Changes saved"
            message="Your changes have been saved locally for this session."
          />
        </div>
      )}

      <main className="max-w-7xl mx-auto flex flex-col md:flex-row md:gap-6 md:p-6">
        {renderSidebar()}
        <section className="flex-1 px-4 pt-4 pb-8 md:px-0 md:pt-4 space-y-6">
          {/* Mobile tabs */}
          <div className="md:hidden flex overflow-x-auto gap-2 pb-2 -mx-4 px-4 border-b border-slate-200 dark:border-slate-800">
            {[
              { id: 'overview', label: 'Overview' },
              ...(user.role === USER_ROLES.TRAVELER ? [{ id: 'myTrips', label: 'My Trips' }] : []),
              ...(user.role === USER_ROLES.TRAVELER ? [{ id: 'wishlist', label: 'Wishlist' }] : []),
              ...(user.role === USER_ROLES.AGENCY ? [{ id: 'trips', label: 'Trips' }] : []),
              { id: 'personal', label: 'Personal' },
              { id: 'wallet', label: 'Wallet' },
              { id: 'complaints', label: 'Complaints' },
              { id: 'settings', label: 'Settings' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as ProfileTab)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border ${
                  activeTab === tab.id
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {renderActiveTab()}
        </section>
      </main>

      {/* Traveler KPI detail modal */}
      {user.role === USER_ROLES.TRAVELER && travelerKpiModal && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setTravelerKpiModal(null)}
        >
          <div
            className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-5 py-4 flex items-start justify-between gap-3 rounded-t-2xl">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {modalConfig[travelerKpiModal].title}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {modalConfig[travelerKpiModal].subtitle}
                </p>
              </div>
              <button
                type="button"
                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                onClick={() => setTravelerKpiModal(null)}
              >
                <span className="material-symbols-outlined text-slate-600 dark:text-slate-300">close</span>
              </button>
            </div>

            <div className="p-5 space-y-3">
              {travelerKpis[travelerKpiModal].length === 0 ? (
                <RoundedBox padding="lg" className="text-center py-10">
                  <p className="text-slate-600 dark:text-slate-400">No items to show.</p>
                </RoundedBox>
              ) : (
                travelerKpis[travelerKpiModal].map(({ booking, trip }) => (
                  <RoundedBox key={booking.id} padding="lg" className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-slate-900 dark:text-white font-semibold truncate">{trip.title}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                        {trip.destination} • {trip.startDate} – {trip.endDate} • {trip.agency.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <StatusBadge
                        status={
                          travelerKpiModal === 'completed'
                            ? 'completed'
                            : travelerKpiModal === 'enrolled'
                              ? 'confirmed'
                              : travelerKpiModal === 'pending'
                                ? 'pending'
                                : 'rejected'
                        }
                        size="md"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-9 px-3"
                        onClick={() => router.push(`/trips/${trip.slug}?from=dashboard`)}
                      >
                        View
                      </Button>
                    </div>
                  </RoundedBox>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <BottomNavigation
        items={[
          { href: dashboardHref, icon: 'dashboard', label: 'Dashboard' },
          { href: ROUTES.TRIPS, icon: 'explore', label: 'Explore' },
          { href: profileHref, icon: 'person', label: 'Profile' },
        ]}
        variant="default"
      />
    </div>
  )
}

