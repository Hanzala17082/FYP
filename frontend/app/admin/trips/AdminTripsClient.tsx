'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Header } from '@/shared/components/layout'
import { RoundedBox, SectionHeader } from '@/shared/components/ui'
import { AdminHeaderActions } from '@/shared/components/admin/AdminHeaderActions'
import { adminService, type AdminTripListItem } from '@/services/admin.service'
import { useCurrency } from '@/shared/contexts/CurrencyContext'
import { ROUTES } from '@/config/constants'

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400',
  pending: 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400',
  completed: 'bg-slate-100 dark:bg-slate-500/20 text-slate-700 dark:text-slate-300',
  cancelled: 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300',
}

export default function AdminTripsClient() {
  const { formatPrice } = useCurrency()
  const [trips, setTrips] = useState<AdminTripListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    adminService
      .getAllTrips()
      .then((res) => setTrips(res.trips))
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load trips.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen">
      <Header
        title="All Trips"
        subtitle="Tripster Admin"
        variant="light"
        showThemeToggle={false}
        rightAction={<AdminHeaderActions />}
      />

      <main className="flex flex-col w-full max-w-5xl mx-auto p-5 md:p-8 space-y-6">
        <SectionHeader
          title="Platform trips"
          subtitle={loading ? 'Loading…' : `${trips.length} trip(s) listed`}
        />

        {error && (
          <RoundedBox padding="md" className="border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10">
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </RoundedBox>
        )}

        <RoundedBox padding="none" className="overflow-hidden">
          {loading ? (
            <p className="text-sm text-slate-500 dark:text-slate-400 py-8 text-center">Loading trips…</p>
          ) : trips.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400 py-8 text-center">No trips found.</p>
          ) : (
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
              {trips.map((trip) => (
                <Link
                  key={trip.id}
                  href={`/trips/${trip.slug}`}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 shrink-0 rounded-none bg-blue-500/10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-blue-500">flight_takeoff</span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 dark:text-white truncate">{trip.title}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                        {trip.agency?.name ?? 'Unknown agency'} · {trip.destination}
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                        {trip.duration} days · {trip.bookingCount} booking(s)
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 sm:ml-0 ml-[52px]">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {formatPrice(Number(trip.price ?? 0))}
                    </p>
                    <span
                      className={`px-3 py-1 rounded-none text-xs font-semibold capitalize ${STATUS_STYLES[trip.status] ?? STATUS_STYLES.pending}`}
                    >
                      {trip.status}
                    </span>
                    <span className="material-symbols-outlined text-slate-400 text-lg">arrow_forward</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </RoundedBox>

        <Link
          href={ROUTES.DASHBOARD.ADMIN}
          className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-blue-600 dark:hover:text-blue-400"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          Back to dashboard
        </Link>
      </main>
    </div>
  )
}
