'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/shared/components/layout'
import {
  Avatar,
  RoundedBox,
  ThemeToggle,
  SectionHeader,
  Button,
  StatusBadge,
} from '@/shared/components/ui'
import { BackButton } from '@/shared/components/navigation'
import { usersService } from '@/services/users.service'
import { bookingsService } from '@/services/bookings.service'
import { useAuth } from '@/shared/contexts/AuthContext'
import type { BookingDTO } from '@/types/api/bookings.types'

interface TravelerProfileClientProps {
  travelerId: string
}

type ProfileShape = {
  user: { id: string; fullName: string; avatar?: string; city?: string; email: string }
  memberSince: string
  bio: string
  stats: { totalBookings: number; favoriteDestinations: string[] }
}

export default function TravelerProfileClient({ travelerId }: TravelerProfileClientProps) {
  const router = useRouter()
  const { user: currentUser } = useAuth()
  const [profile, setProfile] = useState<ProfileShape | null>(null)
  const [bookings, setBookings] = useState<BookingDTO[]>([])
  const [loading, setLoading] = useState(true)
  const isOwner = !!currentUser && currentUser.id === travelerId

  const storageKeyPrefix = `travelerTripPhotos:${travelerId}:`
  const [tripPhotos, setTripPhotos] = useState<Record<string, string[]>>({})

  useEffect(() => {
    Promise.all([
      usersService.getUserById(travelerId).catch(() => null),
      bookingsService.getBookings({ traveler_id: travelerId }).then((res) => res.data?.bookings ?? []),
    ])
      .then(([userData, bookingsList]) => {
        if (userData) {
          setProfile({
            user: {
              id: userData.id,
              fullName: userData.fullName,
              avatar: userData.avatar,
              city: userData.city,
              email: userData.email,
            },
            memberSince: userData.createdAt ?? '',
            bio: '',
            stats: {
              totalBookings: bookingsList.length,
              favoriteDestinations: [],
            },
          })
        } else {
          setProfile(null)
        }
        setBookings(bookingsList)
      })
      .catch(() => setProfile(null))
      .finally(() => setLoading(false))
  }, [travelerId])

  useEffect(() => {
    if (typeof window === 'undefined' || bookings.length === 0) return
    const next: Record<string, string[]> = {}
    for (const b of bookings) {
      const raw = window.localStorage.getItem(`${storageKeyPrefix}${b.trip?.id ?? b.id}`)
      if (raw) {
        try {
          next[b.trip?.id ?? b.id] = JSON.parse(raw)
        } catch {
          // ignore
        }
      }
    }
    setTripPhotos(next)
  }, [travelerId, bookings])

  const pastConfirmedTrips = useMemo(() => {
    const now = new Date()
    return bookings
      .filter((b) => b.status === 'confirmed' && b.trip)
      .map((b) => ({ booking: b, trip: b.trip! }))
      .filter(({ trip }) => {
        const end = new Date(trip.endDate)
        return !Number.isNaN(end.getTime()) && end.getTime() < now.getTime()
      })
      .sort((a, b) => new Date(b.trip.endDate).getTime() - new Date(a.trip.endDate).getTime())
  }, [bookings])


  if (loading) {
    return (
      <div className="bg-background-light dark:bg-background-dark min-h-screen p-5 flex items-center justify-center">
        <p className="text-slate-500 dark:text-slate-400">Loading...</p>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="bg-background-light dark:bg-background-dark min-h-screen p-5">
        <Header title="Traveler Not Found" variant="light" showThemeToggle={false} rightAction={<ThemeToggle />} />
        <RoundedBox padding="lg" className="text-center py-12 mt-6">
          <p className="text-slate-600 dark:text-slate-400">
            The traveler profile you&apos;re looking for doesn&apos;t exist.
          </p>
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
        title="Traveler Profile"
        variant="light"
        showThemeToggle={false}
        rightAction={
          <div className="flex items-center gap-2">
            <BackButton onClick={() => router.back()} label="Go Back" />
            <ThemeToggle />
          </div>
        }
      />

      <div className="p-5 space-y-6">
        {/* Traveler Header */}
        <RoundedBox variant="default" padding="lg">
          <div className="flex flex-col md:flex-row items-start gap-4">
            <Avatar src={profile.user.avatar} name={profile.user.fullName} size="xl" />
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                {profile.user.fullName}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mb-3">
                {profile.user.city} • Member since {new Date(profile.memberSince).getFullYear()}
              </p>
              {profile.bio && (
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">{profile.bio}</p>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">
                    {pastConfirmedTrips.length}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Trips Completed</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">
                    {profile.stats.totalBookings}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Total Bookings</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">
                    {profile.stats.favoriteDestinations.length}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Favorite Destinations</p>
                </div>
              </div>
            </div>
          </div>
        </RoundedBox>

        {/* Past Trips (privacy-safe) */}
        <RoundedBox variant="default" padding="lg" className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Past Trips</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Only completed trips are shown. Upcoming trips are hidden for privacy.
              </p>
            </div>
          </div>

          {pastConfirmedTrips.length === 0 ? (
            <div className="text-sm text-slate-600 dark:text-slate-400">
              No completed trips to display yet.
            </div>
          ) : (
            <div className="space-y-4">
              {pastConfirmedTrips.map(({ trip }) => {
                const userPics = tripPhotos[trip.id] || []
                const cover = userPics[0] || trip.images?.[0]
                return (
                  <div key={trip.id} className="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
                    <div className="flex flex-col md:flex-row">
                      <div className="relative md:w-64 w-full h-44 bg-slate-100 dark:bg-slate-800">
                        {cover ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={cover} alt={trip.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400">
                            <span className="material-symbols-outlined text-4xl">photo</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 p-4 flex flex-col gap-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-slate-900 dark:text-white font-semibold truncate">{trip.title}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                              {trip.destination} • {trip.startDate} – {trip.endDate}
                            </p>
                          </div>
                          <StatusBadge status="completed" size="md" />
                        </div>

                        {userPics.length > 0 && (
                          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                            {userPics.slice(0, 6).map((src, idx) => (
                              <div key={idx} className="aspect-square rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={src} alt={`Trip photo ${idx + 1}`} className="w-full h-full object-cover" />
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center justify-between gap-2">
                          <Button variant="outline" size="sm" onClick={() => router.push(`/trips/${trip.slug}`)}>
                            <span className="material-symbols-outlined text-[18px]">visibility</span>
                            View Trip
                          </Button>

                          {isOwner && (
                            <div className="flex items-center gap-2">
                              <input
                                id={`upload-${trip.id}`}
                                type="file"
                                accept="image/*"
                                multiple
                                className="hidden"
                                onChange={(e) => {
                                  const files = Array.from(e.target.files || [])
                                  if (files.length === 0) return

                                  files.forEach((file) => {
                                    const reader = new FileReader()
                                    reader.onloadend = () => {
                                      const dataUrl = reader.result as string
                                      setTripPhotos((prev) => {
                                        const next = { ...prev, [trip.id]: [...(prev[trip.id] || []), dataUrl] }
                                        try {
                                          window.localStorage.setItem(
                                            `${storageKeyPrefix}${trip.id}`,
                                            JSON.stringify(next[trip.id])
                                          )
                                        } catch {
                                          // ignore
                                        }
                                        return next
                                      })
                                    }
                                    reader.readAsDataURL(file)
                                  })
                                }}
                              />
                              <label
                                htmlFor={`upload-${trip.id}`}
                                className="inline-flex items-center gap-2 h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer text-sm font-semibold"
                              >
                                <span className="material-symbols-outlined text-[18px]">add_photo_alternate</span>
                                Add Photos
                              </label>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </RoundedBox>

        {/* Privacy note (no email / no upcoming trips) */}
        <RoundedBox variant="default" padding="lg">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Privacy</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            This public profile only shows completed trips and shared photos. Upcoming trips and private contact details
            are not displayed.
          </p>
        </RoundedBox>

      </div>
    </div>
  )
}
