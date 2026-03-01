'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button, StatusBadge, Avatar, RoundedBox } from '@/shared/components/ui'
import { tripsService } from '@/services/trips.service'
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

export function TripDetailModal({ slug, isOpen, onClose }: TripDetailModalProps) {
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
      .catch((err) => {
        setError(err?.response?.data?.message || 'Trip not found.')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [isOpen, slug])

  if (!isOpen) return null

  const agency = trip?.agency
  const highlights = trip?.highlights ?? []
  const schedule = trip?.schedule ?? []
  const recreationalActivities = trip?.recreationalActivities ?? []
  const imageUrl = (trip?.images && trip.images[0]) || ''

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-card-dark rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-card-dark">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white truncate pr-2">
            {trip ? trip.title : 'Trip Details'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-600 dark:text-slate-400"
            aria-label="Close"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading && (
            <div className="p-8 text-center text-slate-500 dark:text-slate-400">Loading trip…</div>
          )}
          {error && (
            <div className="p-8 text-center">
              <p className="text-slate-600 dark:text-slate-400 mb-4">{error}</p>
              <Button variant="primary" onClick={onClose}>
                Close
              </Button>
            </div>
          )}
          {!loading && !error && trip && (
            <>
              <div className="relative h-48 w-full shrink-0">
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{
                    backgroundImage: imageUrl ? `url('${imageUrl}')` : undefined,
                    backgroundColor: imageUrl ? undefined : 'var(--tw-slate-200)',
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute top-3 left-3">
                  <StatusBadge status={trip.status === 'active' ? 'approved' : trip.status} size="sm" />
                </div>
              </div>

              <div className="p-5 space-y-5">
                <div>
                  <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{trip.title}</h1>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                    {trip.destination && (
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[18px]">location_on</span>
                        {trip.destination}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[18px]">calendar_month</span>
                      {formatDate(trip.startDate)} – {formatDate(trip.endDate)}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[18px]">schedule</span>
                      {trip.duration} Days
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[18px]">star</span>
                      {Number(trip.rating).toFixed(1)} ({trip.reviewCount} reviews)
                    </span>
                  </div>
                </div>

                <RoundedBox variant="default" padding="lg">
                  <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2">About This Trip</h2>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                    {trip.description || trip.shortDescription || 'No description.'}
                  </p>
                </RoundedBox>

                {highlights.length > 0 && (
                  <RoundedBox variant="default" padding="lg">
                    <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2">What&apos;s Included</h2>
                    <ul className="space-y-1.5">
                      {highlights.map((h, i) => (
                        <li key={i} className="flex items-start gap-2 text-slate-600 dark:text-slate-400 text-sm">
                          <span className="material-symbols-outlined text-primary text-sm mt-0.5">check_circle</span>
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </RoundedBox>
                )}

                {schedule.length > 0 && (
                  <RoundedBox variant="default" padding="lg">
                    <h2 className="text-base font-bold text-slate-900 dark:text-white mb-3">Schedule</h2>
                    <div className="space-y-4">
                      {schedule.map((day, i) => (
                        <div key={i} className="border-l-2 border-primary pl-3 pb-3 last:pb-0">
                          <div className="text-primary font-bold text-sm">Day {day.day}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">{formatDate(day.date)}</div>
                          <h3 className="font-semibold text-slate-900 dark:text-white text-sm">{day.title}</h3>
                          <div className="space-y-1 mt-2">
                            {(day.activities || []).map((a, j) => (
                              <div key={j} className="flex gap-2 text-sm">
                                <span className="text-slate-500 dark:text-slate-400 min-w-[60px]">{a.time}</span>
                                <span className="text-slate-700 dark:text-slate-300">{a.activity}</span>
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
                    <h2 className="text-base font-bold text-slate-900 dark:text-white mb-3">Recreational Activities</h2>
                    <div className="space-y-3">
                      {recreationalActivities.map((act, i) => (
                        <div
                          key={i}
                          className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600"
                        >
                          <div className="flex justify-between items-start gap-2">
                            <h3 className="font-semibold text-slate-900 dark:text-white text-sm">{act.name}</h3>
                            {act.included ? (
                              <span className="text-xs font-semibold text-green-600 dark:text-green-400">Included</span>
                            ) : (
                              act.additionalCost != null && (
                                <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                                  +${act.additionalCost}
                                </span>
                              )
                            )}
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{act.description}</p>
                          {act.duration && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{act.duration}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </RoundedBox>
                )}

                {agency && (
                  <RoundedBox variant="default" padding="lg">
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="text-base font-bold text-slate-900 dark:text-white">Organized By</h2>
                      <Link
                        href={`/agencies/${agency.id}`}
                        className="text-primary font-semibold text-sm hover:underline"
                        onClick={onClose}
                      >
                        View Profile →
                      </Link>
                    </div>
                    <div className="flex gap-3">
                      <Avatar src={agency.logo || agency.avatar} name={agency.name} size="md" />
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white">{agency.name}</h3>
                        {agency.location && (
                          <p className="text-xs text-slate-500 dark:text-slate-400">{agency.location}</p>
                        )}
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                          {Number(agency.rating).toFixed(1)} · {agency.reviewCount} reviews
                        </p>
                      </div>
                    </div>
                  </RoundedBox>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">Starting from</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                      ${Number(trip.price).toLocaleString()}
                    </p>
                  </div>
                  <Link href={`/trips/${trip.slug}`} onClick={onClose}>
                    <Button variant="primary" size="lg">
                      View full page & book
                    </Button>
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
