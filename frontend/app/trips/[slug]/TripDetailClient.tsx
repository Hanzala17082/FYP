'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useSearchParams } from 'next/navigation'
import { Header } from '@/shared/components/layout'
import { Button, StatusBadge, Avatar, ThemeToggle, SectionHeader } from '@/shared/components/ui'
import { RoundedBox } from '@/shared/components/ui'
import { BackButton } from '@/shared/components/navigation'
import { ROUTES, USER_ROLES } from '@/config/constants'
import { useAuth } from '@/shared/contexts/AuthContext'
import { cn } from '@/shared/utils/cn'
import { tripsService } from '@/services/trips.service'
import type { TripDTO } from '@/types/api/trips.types'

interface TripDetailClientProps {
  slug?: string
}

function formatDate(value: string | null | undefined): string {
  if (!value) return ''
  try {
    const d = new Date(value)
    return isNaN(d.getTime()) ? value : d.toLocaleDateString()
  } catch {
    return value
  }
}

export default function TripDetailClient({ slug: slugProp }: TripDetailClientProps) {
  const params = useParams()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const fromDashboard = searchParams?.get('from') === 'dashboard'
  const slug = (params?.slug ?? slugProp) as string | undefined
  const [trip, setTrip] = useState<TripDTO | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [apiStatus, setApiStatus] = useState<number | null>(null) // 404, 0 = network error, etc.
  const [showAuthModal, setShowAuthModal] = useState(false)

  useEffect(() => {
    const effectiveSlug = (slug ?? params?.slug ?? '').trim()
    if (!effectiveSlug) {
      setLoading(false)
      setError('Invalid trip URL.')
      return
    }
    let cancelled = false
    setLoading(true)
    setError(null)
    setApiStatus(null)
    setTrip(null)
    tripsService
      .getTrip(effectiveSlug)
      .then((res) => {
        if (cancelled) return
        const payload = res?.data
        const tripPayload =
          payload && typeof payload === 'object' && 'id' in payload
            ? payload
            : res && typeof res === 'object' && res !== null && 'id' in res
              ? res
              : null
        if (tripPayload) setTrip(tripPayload as TripDTO)
        else setError('Trip not found.')
      })
      .catch((err) => {
        if (!cancelled) {
          const status = err?.response?.status
          setApiStatus(status ?? 0)
          const msg = err?.response?.data?.message || err?.message || 'Failed to load trip.'
          const isHtml = typeof err?.response?.data === 'string' && err.response.data?.startsWith?.('<!')
          setError(isHtml ? 'Backend returned HTML instead of JSON. Use your Django URL (e.g. http://localhost:8000/api/trips/...), not Postman.' : msg)
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [slug])

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <span
        key={i}
        className={cn(
          'material-symbols-outlined text-sm',
          i < Math.floor(rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-300 dark:text-slate-600'
        )}
      >
        star
      </span>
    ))
  }

  const getBackButtonConfig = () => {
    if (fromDashboard && user) {
      if (user.role === USER_ROLES.AGENCY) {
        return { href: ROUTES.DASHBOARD.AGENCY, label: 'Back to Dashboard' }
      }
      if (user.role === USER_ROLES.TRAVELER) {
        return { href: ROUTES.DASHBOARD.TRAVELER, label: 'Back to Dashboard' }
      }
      if (user.role === USER_ROLES.ADMIN) {
        return { href: ROUTES.DASHBOARD.ADMIN, label: 'Back to Dashboard' }
      }
    }
    return { href: ROUTES.TRIPS, label: 'Back to Trips' }
  }

  if (loading) {
    return (
      <div className="bg-background-light dark:bg-background-dark min-h-screen flex items-center justify-center">
        <p className="text-slate-500 dark:text-slate-400">Loading trip…</p>
      </div>
    )
  }

  if (!slug) {
    return (
      <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col items-center justify-center gap-4 p-5">
        <p className="text-slate-600 dark:text-slate-400">Invalid trip URL.</p>
        <Link href={ROUTES.TRIPS} className="text-primary font-medium hover:underline">
          Back to Trips
        </Link>
      </div>
    )
  }

  if (error || !trip) {
    const is404 = apiStatus === 404
    const displaySlug = (slug ?? params?.slug ?? '') as string
    const apiBase = typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL : 'http://localhost:8000/api'
    return (
      <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col items-center justify-center gap-4 p-5 text-center max-w-md">
        <Header title="Trip Details" variant="light" showThemeToggle={false} rightAction={<ThemeToggle />} />
        <p className="text-slate-600 dark:text-slate-400">{error || 'Trip not found.'}</p>
        {is404 && (
          <p className="text-amber-700 dark:text-amber-400 text-sm font-medium">
            Backend is connected. The API returned 404 — this trip is not in the database. Seed data to fix.
          </p>
        )}
        {apiStatus === 0 && (
          <p className="text-amber-700 dark:text-amber-400 text-sm font-medium">
            Could not reach the backend (network error). Is it running on the URL below?
          </p>
        )}
        <p className="text-slate-500 dark:text-slate-500 text-sm font-mono break-all">Requested: /trips/{displaySlug}</p>
        <ul className="text-slate-500 dark:text-slate-500 text-sm text-left list-disc list-inside space-y-1">
          <li>Test API in browser or curl: <code className="bg-slate-200 dark:bg-slate-700 px-1 rounded break-all">{apiBase}/trips/{displaySlug}</code> — you must get <strong>JSON</strong>, not HTML (Postman’s page is HTML).</li>
          <li>Backend: <code className="bg-slate-200 dark:bg-slate-700 px-1 rounded">cd backend &amp;&amp; python manage.py runserver</code></li>
          <li>If 404: ensure the trip exists in the database (e.g. create via Django admin).</li>
          <li>Frontend env: <code className="bg-slate-200 dark:bg-slate-700 px-1 rounded">NEXT_PUBLIC_API_URL=http://localhost:8000/api</code> in <code className="bg-slate-200 dark:bg-slate-700 px-1 rounded">.env.local</code></li>
        </ul>
        <Link href={ROUTES.TRIPS} className="text-primary font-medium hover:underline">
          Back to Trips
        </Link>
      </div>
    )
  }

  const agency = trip.agency
  const highlights = trip.highlights ?? []
  const schedule = trip.schedule ?? []
  const recreationalActivities = trip.recreationalActivities ?? []
  const imageUrl = (trip.images && trip.images[0]) || ''
  const backButtonConfig = getBackButtonConfig()

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen pb-24">
      <Header
        title="Trip Details"
        variant="light"
        showThemeToggle={false}
        rightAction={
          <div className="flex items-center gap-2">
            <BackButton href={backButtonConfig.href} label={backButtonConfig.label} />
            <ThemeToggle />
          </div>
        }
      />

      <div className="relative h-64 w-full">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: imageUrl ? `url('${imageUrl}')` : undefined, backgroundColor: imageUrl ? undefined : 'var(--tw-slate-200)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        <div className="absolute top-3 left-3">
          <StatusBadge status={trip.status === 'active' ? 'approved' : trip.status} size="sm" />
        </div>
      </div>

      <div className="p-5 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{trip.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mb-4">
            {trip.destination && (
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[18px]">location_on</span>
                <span>{trip.destination}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[18px]">calendar_month</span>
              <span>
                {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[18px]">schedule</span>
              <span>{trip.duration} Days</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[18px]">star</span>
              <span>
                {Number(trip.rating).toFixed(1)} ({trip.reviewCount} reviews)
              </span>
            </div>
          </div>
        </div>

        <RoundedBox variant="default" padding="lg">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">About This Trip</h2>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
            {trip.description || trip.shortDescription || 'No description.'}
          </p>
        </RoundedBox>

        {highlights.length > 0 && (
          <RoundedBox variant="default" padding="lg">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">What&apos;s Included</h2>
            <ul className="space-y-2">
              {highlights.map((highlight, index) => (
                <li key={index} className="flex items-start gap-2 text-slate-600 dark:text-slate-400">
                  <span className="material-symbols-outlined text-primary text-sm mt-0.5">check_circle</span>
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          </RoundedBox>
        )}

        {schedule.length > 0 && (
          <RoundedBox variant="default" padding="lg">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Complete Schedule</h2>
            <div className="space-y-6">
              {schedule.map((day, dayIndex) => (
                <div key={dayIndex} className="border-l-2 border-primary pl-4 pb-4 last:pb-0">
                  <div className="mb-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-primary font-bold text-sm">Day {day.day}</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">{formatDate(day.date)}</span>
                    </div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">{day.title}</h3>
                  </div>
                  <div className="space-y-2">
                    {(day.activities || []).map((activity, actIndex) => (
                      <div key={actIndex} className="flex gap-3 text-sm">
                        <span className="font-medium text-slate-600 dark:text-slate-400 min-w-[80px]">
                          {activity.time}
                        </span>
                        <span className="text-slate-700 dark:text-slate-300 flex-1">{activity.activity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </RoundedBox>
        )}

        {recreationalActivities.length > 0 && (
          <RoundedBox variant="default" padding="lg">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Recreational Activities</h2>
            <div className="space-y-4">
              {recreationalActivities.map((activity, index) => (
                <div
                  key={index}
                  className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-slate-900 dark:text-white">{activity.name}</h3>
                    {activity.included ? (
                      <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold rounded-lg">
                        Included
                      </span>
                    ) : (
                      activity.additionalCost != null && (
                        <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-semibold rounded-lg">
                          +${activity.additionalCost}
                        </span>
                      )
                    )}
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{activity.description}</p>
                  {activity.duration && (
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span className="material-symbols-outlined text-[16px]">schedule</span>
                      <span>{activity.duration}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </RoundedBox>
        )}

        <RoundedBox variant="default" padding="lg">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Organized By</h2>
              <Link
                href={`/agencies/${agency.id}`}
                className="text-primary font-semibold text-sm hover:underline flex items-center gap-1"
              >
                <span>View Profile</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </Link>
            </div>
            <div className="flex items-start gap-4">
              <Avatar src={agency.logo || agency.avatar} name={agency.name} size="lg" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{agency.name}</h3>
                  {agency.verified && (
                    <span className="material-symbols-outlined text-primary text-sm">verified</span>
                  )}
                </div>
                {agency.location && (
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">{agency.location}</p>
                )}
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                  {agency.description || 'No description.'}
                </p>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[18px]">star</span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {Number(agency.rating).toFixed(1)}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{agency.reviewCount} reviews</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </RoundedBox>

        <div className="sticky bottom-0 bg-background-light dark:bg-background-dark border-t border-slate-200 dark:border-slate-800 p-5 -mx-5 mt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">Starting from</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">
                ${Number(trip.price).toLocaleString()}
              </p>
            </div>
          </div>
          <Button
            variant="primary"
            size="lg"
            className="w-full h-14"
            onClick={() => {
              if (!user) {
                setShowAuthModal(true)
              } else {
                // TODO: open booking flow when implemented
              }
            }}
          >
            Book Now
          </Button>
        </div>
      </div>

      {/* Login / Sign up modal when guest clicks Book Now */}
      {showAuthModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setShowAuthModal(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="auth-modal-title"
        >
          <div
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden ring-1 ring-slate-200 dark:ring-slate-600"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 id="auth-modal-title" className="text-xl font-bold text-slate-900 dark:text-white">
                  Book this trip
                </h2>
                <button
                  type="button"
                  onClick={() => setShowAuthModal(false)}
                  className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400"
                  aria-label="Close"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-sm mb-6">
                Log in or create an account to continue with your booking.
              </p>
              <div className="flex flex-col gap-3">
                <Link
                  href={`${ROUTES.LOGIN}?return=${encodeURIComponent(`/trips/${slug}`)}`}
                  onClick={() => setShowAuthModal(false)}
                >
                  <Button variant="primary" size="lg" className="w-full h-12">
                    Log in
                  </Button>
                </Link>
                <Link
                  href={`${ROUTES.REGISTER}?return=${encodeURIComponent(`/trips/${slug}`)}`}
                  onClick={() => setShowAuthModal(false)}
                >
                  <Button variant="outline" size="lg" className="w-full h-12 border-2">
                    Sign up
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
