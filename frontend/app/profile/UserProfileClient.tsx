'use client'

import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/shared/contexts/AuthContext'
import dynamic from 'next/dynamic'
import { useCurrency } from '@/shared/contexts/CurrencyContext'
import { Header, BottomNavigation } from '@/shared/components/layout'
import { Avatar, Button, RoundedBox, SectionHeader, Input, AlertBox, StatCard, StatusBadge, CurrencySelect } from '@/shared/components/ui'
import { LogoutButton } from '@/shared/components/auth/LogoutButton'
import { ThemeToggle } from '@/shared/components/ui/ThemeToggle'
import { NavButton } from '@/shared/components/navigation'
import { ROUTES, USER_ROLES } from '@/config/constants'
import { getErrorMessage } from '@/shared/utils/error-message'
import { authService } from '@/services/auth.service'
import { createBrowserSupabaseClient } from '@/shared/lib/supabase/client'
import { dashboardService } from '@/services/dashboard.service'
import { bookingsService } from '@/services/bookings.service'
import { chatService } from '@/services/chat.service'
import { agenciesService } from '@/services/agencies.service'
import { tripsService } from '@/services/trips.service'
import { walletService } from '@/services/wallet.service'
import { profileService } from '@/services/profile.service'
import { agencyProfileService } from '@/services/agency-profile.service'
import { phoneInTextValidationMessage } from '@/shared/utils/phone-in-text'
import { estimateTripPricePkr, clampTripPricePkr, TRIP_PRICE_MIN_PKR, TRIP_PRICE_MAX_PKR } from '@/shared/utils/currency'
import { TRIP_LISTING_FEE_PKR } from '@/config/fees'
import { AvatarPicker } from '@/shared/components/profile/AvatarPicker'
import { userDtoToEntity } from '@/shared/lib/supabase/profile'
import type { WalletSummaryDTO } from '@/types/api/wallet.types'
import { BookingCard } from '@/shared/components/ui'
import type { BookingDTO } from '@/types/api/bookings.types'
import type { TripDTO } from '@/types/api/trips.types'
import Link from 'next/link'

const TripChatsPanel = dynamic(
  () => import('@/shared/components/chat/TripChatsPanel').then((m) => m.TripChatsPanel),
  { loading: () => <RoundedBox padding="lg"><p className="text-sm text-slate-500">Loading trip chats…</p></RoundedBox> }
)

const ModerationFlagList = dynamic(
  () => import('@/shared/components/moderation/ModerationFlagList').then((m) => m.ModerationFlagList),
  { loading: () => <RoundedBox padding="lg"><p className="text-sm text-slate-500">Loading moderation…</p></RoundedBox> }
)

type ProfileTab = 'overview' | 'trips' | 'myTrips' | 'chats' | 'personal' | 'agencyProfile' | 'moderation' | 'wallet' | 'complaints' | 'settings'
type TravelerKpiKind = 'completed' | 'enrolled' | 'pending' | 'rejected'

