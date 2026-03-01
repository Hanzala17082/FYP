'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Header } from '@/shared/components/layout'
import { TripCard, ThemeToggle, SectionHeader, RoundedBox, Button } from '@/shared/components/ui'
import { BackButton } from '@/shared/components/navigation'
import { agenciesService } from '@/services/agencies.service'
import type { AgencyDTO, TripDTO } from '@/types/api/trips.types'

interface AgencyTripsClientProps {
  agencyId: string
}

export default function AgencyTripsClient({ agencyId }: AgencyTripsClientProps) {
  const router = useRouter()
  const [agency, setAgency] = useState<AgencyDTO | null>(null)
  const [trips, setTrips] = useState<TripDTO[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      agenciesService.getAgency(agencyId).then((res) => res.data),
      agenciesService.getAgencyTrips(agencyId).then((res) => res.data?.trips ?? []),
    ])
      .then(([a, t]) => {
        setAgency(a ?? null)
        setTrips(Array.isArray(t) ? t : [])
      })
      .catch(() => setAgency(null))
      .finally(() => setLoading(false))
  }, [agencyId])

  if (loading) {
    return (
      <div className="bg-background-light dark:bg-background-dark min-h-screen p-5 flex items-center justify-center">
        <p className="text-slate-500 dark:text-slate-400">Loading...</p>
      </div>
    )
  }

  if (!agency) {
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

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen pb-24">
      <Header
        title={`${agency.name} - Trips`}
        variant="light"
        showThemeToggle={false}
        rightAction={
          <div className="flex items-center gap-2">
            <BackButton href={`/agencies/${agencyId}`} label="Back to Agency Profile" />
            <ThemeToggle />
          </div>
        }
      />

      <div className="p-5 md:p-8 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            All Trips by {agency.name}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            {trips.length} {trips.length === 1 ? 'trip' : 'trips'} available
          </p>
        </div>

        {trips.length === 0 ? (
          <RoundedBox padding="lg" className="text-center py-12">
            <span className="material-symbols-outlined text-4xl text-slate-400 dark:text-slate-500 mb-2">
              flight
            </span>
            <p className="text-slate-600 dark:text-slate-400">No trips available yet</p>
          </RoundedBox>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trips.map((trip) => (
              <Link key={trip.id} href={`/trips/${trip.slug}`}>
                <TripCard
                  id={trip.id}
                  title={trip.title}
                  agency={{
                    name: trip.agency.name,
                    verified: trip.agency.verified,
                  }}
                  startDate={trip.startDate}
                  endDate={trip.endDate}
                  duration={trip.duration}
                  price={trip.price}
                  image={trip.images[0] || ''}
                  badge={
                    trip.status === 'active' || trip.status === 'pending' || trip.status === 'completed' || trip.status === 'cancelled'
                      ? { text: trip.status, status: trip.status as 'active' | 'pending' | 'completed' | 'cancelled' }
                      : undefined
                  }
                />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
