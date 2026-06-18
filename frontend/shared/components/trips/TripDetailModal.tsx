'use client'

import { useEffect, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { Button, StatusBadge, Avatar } from '@/shared/components/ui'
import { tripsService } from '@/services/trips.service'
import { getErrorMessage } from '@/shared/utils/error-message'
import { useCurrency } from '@/shared/contexts/CurrencyContext'
import { cn } from '@/shared/utils/cn'
import type { TripDTO } from '@/types/api/trips.types'

function formatDate(value: string | null | undefined): string {
  if (!value) return ''
  try {
    const d = new Date(value)
    return isNaN(d.getTime()) ? value : d.toLocaleDateString()
  } catch {
    return value
  }
}

interface TripDetailModalProps {
  slug: string | null
  isOpen: boolean
  onClose: () => void
}

function MetaChip({
  icon,
  label,
  value,
  className,
}: {
  icon: string
  label: string
  value: string
  className?: string
}) {
  return (
    <div
      className={cn(
        'rounded-[14px] border border-slate-200/80 bg-white/90 p-3 shadow-[0_2px_12px_rgba(15,23,42,0.04)] backdrop-blur-sm dark:border-slate-700/70 dark:bg-slate-800/70',
        className
      )}
    >
      <div className="flex items-center gap-2.5">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
          <span className="material-symbols-outlined text-[18px]">{icon}</span>
        </span>
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            {label}
          </p>
          <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{value}</p>
        </div>
      </div>
    </div>
  )
}

function SectionCard({
  title,
  icon,
  children,
  className,
}: {
  title: string
  icon: string
  children: ReactNode
  className?: string
}) {
  return (
    <section
      className={cn(
        'rounded-[18px] border border-slate-200/70 bg-gradient-to-br from-white via-white to-slate-50/90 p-5 shadow-[0_4px_24px_rgba(15,23,42,0.05)] dark:border-slate-700/60 dark:from-slate-800/90 dark:via-slate-800/80 dark:to-slate-900/50',
        className
      )}
    >
      <h2 className="mb-3 flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-primary/10 text-primary">
          <span className="material-symbols-outlined text-[18px]">{icon}</span>
        </span>
        {title}
      </h2>
      {children}
    </section>
  )
}

function ModalSkeleton() {
  return (
    <div className="animate-pulse space-y-5 p-5">
      <div className="aspect-[16/10] rounded-[20px] bg-slate-200 dark:bg-slate-700" />
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-[72px] rounded-[14px] bg-slate-200 dark:bg-slate-700" />
        ))}
      </div>
      <div className="h-32 rounded-[18px] bg-slate-200 dark:bg-slate-700" />
      <div className="h-24 rounded-[18px] bg-slate-200 dark:bg-slate-700" />
    </div>
  )
}