export default function UserProfileClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, setUser, logout } = useAuth()
  const { currency, setCurrency, formatPrice } = useCurrency()
  const [currencySaved, setCurrencySaved] = useState(false)
  const [activeTab, setActiveTab] = useState<ProfileTab>('overview')
  const [fullName, setFullName] = useState(user?.fullName || '')
  const [city, setCity] = useState(user?.city || '')
  const [avatar, setAvatar] = useState(user?.avatar || '')
  const [showSavedBanner, setShowSavedBanner] = useState(false)
  const [agencyTrips, setAgencyTrips] = useState<TripDTO[]>([])
  const [agencyBookings, setAgencyBookings] = useState<BookingDTO[]>([])
  const [bookingActionId, setBookingActionId] = useState<string | null>(null)
  const [travelerBookings, setTravelerBookings] = useState<BookingDTO[]>([])
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
  const [travelerKpiModal, setTravelerKpiModal] = useState<TravelerKpiKind | null>(null)
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [usesEmailAuth, setUsesEmailAuth] = useState(true)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [passwordChangeLoading, setPasswordChangeLoading] = useState(false)
  const [passwordChangeError, setPasswordChangeError] = useState('')
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState(false)
  const [walletSummary, setWalletSummary] = useState<WalletSummaryDTO | null>(null)
  const [walletLoading, setWalletLoading] = useState(false)
  const [walletError, setWalletError] = useState('')
  const [walletSeeding, setWalletSeeding] = useState(false)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileSaveError, setProfileSaveError] = useState('')
  const [agencyId, setAgencyId] = useState<string | null>(null)
  const [agencyBio, setAgencyBio] = useState('')
  const [agencyLocation, setAgencyLocation] = useState('')
  const [agencyBioLoading, setAgencyBioLoading] = useState(false)
  const [agencyBioSaving, setAgencyBioSaving] = useState(false)
  const [agencyBioError, setAgencyBioError] = useState('')
  const [agencyBioSaved, setAgencyBioSaved] = useState(false)

  useEffect(() => {
    if (!user) return
    let cancelled = false
    setProfileLoading(true)
    if (user.role === USER_ROLES.TRAVELER) {
      Promise.all([
        bookingsService.getBookings().then((res) => res.data?.bookings ?? []),
      ])
        .then(([bookings]) => {
          if (!cancelled) {
            setTravelerBookings(bookings)
          }
        })
        .catch((err: unknown) => {
          if (!cancelled) {
            setTravelerBookings([])
            console.error('[dashboard] Failed to load traveler bookings:', err)
          }
        })
        .finally(() => { if (!cancelled) setProfileLoading(false) })
    } else if (user.role === USER_ROLES.AGENCY) {
      Promise.all([
        dashboardService.getAgencyDashboard(),
        bookingsService.getBookings().then((res) => res.data?.bookings ?? []),
      ])
        .then(([dash, bookings]) => {
          if (cancelled) return
          setAgencyBookings(bookings)
          const dashAgencyId = dash.agency?.id
          if (dashAgencyId) {
            setAgencyId(dashAgencyId)
            return agenciesService.getAgencyTrips(dashAgencyId).then((res) => (res.data?.trips ?? [])).then(setAgencyTrips)
          }
        })
        .catch(() => { if (!cancelled) { setAgencyTrips([]); setAgencyBookings([]) } })
        .finally(() => { if (!cancelled) setProfileLoading(false) })
    } else {
      setProfileLoading(false)
    }
    return () => { cancelled = true }
  }, [user?.id, user?.role])

  const refreshTravelerBookings = () => {
    if (!user || user.role !== USER_ROLES.TRAVELER) return
    bookingsService
      .getBookings()
      .then((res) => setTravelerBookings(res.data?.bookings ?? []))
      .catch((err: unknown) => {
        console.error('[dashboard] Failed to refresh traveler bookings:', err)
      })
  }

  // Refresh bookings when opening My Trips (e.g. after booking from trip detail page)
  useEffect(() => {
    if (activeTab === 'myTrips' && user?.role === USER_ROLES.TRAVELER) {
      refreshTravelerBookings()
    }
  }, [activeTab, user?.id, user?.role])

  // Support deep-linking to a specific tab (e.g. /dashboard?tab=personal)
  useEffect(() => {
    const tab = searchParams?.get('tab')
    if (!tab) return
    const allowed: ProfileTab[] = ['overview', 'trips', 'myTrips', 'chats', 'personal', 'agencyProfile', 'moderation', 'wallet', 'complaints', 'settings']
    if (allowed.includes(tab as ProfileTab)) {
      setActiveTab(tab as ProfileTab)
    }
  }, [searchParams])

  useEffect(() => {
    if (!user) {
      router.replace(ROUTES.LOGIN)
    }
  }, [user, router])

  useEffect(() => {
    if (!user || (user.role !== USER_ROLES.TRAVELER && user.role !== USER_ROLES.AGENCY)) return
    if (activeTab !== 'wallet') return
    let cancelled = false
    setWalletLoading(true)
    setWalletError('')
    walletService
      .getWallet()
      .then((data) => {
        if (!cancelled) setWalletSummary(data)
      })
      .catch((err: unknown) => {
        if (!cancelled) setWalletError(getErrorMessage(err, 'Failed to load wallet.'))
      })
      .finally(() => {
        if (!cancelled) setWalletLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [user?.id, user?.role, activeTab])

  useEffect(() => {
    if (activeTab !== 'settings' || !user) return
    const sb = createBrowserSupabaseClient()
    void sb.auth.getUser().then(({ data }) => {
      const providers = data.user?.identities?.map((identity) => identity.provider) ?? []
      setUsesEmailAuth(providers.length === 0 || providers.includes('email'))
    })
  }, [activeTab, user])

  // Load the agency's current bio/description when opening the Agency Profile tab.
  useEffect(() => {
    if (activeTab !== 'agencyProfile' || !agencyId) return
    let cancelled = false
    setAgencyBioLoading(true)
    setAgencyBioError('')
    agenciesService
      .getAgency(agencyId)
      .then((res) => {
        if (cancelled || !res.data) return
        setAgencyBio(res.data.description ?? '')
        setAgencyLocation(res.data.location ?? '')
      })
      .catch((err: unknown) => {
        if (!cancelled) setAgencyBioError(getErrorMessage(err, 'Failed to load agency profile.'))
      })
      .finally(() => {
        if (!cancelled) setAgencyBioLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [activeTab, agencyId])

  const handleAcceptRequest = async (bookingId: string) => {
    setBookingActionId(bookingId)
    try {
      await bookingsService.updateBookingStatus(bookingId, 'confirmed')
      await chatService.syncBooking(bookingId).catch(() => undefined)
      const res = await bookingsService.getBookings()
      setAgencyBookings(res.data?.bookings ?? [])
    } finally {
      setBookingActionId(null)
    }
  }

  const handleRejectRequest = async (bookingId: string) => {
    setBookingActionId(bookingId)
    try {
      await bookingsService.updateBookingStatus(bookingId, 'cancelled')
      await chatService.syncBooking(bookingId).catch(() => undefined)
      const res = await bookingsService.getBookings()
      setAgencyBookings(res.data?.bookings ?? [])
    } finally {
      setBookingActionId(null)
    }
  }

  const formatTimeAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime()
    const hours = Math.floor(diff / 3600000)
    if (hours < 1) return 'Just now'
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  // Hooks must run before any early return
  const travelerBookingRows = useMemo(() => {
    if (!user || user.role !== USER_ROLES.TRAVELER) return []
    return travelerBookings
      .filter((b) => b.trip?.id)
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
    return null
  }

  const handleSaveProfile = async () => {
    setProfileSaving(true)
    setProfileSaveError('')
    try {
      const updated = await profileService.updateProfile({
        fullName: fullName.trim() || user.fullName,
        city: city.trim(),
      })
      setUser(userDtoToEntity(updated))
      setFullName(updated.fullName)
      setCity(updated.city ?? '')
      setShowSavedBanner(true)
      setTimeout(() => setShowSavedBanner(false), 3000)
    } catch (err: unknown) {
      setProfileSaveError(getErrorMessage(err, 'Failed to save profile.'))
    } finally {
      setProfileSaving(false)
    }
  }

  const handleSaveAgencyBio = async () => {
    setAgencyBioSaving(true)
    setAgencyBioError('')
    setAgencyBioSaved(false)
    // Block phone numbers client-side for instant feedback (server re-validates).
    const phoneError = phoneInTextValidationMessage(agencyBio)
    if (phoneError) {
      setAgencyBioError(phoneError)
      setAgencyBioSaving(false)
      return
    }
    try {
      const updated = await agencyProfileService.updateProfile({
        description: agencyBio.trim(),
        location: agencyLocation.trim(),
      })
      setAgencyBio(updated.description ?? '')
      setAgencyLocation(updated.location ?? '')
      setAgencyBioSaved(true)
      setTimeout(() => setAgencyBioSaved(false), 3000)
    } catch (err: unknown) {
      setAgencyBioError(getErrorMessage(err, 'Failed to save agency profile.'))
    } finally {
      setAgencyBioSaving(false)
    }
  }

  const handleAvatarUpload = async (file: File) => {
    setAvatarUploading(true)
    setProfileSaveError('')
    try {
      const { avatarUrl, user: updated } = await profileService.uploadAvatar(file)
      setAvatar(avatarUrl)
      setUser(userDtoToEntity(updated))
      setShowSavedBanner(true)
      setTimeout(() => setShowSavedBanner(false), 3000)
    } finally {
      setAvatarUploading(false)
    }
  }

  const roleLabel =
    user.role === USER_ROLES.TRAVELER
      ? 'Traveler'
      : user.role === USER_ROLES.AGENCY
        ? 'Agency'
        : 'Admin'

  const renderSidebar = () => (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:shrink-0 lg:border-r lg:border-slate-200 dark:lg:border-slate-800 lg:py-8 lg:px-6 lg:gap-4 lg:overflow-hidden">
      <div className="flex items-center gap-3 mb-6 min-w-0">
        <Avatar
          src={avatar || user.avatar}
          name={fullName || user.fullName}
          size="lg"
          className="shrink-0"
        />
        <div className="min-w-0 flex-1">
          <p
            className="text-slate-900 dark:text-white font-semibold truncate"
            title={fullName || user.fullName}
          >
            {fullName || user.fullName}
          </p>
          <p
            className="text-xs text-slate-500 dark:text-slate-400 break-all leading-snug"
            title={user.email}
          >
            {user.email}
          </p>
        </div>
      </div>
      <nav className="flex flex-col gap-1 text-sm min-w-0">
        {[
          { id: 'overview', label: 'Overview', icon: 'dashboard' },
          ...(user.role === USER_ROLES.TRAVELER
            ? [
                { id: 'myTrips', label: 'My Trips', icon: 'flight' as const },
                { id: 'chats', label: 'Trip Chats', icon: 'forum' as const },
              ]
            : []),
          ...(user.role === USER_ROLES.AGENCY
            ? [
                { id: 'trips', label: 'Trips & Requests', icon: 'flight' as const },
                { id: 'agencyProfile', label: 'Agency Profile', icon: 'storefront' as const },
                { id: 'chats', label: 'Trip Chats', icon: 'forum' as const },
                { id: 'moderation', label: 'Moderation', icon: 'gavel' as const },
              ]
            : []),
          { id: 'personal', label: 'Personal Info', icon: 'badge' },
          { id: 'wallet', label: user.role === USER_ROLES.AGENCY ? 'Earnings' : 'Wallet', icon: 'account_balance_wallet' },
          { id: 'complaints', label: 'Complaints', icon: 'report' },
          { id: 'settings', label: 'Settings & Security', icon: 'settings' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as ProfileTab)}
            className={`flex items-center gap-2 px-3 py-2 rounded-none text-left transition-colors min-w-0 ${
              activeTab === tab.id
                ? 'bg-primary/10 text-primary'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span className="material-symbols-outlined text-[18px] shrink-0">{tab.icon}</span>
            <span className="font-medium truncate">{tab.label}</span>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            title="Total Revenue"
            value={formatPrice(1_245_000)}
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
    <div className="space-y-6 min-w-0">
      <SectionHeader title="Personal Information" />
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start min-w-0">
        <div className="w-full lg:w-auto lg:shrink-0 flex justify-center lg:justify-start">
          <AvatarPicker
            avatarUrl={avatar || user.avatar}
            name={fullName || user.fullName}
            uploading={avatarUploading}
            onPick={handleAvatarUpload}
          />
        </div>
        <div className="flex-1 min-w-0 w-full space-y-4">
          {profileSaveError && (
            <AlertBox variant="error" title="Could not save" message={profileSaveError} />
          )}
          <RoundedBox padding="lg" className="space-y-4 min-w-0 w-full">
            <Input
              label="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="min-w-0 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700"
            />
            <Input
              label="Email Address"
              value={user.email}
              disabled
              title={user.email}
              className="min-w-0 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-dashed border-slate-200 dark:border-slate-700 break-all"
            />
            <Input
              label="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="min-w-0 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700"
            />
            <Button
              variant="primary"
              className="mt-2 w-full sm:w-auto"
              onClick={() => void handleSaveProfile()}
              disabled={profileSaving}
            >
              <span className="material-symbols-outlined text-[18px]">save</span>
              {profileSaving ? 'Saving…' : 'Save Changes'}
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
              onChange={(e) => {
                const destination = e.target.value
                setNewTrip((t) => ({
                  ...t,
                  destination,
                  price: estimateTripPricePkr(t.duration, destination),
                }))
              }}
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
              onChange={(e) => {
                const duration = parseInt(e.target.value) || 1
                setNewTrip((t) => ({
                  ...t,
                  duration,
                  price: estimateTripPricePkr(duration, t.destination),
                }))
              }}
            />
            <Input
              label="Price (PKR)"
              type="number"
              min={TRIP_PRICE_MIN_PKR}
              max={TRIP_PRICE_MAX_PKR}
              step={1000}
              value={newTrip.price || estimateTripPricePkr(newTrip.duration, newTrip.destination)}
              onChange={(e) =>
                setNewTrip((t) => ({ ...t, price: clampTripPricePkr(parseInt(e.target.value) || TRIP_PRICE_MIN_PKR) }))
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
                  className="flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 dark:bg-primary/20 dark:hover:bg-primary/30 text-primary rounded-none cursor-pointer transition-colors"
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
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
                  {tripImages.map((imageUrl, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-video rounded-none overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
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
                        className="absolute top-1 right-1 p-1 bg-red-500 hover:bg-red-600 text-white rounded-none opacity-0 group-hover:opacity-100 transition-opacity"
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

          <div className="flex items-center gap-2 p-3 rounded-none bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20">
            <span className="material-symbols-outlined text-[18px] text-amber-500">info</span>
            <p className="text-xs text-amber-700 dark:text-amber-400">
              A Rs {TRIP_LISTING_FEE_PKR.toLocaleString()} listing fee is charged from your agency
              wallet when you post a trip.
            </p>
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
                  alert(getErrorMessage(e, 'Failed to create trip.'))
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

                {/* Booking requests for this trip */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                    Booking Requests
                  </p>
                  <div className="space-y-2">
                    {agencyBookings.filter((b) => b.trip?.id === trip.id).length === 0 && (
                      <p className="text-sm text-slate-500 dark:text-slate-400">No requests yet for this trip.</p>
                    )}
                    {agencyBookings
                      .filter((b) => b.trip?.id === trip.id)
                      .map((booking) => (
                        <BookingCard
                          key={booking.id}
                          id={booking.id}
                          traveler={{
                            id: booking.traveler.id,
                            name: booking.traveler.fullName,
                            avatar: booking.traveler.avatar,
                            status: 'online',
                          }}
                          trip={{
                            destination: trip.destination,
                            dates: `${booking.startDate} – ${booking.endDate}`,
                          }}
                          status={
                            booking.status === 'pending'
                              ? 'pending'
                              : booking.status === 'confirmed'
                                ? 'confirmed'
                                : booking.status === 'completed'
                                  ? 'confirmed'
                                  : 'rejected'
                          }
                          timeAgo={formatTimeAgo(booking.createdAt)}
                          showActions={booking.status === 'pending'}
                          onAccept={() => void handleAcceptRequest(booking.id)}
                          onReject={() => void handleRejectRequest(booking.id)}
                        />
                      ))}
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

  const formatWalletTimeAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime()
    const hours = Math.floor(diff / 3600000)
    if (hours < 1) return 'Just now'
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    if (days < 7) return `${days}d ago`
    return new Date(iso).toLocaleDateString()
  }

  const handleDemoWalletTopUp = async () => {
    setWalletSeeding(true)
    setWalletError('')
    try {
      const data = await walletService.seedDemoBalance(10000)
      setWalletSummary(data)
    } catch (err: unknown) {
      setWalletError(getErrorMessage(err, 'Failed to add demo balance.'))
    } finally {
      setWalletSeeding(false)
    }
  }

  const renderWallet = () => {
    const isAgency = walletSummary?.accountType === 'agency'

    return (
    <div className="space-y-6">
      <SectionHeader title={isAgency ? 'Agency Earnings' : 'Wallet'} />

      {walletError && <AlertBox variant="error" title="Wallet error" message={walletError} />}

      {walletLoading && (
        <p className="text-sm text-slate-500 dark:text-slate-400">Loading wallet…</p>
      )}

      {!walletLoading && walletSummary && isAgency && (
        <>
          <AlertBox
            variant="info"
            title="How agency earnings work"
            message="Travelers pay when they book. The amount is added to your agency wallet only after you accept the booking request."
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              title="Available Balance"
              value={formatPrice(walletSummary.balance)}
              subtitle="Confirmed booking payouts"
              icon={<span className="material-symbols-outlined">account_balance_wallet</span>}
              variant="highlight"
              className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-500/10 dark:to-emerald-500/5 border-emerald-200 dark:border-emerald-500/20"
            />
            <StatCard
              title="Pending Requests"
              value={formatPrice(walletSummary.pendingEarnings ?? 0)}
              subtitle="Awaiting your acceptance"
              icon={<span className="material-symbols-outlined">hourglass_top</span>}
            />
            <StatCard
              title="Total Earned"
              value={formatPrice(walletSummary.totalEarned ?? 0)}
              subtitle="From accepted bookings"
              icon={<span className="material-symbols-outlined">payments</span>}
            />
          </div>

          {process.env.NODE_ENV === 'development' && (
            <RoundedBox padding="md" className="space-y-3">
              <AlertBox
                variant="info"
                title="Demo mode"
                message="Real top-ups are not connected yet. Use the button below to add test PKR so you can pay verification and trip listing fees."
              />
              <Button variant="outline" onClick={handleDemoWalletTopUp} disabled={walletSeeding}>
                {walletSeeding ? 'Adding…' : 'Add Rs. 10,000 (demo)'}
              </Button>
            </RoundedBox>
          )}

          <RoundedBox padding="lg" className="space-y-4">
            <h3 className="text-slate-900 dark:text-white font-semibold">Recent Activity</h3>
            {walletSummary.transactions.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No activity yet. Accept a booking request to receive payment.
              </p>
            ) : (
              <div className="space-y-3 text-sm">
                {walletSummary.transactions.map((tx) => {
                  const isCredit = tx.amount > 0
                  return (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between py-2 px-3 rounded-none bg-slate-50 dark:bg-slate-800/60"
                    >
                      <div>
                        <p className="text-slate-900 dark:text-white font-medium">{tx.description}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {formatWalletTimeAgo(tx.createdAt)}
                        </p>
                      </div>
                      <div
                        className={`text-sm font-semibold ${
                          isCredit
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}
                      >
                        {isCredit ? '+' : '-'}
                        {formatPrice(Math.abs(tx.amount))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </RoundedBox>
        </>
      )}

      {!walletLoading && walletSummary && !isAgency && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              title="Wallet Balance"
              value={formatPrice(walletSummary.balance)}
              subtitle="Available to spend"
              icon={<span className="material-symbols-outlined">account_balance_wallet</span>}
              variant="highlight"
              className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-500/10 dark:to-emerald-500/5 border-emerald-200 dark:border-emerald-500/20"
            />
            <StatCard
              title="Upcoming Payments"
              value={formatPrice(walletSummary.upcomingPayments)}
              subtitle="For confirmed trips"
              icon={<span className="material-symbols-outlined">payments</span>}
            />
            <StatCard
              title="Total Spent"
              value={formatPrice(walletSummary.totalSpent)}
              subtitle="Across all trips"
              icon={<span className="material-symbols-outlined">bar_chart</span>}
            />
          </div>

          {process.env.NODE_ENV === 'development' && (
            <RoundedBox padding="md" className="space-y-3">
              <AlertBox
                variant="info"
                title="Demo mode"
                message="Real JazzCash / EasyPaisa top-ups are not connected yet. Use the button below to add test PKR for booking trips."
              />
              <Button variant="outline" onClick={handleDemoWalletTopUp} disabled={walletSeeding}>
                {walletSeeding ? 'Adding…' : 'Add Rs. 10,000 (demo)'}
              </Button>
            </RoundedBox>
          )}

          <RoundedBox padding="lg" className="space-y-4">
            <h3 className="text-slate-900 dark:text-white font-semibold">Recent Transactions</h3>
            {walletSummary.transactions.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">No transactions yet.</p>
            ) : (
              <div className="space-y-3 text-sm">
                {walletSummary.transactions.map((tx) => {
                  const isCredit = tx.amount > 0
                  return (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between py-2 px-3 rounded-none bg-slate-50 dark:bg-slate-800/60"
                    >
                      <div>
                        <p className="text-slate-900 dark:text-white font-medium">{tx.description}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {formatWalletTimeAgo(tx.createdAt)}
                        </p>
                      </div>
                      <div
                        className={`text-sm font-semibold ${
                          isCredit
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-slate-900 dark:text-white'
                        }`}
                      >
                        {isCredit ? '+' : ''}
                        {formatPrice(Math.abs(tx.amount))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </RoundedBox>
        </>
      )}
    </div>
    )
  }

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
              className="flex items-center justify-between py-2 px-3 rounded-none bg-slate-50 dark:bg-slate-800/60"
            >
              <div>
                <p className="text-slate-900 dark:text-white font-medium">{ticket.subject}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {ticket.id} • {ticket.date}
                </p>
              </div>
              <span
                className={`px-2 py-1 rounded-none text-xs font-semibold ${
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

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault()
    if (!user?.email) return

    setPasswordChangeLoading(true)
    setPasswordChangeError('')
    setPasswordChangeSuccess(false)

    try {
      await authService.changePassword({
        email: user.email,
        currentPassword,
        password: newPassword,
        confirmPassword: confirmNewPassword,
      })
      setPasswordChangeSuccess(true)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmNewPassword('')
      setShowPasswordForm(false)
    } catch (err: unknown) {
      setPasswordChangeError(getErrorMessage(err, 'Could not update password.'))
    } finally {
      setPasswordChangeLoading(false)
    }
  }

  const renderSettings = () => (
    <div className="space-y-6">
      <SectionHeader title="Settings & Security" />

      {passwordChangeSuccess && (
        <AlertBox
          variant="success"
          title="Password updated"
          message="Your password has been changed successfully."
        />
      )}

      <RoundedBox padding="lg" className="space-y-4">
        <h3 className="text-slate-900 dark:text-white font-semibold">Security</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Update your account password. You will stay signed in on this device.
        </p>

        {!usesEmailAuth ? (
          <AlertBox
            variant="info"
            title="Google sign-in"
            message="This account uses Google sign-in. Manage your password through your Google account, or use Forgot Password on the login page to add an email password."
          />
        ) : (
          <>
            {!showPasswordForm ? (
              <Button
                variant="outline"
                className="w-full md:w-auto"
                onClick={() => {
                  setShowPasswordForm(true)
                  setPasswordChangeError('')
                  setPasswordChangeSuccess(false)
                }}
              >
                <span className="material-symbols-outlined text-[18px]">lock_reset</span>
                Change Password
              </Button>
            ) : (
              <form className="space-y-4 max-w-md" onSubmit={handleChangePassword}>
                <Input
                  label="Current Password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  required
                />
                <Input
                  label="New Password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  required
                  minLength={6}
                />
                <Input
                  label="Confirm New Password"
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  required
                  minLength={6}
                />

                {passwordChangeError && (
                  <AlertBox variant="error" title="Could not update password" message={passwordChangeError} />
                )}

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button type="submit" disabled={passwordChangeLoading} className="w-full sm:w-auto">
                    {passwordChangeLoading ? 'Updating…' : 'Update Password'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full sm:w-auto"
                    disabled={passwordChangeLoading}
                    onClick={() => {
                      setShowPasswordForm(false)
                      setCurrentPassword('')
                      setNewPassword('')
                      setConfirmNewPassword('')
                      setPasswordChangeError('')
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </>
        )}
      </RoundedBox>

      <RoundedBox padding="lg" className="space-y-4">
        <h3 className="text-slate-900 dark:text-white font-semibold">Display Currency</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Trip and wallet prices are stored in PKR. Choose how amounts are shown across the app.
        </p>

        {currencySaved && (
          <AlertBox variant="success" title="Currency updated" message="Prices now display in your selected currency." />
        )}

        <div className="max-w-md space-y-2">
          <label htmlFor="display-currency" className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Preferred currency
          </label>
          <CurrencySelect
            id="display-currency"
            value={currency}
            onChange={(code) => {
              setCurrency(code)
              setCurrencySaved(true)
              window.setTimeout(() => setCurrencySaved(false), 2500)
            }}
          />
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Example trip price: {formatPrice(55_000)} (converted from Rs. 55,000 at approximate rates).
          </p>
        </div>
      </RoundedBox>

      <RoundedBox padding="lg" className="space-y-4">
        <h3 className="text-slate-900 dark:text-white font-semibold">Danger Zone</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          You can log out of this device. For full account deletion, contact support through the Complaints tab.
        </p>
        <Button
          variant="outline"
          className="w-full md:w-auto border-red-500 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
          onClick={() => void logout()}
        >
          <span className="material-symbols-outlined text-[18px]">logout</span>
          Log Out
        </Button>
      </RoundedBox>
    </div>
  )

  const renderChats = () => (
    <div className="space-y-4">
      <SectionHeader title="Trip Chats" subtitle="Group chats for confirmed bookings" />
      <TripChatsPanel initialGroupId={searchParams?.get('group')} />
    </div>
  )

  const renderAgencyProfile = () => (
    <div className="space-y-6 min-w-0">
      <SectionHeader title="Agency Profile" subtitle="Your public bio shown on your agency page" />

      <AlertBox
        variant="info"
        title="No phone numbers in your bio"
        message="To keep bookings on-platform, your bio must not contain phone numbers — written as digits or as words (e.g. 'zero three one one'). Saving will be blocked if one is detected."
      />

      {agencyBioSaved && (
        <AlertBox variant="success" title="Saved" message="Your agency bio has been updated." />
      )}
      {agencyBioError && (
        <AlertBox variant="error" title="Could not save" message={agencyBioError} />
      )}

      <RoundedBox padding="lg" className="space-y-4 min-w-0 w-full">
        {agencyBioLoading ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">Loading agency profile…</p>
        ) : (
          <>
            <Input
              label="Location"
              value={agencyLocation}
              onChange={(e) => setAgencyLocation(e.target.value)}
              placeholder="e.g., Lahore, Pakistan"
              className="min-w-0 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700"
            />
            <div className="space-y-1">
              <label className="block text-sm font-semibold text-slate-900 dark:text-white">
                Bio / Description
              </label>
              <textarea
                className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-white min-h-[160px]"
                value={agencyBio}
                onChange={(e) => setAgencyBio(e.target.value)}
                placeholder="Tell travelers about your agency, the experiences you offer, and what makes you stand out…"
              />
            </div>
            <Button
              variant="primary"
              className="mt-2 w-full sm:w-auto"
              onClick={() => void handleSaveAgencyBio()}
              disabled={agencyBioSaving}
            >
              <span className="material-symbols-outlined text-[18px]">save</span>
              {agencyBioSaving ? 'Saving…' : 'Save Bio'}
            </Button>
          </>
        )}
      </RoundedBox>
    </div>
  )

  const renderModeration = () => (
    <div className="space-y-4">
      <SectionHeader
        title="Chat Moderation"
        subtitle="Messages blocked in your trip chats for adult, hate, or harassment content"
      />
      <ModerationFlagList showAgency={false} />
    </div>
  )

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'personal':
        return renderPersonalInfo()
      case 'agencyProfile':
        return renderAgencyProfile()
      case 'moderation':
        return renderModeration()
      case 'trips':
        return renderAgencyTrips()
      case 'myTrips':
        return renderTravelerTrips()
      case 'chats':
        return renderChats()
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
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <div className="hidden sm:flex items-center gap-1 sm:gap-2">
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
            </div>
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

      <main className="max-w-7xl mx-auto w-full flex flex-col lg:flex-row lg:gap-6 lg:p-6 min-w-0 overflow-x-hidden">
        {renderSidebar()}
        <section className="flex-1 min-w-0 px-4 pt-4 pb-8 lg:px-0 lg:pt-4 space-y-6">
          {/* Mobile / tablet tabs (sidebar from lg) */}
          <div className="lg:hidden flex overflow-x-auto gap-2 pb-2 -mx-4 px-4 border-b border-slate-200 dark:border-slate-800 scrollbar-tripster">
            {[
              { id: 'overview', label: 'Overview' },
              ...(user.role === USER_ROLES.TRAVELER ? [{ id: 'myTrips', label: 'My Trips' }] : []),
              ...(user.role === USER_ROLES.TRAVELER || user.role === USER_ROLES.AGENCY
                ? [{ id: 'chats', label: 'Trip Chats' }]
                : []),
              ...(user.role === USER_ROLES.AGENCY ? [{ id: 'trips', label: 'Trips' }] : []),
              ...(user.role === USER_ROLES.AGENCY ? [{ id: 'agencyProfile', label: 'Agency Profile' }] : []),
              ...(user.role === USER_ROLES.AGENCY ? [{ id: 'moderation', label: 'Moderation' }] : []),
              { id: 'personal', label: 'Personal' },
              { id: 'wallet', label: 'Wallet' },
              { id: 'complaints', label: 'Complaints' },
              { id: 'settings', label: 'Settings' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as ProfileTab)}
                className={`px-3 py-1.5 rounded-none text-xs font-semibold whitespace-nowrap border ${
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
            className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-none shadow-2xl border border-slate-200 dark:border-slate-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-5 py-4 flex items-start justify-between gap-3 rounded-none">
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
                className="p-2 rounded-none hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
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

