'use client'

import Link from 'next/link'
import { Header } from '@/shared/components/layout'
import { Button, StatusBadge, Avatar, ThemeToggle, SectionHeader } from '@/shared/components/ui'
import { RoundedBox } from '@/shared/components/ui'
import { TripReviewCard } from '@/shared/components/trips/TripReviewCard'
import { BackButton } from '@/shared/components/navigation'
import { findAgencyById } from '@/data/dummyAgencies'
import { ROUTES } from '@/config/constants'
import { cn } from '@/shared/utils/cn'

interface TripDetailClientProps {
  slug: string
}

export default function TripDetailClient({ slug }: TripDetailClientProps) {
  // Get agency data from dummy data
  const agency = findAgencyById('agency-1') // Using Global Travels Inc
  
  const trip = {
    id: slug,
    title: 'Tech Conference 2024 - San Francisco',
    agencyId: 'agency-1',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB976Fq05Wg6VqoNWnn0h7n3_L8fLph0yDJCZcPrJfVi5OftNdiZOqeaQBXGVHAObFO9sOjwAP_yY0EQ0HM2voe6S3TP2sSIW_v1824MIAv1QIqcuJXKduZcCg_Lo9HOUD9nLYxEyaou3_UGbMiGyCz5MXKhr9n5F449USjn1oXR48hAmWwNW8vshZDi54Hs1Eh93syd4cD3iH7ywKV805SVUsImkuDTKpAqzjNvZ1Zc1D3nKQYv3QwFxhY3RhWfLszUsOija17vyY',
    price: 1250,
    duration: 4,
    startDate: 'Oct 12, 2024',
    endDate: 'Oct 16, 2024',
    destination: 'San Francisco, CA',
    description:
      'Join us for an exciting tech conference in the heart of San Francisco. Network with industry leaders, attend workshops, and explore the latest innovations in technology. This comprehensive 4-day experience combines professional development with cultural exploration.',
    highlights: [
      'Keynote speeches from industry leaders',
      'Networking sessions',
      'Workshop access',
      'Conference materials',
      'Coffee breaks and lunch',
    ],
    rating: 4.8,
    reviewCount: 124,
    // Complete Schedule/Itinerary
    schedule: [
      {
        day: 1,
        date: 'Oct 12, 2024',
        title: 'Arrival & Welcome Reception',
        activities: [
          { time: '10:00 AM', activity: 'Airport pickup and hotel check-in' },
          { time: '2:00 PM', activity: 'Welcome lunch at hotel restaurant' },
          { time: '4:00 PM', activity: 'City tour of San Francisco (Golden Gate Bridge, Fisherman\'s Wharf)' },
          { time: '7:00 PM', activity: 'Welcome reception and networking dinner' },
        ],
      },
      {
        day: 2,
        date: 'Oct 13, 2024',
        title: 'Conference Day 1',
        activities: [
          { time: '8:00 AM', activity: 'Breakfast at hotel' },
          { time: '9:00 AM', activity: 'Opening keynote: "Future of Technology" by industry leaders' },
          { time: '11:00 AM', activity: 'Workshop Session A: AI & Machine Learning' },
          { time: '1:00 PM', activity: 'Lunch break with networking' },
          { time: '2:30 PM', activity: 'Workshop Session B: Cloud Computing & DevOps' },
          { time: '4:30 PM', activity: 'Panel Discussion: "Innovation in Tech"' },
          { time: '6:00 PM', activity: 'Free time for exploration' },
          { time: '8:00 PM', activity: 'Group dinner at local restaurant' },
        ],
      },
      {
        day: 3,
        date: 'Oct 14, 2024',
        title: 'Conference Day 2 & Recreational Activities',
        activities: [
          { time: '8:00 AM', activity: 'Breakfast at hotel' },
          { time: '9:00 AM', activity: 'Keynote: "Digital Transformation Strategies"' },
          { time: '11:00 AM', activity: 'Workshop Session C: Cybersecurity & Data Privacy' },
          { time: '1:00 PM', activity: 'Lunch break' },
          { time: '2:00 PM', activity: 'Recreational Activity: Alcatraz Island Tour' },
          { time: '5:00 PM', activity: 'Wine tasting at Napa Valley (optional)' },
          { time: '7:00 PM', activity: 'Conference closing ceremony' },
          { time: '8:30 PM', activity: 'Farewell dinner and awards ceremony' },
        ],
      },
      {
        day: 4,
        date: 'Oct 15, 2024',
        title: 'Departure',
        activities: [
          { time: '8:00 AM', activity: 'Breakfast and hotel check-out' },
          { time: '10:00 AM', activity: 'Optional: Visit to Silicon Valley tech companies' },
          { time: '2:00 PM', activity: 'Airport transfer and departure' },
        ],
      },
    ],
    // Recreational Activities
    recreationalActivities: [
      {
        name: 'Golden Gate Bridge & City Tour',
        description: 'Explore iconic San Francisco landmarks including the Golden Gate Bridge, Fisherman\'s Wharf, and Alcatraz Island.',
        duration: '4 hours',
        included: true,
      },
      {
        name: 'Alcatraz Island Tour',
        description: 'Visit the famous former prison island with guided audio tour and stunning views of the bay.',
        duration: '3 hours',
        included: true,
      },
      {
        name: 'Napa Valley Wine Tasting',
        description: 'Experience world-class wine tasting in California\'s premier wine region with transportation included.',
        duration: '5 hours',
        included: false,
        additionalCost: 150,
      },
      {
        name: 'Silicon Valley Tech Company Tour',
        description: 'Visit headquarters of major tech companies including Google, Apple, and Facebook campuses.',
        duration: '4 hours',
        included: false,
        additionalCost: 100,
      },
      {
        name: 'Cable Car Ride & Chinatown Exploration',
        description: 'Experience San Francisco\'s historic cable cars and explore the vibrant Chinatown district.',
        duration: '2 hours',
        included: true,
      },
    ],
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

  if (!agency) {
    return <div>Agency not found</div>
  }

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen pb-24">
      <Header
        title="Trip Details"
        variant="light"
        showThemeToggle={false}
        rightAction={
          <div className="flex items-center gap-2">
            <BackButton href={ROUTES.TRIPS} label="Back to Trips" />
            <ThemeToggle />
          </div>
        }
      />

      {/* Hero Image */}
      <div className="relative h-64 w-full">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${trip.image}')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
        <div className="absolute top-3 left-3">
          <StatusBadge status="approved" size="sm" />
        </div>
      </div>

      <div className="p-5 space-y-6">
        {/* Trip Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{trip.title}</h1>
          <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mb-4">
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[18px]">location_on</span>
              <span>{trip.destination}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[18px]">calendar_month</span>
              <span>
                {trip.startDate} - {trip.endDate}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[18px]">schedule</span>
              <span>{trip.duration} Days</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[18px]">star</span>
              <span>
                {trip.rating} ({trip.reviewCount} reviews)
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        <RoundedBox variant="default" padding="lg">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">About This Trip</h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{trip.description}</p>
          </div>
        </RoundedBox>

        {/* Highlights */}
        <RoundedBox variant="default" padding="lg">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">What&apos;s Included</h2>
            <ul className="space-y-2">
              {trip.highlights.map((highlight, index) => (
                <li key={index} className="flex items-start gap-2 text-slate-600 dark:text-slate-400">
                  <span className="material-symbols-outlined text-primary text-sm mt-0.5">check_circle</span>
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          </div>
        </RoundedBox>

        {/* Complete Schedule/Itinerary */}
        <RoundedBox variant="default" padding="lg">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Complete Schedule</h2>
            <div className="space-y-6">
              {trip.schedule.map((day, dayIndex) => (
                <div key={dayIndex} className="border-l-2 border-primary pl-4 pb-4 last:pb-0">
                  <div className="mb-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-primary font-bold text-sm">Day {day.day}</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">{day.date}</span>
                    </div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">{day.title}</h3>
                  </div>
                  <div className="space-y-2">
                    {day.activities.map((activity, actIndex) => (
                      <div key={actIndex} className="flex gap-3 text-sm">
                        <span className="font-medium text-slate-600 dark:text-slate-400 min-w-[80px]">
                          {activity.time}
                        </span>
                        <span className="text-slate-700 dark:text-slate-300 flex-1">
                          {activity.activity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </RoundedBox>

        {/* Recreational Activities */}
        <RoundedBox variant="default" padding="lg">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Recreational Activities</h2>
            <div className="space-y-4">
              {trip.recreationalActivities.map((activity, index) => (
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
                      <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-semibold rounded-lg">
                        +${activity.additionalCost}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{activity.description}</p>
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span className="material-symbols-outlined text-[16px]">schedule</span>
                    <span>{activity.duration}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </RoundedBox>

        {/* Agency Details Section */}
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
              <Avatar src={agency.avatar} name={agency.name} size="lg" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{agency.name}</h3>
                  {agency.verified && (
                    <span className="material-symbols-outlined text-primary text-sm">verified</span>
                  )}
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                  {agency.city}, {agency.country} • {agency.yearsExperience} years experience
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">{agency.description}</p>

                {/* Agency Stats */}
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[18px]">star</span>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {agency.rating.toFixed(1)}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {agency.reviewCount} reviews
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[18px]">flight</span>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {agency.tripsCount}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Trips organized</p>
                    </div>
                  </div>
                </div>

                {/* Agency Specialties */}
                <div className="flex flex-wrap gap-2 mb-3">
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

            {/* Agency Reviews Preview */}
            {agency.reviews && agency.reviews.length > 0 && (
              <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-slate-900 dark:text-white">Agency Reviews</h3>
                  <Link
                    href={`/agencies/${agency.id}`}
                    className="text-primary text-sm font-medium hover:underline"
                  >
                    See all ({agency.reviewCount})
                  </Link>
                </div>
                <div className="space-y-3">
                  {agency.reviews.slice(0, 2).map((review) => (
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
          </div>
        </RoundedBox>

        {/* Booking Section */}
        <div className="sticky bottom-0 bg-background-light dark:bg-background-dark border-t border-slate-200 dark:border-slate-800 p-5 -mx-5 mt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Starting from
              </p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">
                ${trip.price.toLocaleString()}
              </p>
            </div>
          </div>
          <Button variant="primary" size="lg" className="w-full h-14">
            Book Now
          </Button>
        </div>
      </div>
    </div>
  )
}