export function TripDetailModal({ slug, isOpen, onClose }: TripDetailModalProps) {
  const { formatPrice } = useCurrency()
  const [trip, setTrip] = useState<TripDTO | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen || !slug) {
      setTrip(null)
      setError(null)
      return
    }
    setLoading(true)
    setError(null)
    tripsService
      .getTrip(slug)
      .then((res) => {
        if (res.data) setTrip(res.data)
      })
      .catch((err: unknown) => {
        setError(getErrorMessage(err, 'Trip not found.'))
      })
      .finally(() => {
        setLoading(false)
      })
  }, [isOpen, slug])

  useEffect(() => {
    if (!isOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const agency = trip?.agency
  const highlights = trip?.highlights ?? []
  const schedule = trip?.schedule ?? []
  const recreationalActivities = trip?.recreationalActivities ?? []
  const imageUrl = (trip?.images && trip.images[0]) || ''
  const dateRange = trip
    ? `${formatDate(trip.startDate)} – ${formatDate(trip.endDate)}`
    : ''

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="trip-modal-title"
    >
      <button
        type="button"
        aria-label="Close modal backdrop"
        className="absolute inset-0 bg-slate-950/55 backdrop-blur-md"
        onClick={onClose}
      />

      <div
        className="relative flex max-h-[94dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-[28px] border border-slate-200/80 bg-background-light shadow-[0_24px_80px_rgba(15,23,42,0.28)] dark:border-slate-700/80 dark:bg-[#141820] sm:rounded-[28px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="scrollbar-tripster flex-1 overflow-y-auto">
          {loading && <ModalSkeleton />}

          {error && (
            <div className="flex flex-col items-center justify-center gap-4 px-6 py-16 text-center">
              <span className="grid h-14 w-14 place-items-center rounded-full bg-red-500/10 text-red-500">
                <span className="material-symbols-outlined text-[28px]">travel_explore</span>
              </span>
              <p className="max-w-sm text-slate-600 dark:text-slate-300">{error}</p>
              <Button variant="primary" onClick={onClose} className="rounded-full px-6">
                Close
              </Button>
            </div>
          )}

          {!loading && !error && trip && (
            <div className="space-y-5 p-5 pb-6">
              <div className="relative aspect-[16/10] overflow-hidden rounded-[22px] shadow-[0_12px_40px_rgba(15,23,42,0.18)]">
                {imageUrl ? (
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-[1.03]"
                    style={{ backgroundImage: `url('${imageUrl}')` }}
                    role="img"
                    aria-label={trip.title}
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-primary/10 to-slate-300 dark:to-slate-800" />
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/10" />

                <button
                  type="button"
                  onClick={onClose}
                  className="absolute right-3 top-3 z-10 grid h-10 w-10 place-items-center rounded-full border border-white/20 bg-black/30 text-white backdrop-blur-md transition hover:bg-black/50"
                  aria-label="Close"
                >
                  <span className="material-symbols-outlined text-[22px]">close</span>
                </button>

                <div className="absolute left-3 top-3 z-10">
                  <StatusBadge
                    status={trip.status === 'active' ? 'approved' : trip.status}
                    size="sm"
                  />
                </div>

                <div className="absolute bottom-0 left-0 right-0 z-10 p-4 sm:p-5">
                  {trip.destination && (
                    <p className="mb-1 flex items-center gap-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white/80">
                      <span className="material-symbols-outlined text-[14px]">location_on</span>
                      {trip.destination.split(',')[0]?.trim() || trip.destination}
                    </p>
                  )}
                  <h1
                    id="trip-modal-title"
                    className="text-2xl font-extrabold leading-tight tracking-tight text-white drop-shadow-sm sm:text-[1.65rem]"
                  >
                    {trip.title}
                  </h1>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {trip.destination && (
                  <MetaChip icon="explore" label="Destination" value={trip.destination} />
                )}
                <MetaChip icon="calendar_month" label="Dates" value={dateRange} />
                <MetaChip icon="schedule" label="Duration" value={`${trip.duration} days`} />
                <MetaChip
                  icon="star"
                  label="Rating"
                  value={`${Number(trip.rating).toFixed(1)} · ${trip.reviewCount} reviews`}
                />
              </div>

              <SectionCard title="About This Trip" icon="info">
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  {trip.description || trip.shortDescription || 'No description available yet.'}
                </p>
              </SectionCard>

              {highlights.length > 0 && (
                <SectionCard title="What's Included" icon="check_circle">
                  <ul className="space-y-2.5">
                    {highlights.map((h, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2.5 rounded-[12px] bg-primary/5 px-3 py-2 text-sm text-slate-700 dark:bg-primary/10 dark:text-slate-200"
                      >
                        <span className="material-symbols-outlined mt-0.5 shrink-0 text-[18px] text-primary">
                          done
                        </span>
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </SectionCard>
              )}

              {schedule.length > 0 && (
                <SectionCard title="Schedule" icon="event_note">
                  <div className="space-y-3">
                    {schedule.map((day, i) => (
                      <div
                        key={i}
                        className="relative rounded-[14px] border border-slate-200/70 bg-white/70 p-4 pl-5 dark:border-slate-700/60 dark:bg-slate-900/40"
                      >
                        <span className="absolute left-0 top-4 bottom-4 w-1 rounded-full bg-gradient-to-b from-primary to-primary/30" />
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                            Day {day.day}
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {formatDate(day.date)}
                          </span>
                        </div>
                        <h3 className="mt-2 text-sm font-bold text-slate-900 dark:text-white">{day.title}</h3>
                        <div className="mt-2 space-y-1.5">
                          {(day.activities || []).map((a, j) => (
                            <div key={j} className="flex gap-3 text-sm">
                              <span className="min-w-[58px] font-medium text-primary">{a.time}</span>
                              <span className="text-slate-600 dark:text-slate-300">{a.activity}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </SectionCard>
              )}

              {recreationalActivities.length > 0 && (
                <SectionCard title="Recreational Activities" icon="local_activity">
                  <div className="space-y-3">
                    {recreationalActivities.map((act, i) => (
                      <div
                        key={i}
                        className="rounded-[14px] border border-slate-200/70 bg-white/70 p-3.5 dark:border-slate-700/60 dark:bg-slate-900/40"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white">{act.name}</h3>
                          {act.included ? (
                            <span className="shrink-0 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
                              Included
                            </span>
                          ) : (
                            act.additionalCost != null && (
                              <span className="shrink-0 rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-bold text-amber-700 dark:text-amber-400">
                                +{formatPrice(Number(act.additionalCost))}
                              </span>
                            )
                          )}
                        </div>
                        {act.description && (
                          <p className="mt-1.5 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                            {act.description}
                          </p>
                        )}
                        {act.duration && (
                          <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">{act.duration}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </SectionCard>
              )}

              {agency && (
                <div className="rounded-[18px] bg-gradient-to-br from-primary/30 via-primary/10 to-transparent p-[1px]">
                  <div className="rounded-[17px] bg-white p-4 dark:bg-[#141820]">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <h2 className="text-base font-bold text-slate-900 dark:text-white">Organized By</h2>
                      <Link
                        href={`/agencies/${agency.id}`}
                        className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary transition hover:bg-primary/20"
                        onClick={onClose}
                      >
                        View profile
                        <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                      </Link>
                    </div>
                    <div className="flex items-center gap-3">
                      <Avatar src={agency.logo || agency.avatar} name={agency.name} size="lg" />
                      <div className="min-w-0">
                        <h3 className="truncate font-bold text-slate-900 dark:text-white">{agency.name}</h3>
                        {agency.location && (
                          <p className="truncate text-xs text-slate-500 dark:text-slate-400">{agency.location}</p>
                        )}
                        <p className="mt-1 text-xs font-medium text-slate-600 dark:text-slate-300">
                          {Number(agency.rating).toFixed(1)} · {agency.reviewCount} reviews
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {!loading && !error && trip && (
          <div className="shrink-0 border-t border-slate-200/80 bg-background-light/95 px-5 py-4 backdrop-blur-md dark:border-slate-700/70 dark:bg-[#141820]/95">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                  Starting from
                </p>
                <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  {formatPrice(Number(trip.price))}
                </p>
              </div>
              <Link href={`/trips/${trip.slug}`} onClick={onClose} className="w-full sm:w-auto">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full rounded-full px-6 shadow-[0_0_24px_rgba(19,127,236,0.35)] hover:shadow-[0_0_32px_rgba(19,127,236,0.5)]"
                >
                  <span className="material-symbols-outlined text-[20px]">flight_takeoff</span>
                  View full page & book
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
