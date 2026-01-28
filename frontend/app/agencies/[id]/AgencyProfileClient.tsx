'use client'

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
import { BackButton } from '@/shared/components/navigation'
import { findAgencyById } from '@/data/dummyAgencies'
import { getTripsByAgencyId } from '@/data/dummyTrips'
import { cn } from '@/shared/utils/cn'
import Link from 'next/link'

interface AgencyProfileClientProps {
  agencyId: string
}

export default function AgencyProfileClient({ agencyId }: AgencyProfileClientProps) {
  const router = useRouter()
  const agency = findAgencyById(agencyId)
  const agencyTrips = getTripsByAgencyId(agencyId)

  if (!agency) {
    return (
      <div className="bg-background-light dark:bg-background-dark min-h-screen p-5">
        <Header title="Agency Not Found" variant="light" showThemeToggle={false} rightAction={<ThemeToggle />} />
        <RoundedBox padding="lg" className="text-center py-12 mt-6">
          <p className="text-slate-600 dark:text-slate-400">The agency you're looking for doesn't exist.</p>
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
            <BackButton onClick={() => router.back()} label="Go Back" />
            <ThemeToggle />
          </div>
        }
      />

      <div className="p-5 space-y-6">
        {/* Agency Header */}
        <RoundedBox variant="default" padding="lg">
          <div className="flex flex-col md:flex-row items-start gap-4">
            <Avatar src={agency.avatar} name={agency.name} size="xl" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{agency.name}</h1>
                {agency.verified && (
                  <span className="material-symbols-outlined text-primary text-xl">verified</span>
                )}
              </div>
              <p className="text-slate-500 dark:text-slate-400 mb-3">
                {agency.city}, {agency.country} • {agency.yearsExperience} years of experience
              </p>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                {agency.description}
              </p>

              {/* Rating & Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-1 mb-1">{renderStars(agency.rating)}</div>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">
                    {agency.rating.toFixed(1)}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {agency.reviewCount} reviews
                  </p>
                </div>
                <div>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">
                    {agency.tripsCount}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Trips organized</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">
                    {agency.stats.totalTravelers}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Total travelers</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">
                    {agency.stats.responseRate}%
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Response rate</p>
                </div>
              </div>

              {/* Specialties */}
              <div className="flex flex-wrap gap-2">
                {agency.specialties.map((specialty, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-primary/10 dark:bg-primary/20 text-primary text-xs font-medium rounded-full"
                  >
                    {specialty}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </RoundedBox>

        {/* Contact Information */}
        <RoundedBox variant="default" padding="lg">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Contact Information</h2>
          <div className="space-y-3">
            {agency.contact.email && (
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-slate-400 dark:text-slate-500">email</span>
                <span className="text-slate-700 dark:text-slate-300">{agency.contact.email}</span>
              </div>
            )}
            {agency.contact.phone && (
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-slate-400 dark:text-slate-500">phone</span>
                <span className="text-slate-700 dark:text-slate-300">{agency.contact.phone}</span>
              </div>
            )}
            {agency.contact.website && (
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-slate-400 dark:text-slate-500">language</span>
                <a
                  href={`https://${agency.contact.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {agency.contact.website}
                </a>
              </div>
            )}
            {agency.contact.address && (
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-slate-400 dark:text-slate-500">location_on</span>
                <span className="text-slate-700 dark:text-slate-300">{agency.contact.address}</span>
              </div>
            )}
          </div>
        </RoundedBox>

        {/* Languages */}
        {agency.languages && agency.languages.length > 0 && (
          <RoundedBox variant="default" padding="lg">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">Languages Spoken</h2>
            <div className="flex flex-wrap gap-2">
              {agency.languages.map((lang, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg"
                >
                  {lang}
                </span>
              ))}
            </div>
          </RoundedBox>
        )}

        {/* Agency Stats Details */}
        <RoundedBox variant="default" padding="lg">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Performance Metrics</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Response Time</p>
              <p className="text-lg font-bold text-slate-900 dark:text-white">
                {agency.stats.responseTime}
              </p>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Response Rate</p>
              <p className="text-lg font-bold text-slate-900 dark:text-white">
                {agency.stats.responseRate}%
              </p>
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
                    title={trip.title}
                    agency={{
                      name: trip.agency.name,
                      verified: trip.agency.verified,
                      avatar: trip.agency.avatar,
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
          </div>
        )}

        {/* Reviews Section */}
        {agency.reviews && agency.reviews.length > 0 && (
          <div className="space-y-4">
            <SectionHeader
              title={`All Reviews (${agency.reviews.length})`}
              className="px-0"
            />
            <div className="space-y-3">
              {agency.reviews.map((review) => (
                <TripReviewCard
                  key={review.id}
                  review={{
                    id: review.id,
                    user: review.user,
                    rating: review.rating,
                    comment: review.comment,
                    date: review.date,
                  }}
                />
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
