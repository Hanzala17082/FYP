'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/shared/components/layout'
import {
  Avatar,
  RoundedBox,
  Button,
  ThemeToggle,
  SectionHeader,
} from '@/shared/components/ui'
import { TripReviewCard } from '@/shared/components/trips/TripReviewCard'
import { TripCard } from '@/shared/components/ui'
import { BackButton, NavButton } from '@/shared/components/navigation'
import { useAuth } from '@/shared/contexts/AuthContext'
import { ROUTES, USER_ROLES } from '@/config/constants'
import { agenciesService } from '@/services/agencies.service'
import type { AgencyDTO, TripDTO } from '@/types/api/trips.types'
import { cn } from '@/shared/utils/cn'
import Link from 'next/link'

interface AgencyProfileClientProps {
  agencyId: string
}

export default function AgencyProfileClient({ agencyId }: AgencyProfileClientProps) {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuth()
  const [agency, setAgency] = useState<AgencyDTO | null>(null)
  const [agencyTrips, setAgencyTrips] = useState<TripDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setNotFound(false)
    agenciesService
      .getAgency(agencyId)
      .then((res) => {
        if (!cancelled && res?.data) setAgency(res.data)
      })
      .catch(() => {
        if (!cancelled) setNotFound(true)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [agencyId])

  useEffect(() => {
    if (!agencyId) return
    let cancelled = false
    agenciesService
      .getAgencyTrips(agencyId)
      .then((res) => {
        if (!cancelled && res?.data?.trips) setAgencyTrips(res.data.trips)
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [agencyId])

  if (loading) {
    return (
      <div className="bg-background-light dark:bg-background-dark min-h-screen p-5">
        <Header title="Agency" variant="light" showThemeToggle={false} rightAction={<ThemeToggle />} />
        <p className="text-slate-500 dark:text-slate-400 mt-6">Loading…</p>
      </div>
    )
  }

  if (notFound || !agency) {
    return (
      <div className="bg-background-light dark:bg-background-dark min-h-screen p-5">
        <Header title="Agency Not Found" variant="light" showThemeToggle={false} rightAction={<ThemeToggle />} />
        <RoundedBox padding="lg" className="text-center py-12 mt-6">
          <p className="text-slate-600 dark:text-slate-400">The agency you&apos;re looking for doesn&apos;t exist.</p>
          <Button variant="outline" className="mt-4" onClick={() => router.back()}>
            Go Back
          </Button>
        </RoundedBox>
      </div>
    )
  }

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

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen pb-24">
      <Header
        title="Agency Profile"
        variant="light"
        showThemeToggle={false}
        rightAction={
          <div className="flex items-center gap-2">
            {/* If logged in as this agency, show dashboard/profile actions */}
            {!isLoading &&
              isAuthenticated &&
              user?.role === USER_ROLES.AGENCY &&
              user.id === agency.id && (
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
                    href="/agency/profile"
                    label="Profile"
                    icon="person"
                    variant="default"
                    validateRole={true}
                    expectedRole="Agency"
                  />
                </>
              )}
            <BackButton onClick={() => router.back()} label="Go Back" />
            <ThemeToggle />
          </div>
        }
      />

      <div className="p-5 space-y-6">
        {/* Agency Header */}
        <RoundedBox variant="default" padding="lg">
          <div className="flex flex-col md:flex-row items-start gap-4">
            <Avatar src={agency.logo || agency.avatar} name={agency.name} size="xl" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{agency.name}</h1>
                {agency.verified && (
                  <span className="material-symbols-outlined text-primary text-xl">verified</span>
                )}
              </div>
              {agency.location && (
                <p className="text-slate-500 dark:text-slate-400 mb-3">{agency.location}</p>
              )}
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                {agency.description || 'No description yet.'}
              </p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-1 mb-1">{renderStars(Number(agency.rating))}</div>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">
                    {Number(agency.rating).toFixed(1)}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {agency.reviewCount} reviews
                  </p>
                </div>
                <div>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">{agencyTrips.length}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Trips</p>
                </div>
              </div>
            </div>
          </div>
        </RoundedBox>

        {/* Contact / Communication (no personal contact info on public profile) */}
        <RoundedBox variant="default" padding="lg">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Contact & Communication</h2>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
            Direct contact details are not shown publicly. Conversations and trip updates will happen inside the dedicated
            group for each trip.
          </p>
          <div className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-400">
            <div className="flex items-start gap-2">
              <span className="material-symbols-outlined text-primary text-[18px] mt-0.5">forum</span>
              <span>After booking, you’ll be added to the trip group chat.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="material-symbols-outlined text-primary text-[18px] mt-0.5">info</span>
              <span>All questions, announcements, and coordination happen there.</span>
            </div>
          </div>
        </RoundedBox>

        {/* Agency Trips Section */}
        {agencyTrips.length > 0 && (
          <div className="space-y-4">
            <SectionHeader
              title={`Trips Offered (${agencyTrips.length})`}
              action={
                agencyTrips.length > 6
                  ? {
                      label: 'View All',
                      href: `/agencies/${agencyId}/trips`,
                    }
                  : undefined
              }
              className="px-0"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {agencyTrips.slice(0, 6).map((trip) => (
                <Link key={trip.id} href={`/trips/${trip.slug}`}>
                  <TripCard
                    id={trip.id}
                    slug={trip.slug}
                    title={trip.title}
                    agency={{
                      name: trip.agency?.name ?? 'Agency',
                      verified: trip.agency?.verified,
                    }}
                    startDate={trip.startDate}
                    endDate={trip.endDate}
                    duration={trip.duration}
                    price={trip.price}
                    image={(trip.images && trip.images[0]) || ''}
                    badge={
                      trip.status === 'active' || trip.status === 'pending' || trip.status === 'completed' || trip.status === 'cancelled'
                        ? { text: trip.status, status: trip.status as 'active' | 'pending' | 'completed' | 'cancelled' }
                        : undefined
                    }
                  />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* CTA Buttons */}
        {agencyTrips.length > 6 && (
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="primary"
              size="lg"
              className="flex-1"
              onClick={() => router.push(`/agencies/${agencyId}/trips`)}
            >
              <span className="material-symbols-outlined text-[20px]">explore</span>
              <span>View All Trips</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
