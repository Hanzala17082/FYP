'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Header, BottomNavigation } from '@/shared/components/layout'
import {
  StatCard,
  BookingCard,
  Button,
  ThemeToggle,
  RoundedBox,
  Avatar,
} from '@/shared/components/ui'
import { SectionHeader } from '@/shared/components/ui'
import { LogoutButton } from '@/shared/components/auth/LogoutButton'
import { NavButton } from '@/shared/components/navigation'
import { TripImageGallery } from '@/shared/components/trips/TripImageGallery'
import { TripReviewCard } from '@/shared/components/trips/TripReviewCard'
import { AddTripModal } from '@/shared/components/trips/AddTripModal'
import { useAuth } from '@/shared/contexts/AuthContext'
import { ROUTES, USER_ROLES } from '@/config/constants'
import { getTripsByAgencyId } from '@/data/dummyTrips'
import { cn } from '@/shared/utils/cn'

// Completed Trip Detail Modal
function CompletedTripModal({
  isOpen,
  onClose,
  trip,
}: {
  isOpen: boolean
  onClose: () => void
  trip: any
}) {
  const [agencyImages, setAgencyImages] = useState<string[]>([])

  // Update agencyImages when trip changes
  useEffect(() => {
    if (trip?.agencyImages) {
      setAgencyImages(trip.agencyImages)
    } else {
      setAgencyImages([])
    }
  }, [trip])

  if (!isOpen || !trip) return null

  const handleAddImage = async (file: File) => {
    // In production, this would upload to server
    // For now, create a local URL
    const imageUrl = URL.createObjectURL(file)
    setAgencyImages([...agencyImages, imageUrl])
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500))
  }

  const averageRating =
    trip.reviews && trip.reviews.length > 0
      ? trip.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / trip.reviews.length
      : 0

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto my-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{trip.title}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {trip.dates} • {trip.destination}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined text-slate-600 dark:text-slate-400">close</span>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Trip Stats */}
          <div className="grid grid-cols-3 gap-4">
            <RoundedBox padding="md" className="text-center">
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-1">Total Bookings</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{trip.totalBookings}</p>
            </RoundedBox>
            <RoundedBox padding="md" className="text-center">
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-1">Average Rating</p>
              <div className="flex items-center justify-center gap-1">
                <span className="material-symbols-outlined text-amber-400 text-xl">star</span>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {averageRating.toFixed(1)}
                </p>
              </div>
            </RoundedBox>
            <RoundedBox padding="md" className="text-center">
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-1">Total Reviews</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{trip.reviews?.length || 0}</p>
            </RoundedBox>
          </div>

          {/* Image Gallery */}
          <TripImageGallery
            images={trip.images || []}
            agencyImages={agencyImages}
            onAddImage={handleAddImage}
            canAddImages={true}
          />

          {/* Reviews Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Customer Reviews ({trip.reviews?.length || 0})
            </h3>
            {trip.reviews && trip.reviews.length > 0 ? (
              <div className="space-y-3">
                {trip.reviews.map((review: any) => (
                  <TripReviewCard key={review.id} review={review} />
                ))}
              </div>
            ) : (
              <RoundedBox padding="lg" className="text-center py-8">
                <span className="material-symbols-outlined text-4xl text-slate-400 dark:text-slate-500 mb-2">
                  rate_review
                </span>
                <p className="text-slate-500 dark:text-slate-400">No reviews yet</p>
              </RoundedBox>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AgencyDashboardClient() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuth()
  const [selectedTrip, setSelectedTrip] = useState<any>(null)
  const [isAddTripModalOpen, setIsAddTripModalOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  // Get agency trips
  const agencyTrips = user ? getTripsByAgencyId(user.id) : []

  // Ensure only authenticated Agency users can access
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated || !user) {
        router.push(ROUTES.LOGIN)
        return
      }
      if (user.role !== USER_ROLES.AGENCY) {
        // Redirect to appropriate dashboard based on role
        if (user.role === USER_ROLES.TRAVELER) {
          router.push(ROUTES.DASHBOARD.TRAVELER)
        } else if (user.role === USER_ROLES.ADMIN) {
          router.push(ROUTES.DASHBOARD.ADMIN)
        } else {
          router.push(ROUTES.LOGIN)
        }
        return
      }
    }
  }, [isAuthenticated, isLoading, user, router])

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render if not authenticated or not an agency
  if (!isAuthenticated || !user || user.role !== USER_ROLES.AGENCY) {
    return null
  }
  
  const bookings = [
    {
      id: '1',
      traveler: {
        name: 'Sarah Jenkins',
        avatar:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuDhCf_efRLPO2bQY0ZveeU6AMPr1d4FAfhALp7SU9CMjkhxHa6DVOh59KJSZS_msTrjRef96S0OCAUNIkBAhFV3UBTxUzwcSrNQcgo2hIz0-aDXG0I5vEqsni87c-lleXZsOWP-BUuaOpRzYCCnYzf2g8yNiHljxNz7eu5TjL9JNfMHFipaxGOONzg1oXGFMb6MtwNktsKuzDQptcaWJ1DPE_uPsp1AgpCnzCcrdfXYniovXGDWs48x5-P1dNKCBFRObZCcbCZuET0',
        status: 'online' as const,
      },
      trip: {
        destination: 'Bali Retreat',
        dates: 'Oct 12-19',
      },
      status: 'pending' as const,
      timeAgo: '2h ago',
    },
    {
      id: '2',
      traveler: {
        name: 'Tech Corp',
        avatar:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuBzUsDXs7q9xlpRA5MQqiQ2l7826rinDU44Mrntu0P9mfbCY8ULA5qLYOlNHtKweEyQPBR35czzP2S3C7zcCmwhJ5KZAea43ZUUwOIcGGQ3vO8Bbjx69-7SrY8AJOA8aHxKsAyGVainntUTpd0pZQw1u6GWqg9XwNyIo6axrB35iW9Xqn1fwK459d4gKM6uRoklapacCDyusQGR-pIveDQon59K-I2JFLdHt5YOva_G7uqh2TlZN7o8rcyPe7m5eOxJvn4Os8Xy4fI',
        status: 'online' as const,
      },
      trip: {
        destination: 'NYC Conference',
        dates: 'Nov 02-05',
      },
      status: 'confirmed' as const,
      timeAgo: '1d ago',
    },
    {
      id: '3',
      traveler: {
        name: 'John Doe',
        avatar:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuATYwzdYgoDurSA5EH6Pm04tANR6UPaa_aOVipElVmXyAgkCf4DF_fqxYhWUDLfFqdHsn07JHCSqpSb2DqcLvzruuNL_hoxCxAvaeFAndRVP789U07vC7mviQ96GGOxeT2p5S_Kx1XeheYnsHormkDpxC4zHE--WfkLa2Vnbl2GkbT5BaU5azS1ZivjD0wBZtLu_JJ6_6FXL_eUm5MxaBtUoKFXdTZqYby-hETTYruaCb6FX7sGTP2NiDoBk4n78yA4JmkLrpLS3PE',
      },
      trip: {
        destination: 'Alps Skiing',
        dates: 'Dec 10-17',
      },
      status: 'reviewing' as const,
      timeAgo: '2d ago',
    },
  ]

  const completedTrips = [
    {
      id: '1',
      title: 'Bali Paradise Retreat',
      destination: 'Bali, Indonesia',
      dates: 'Aug 15-22, 2024',
      totalBookings: 24,
      images: [
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBEgIScqGkIVftRRaeJHC_hdObj1Lpm-Ka96KF79X5kg4WgcRJKOY7QaiqThZW6ZM9vhFQ8ZPP8iR0cLHjl7AUjRZ5cOhHTeKd35c35RFLOFNtVNbbfftu78izR9MKLT4_jGIv52TbEb3pOtWxWlUjBusKQ2utZ3Dol4Iaxnl_GId-mVvsa3vZql3dU2SBFvAFgJ02qB5qneCXVZ_Ey8EB1PiuylvWcfT0M_FsW4l3aHiZlRBHZ98uaYWe7Yx3m8HMaDAEZhVrft-c',
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBOMq-Qvj6UPiHUEMmuhkqCsaLoR2Am8FTkRSgnHfeCrqi_v1H8ABo1aeDiwEGHd3EL2hMhXI79Vq560zcY17r3uCy5936HGN_aE_xPXjetT2kyNFxUELESK5dNqi_Bso-EundsfiRAgXtiTnDz_jGj8Gmbq-_at-wO4cxbHFI_dqe7lltcpZ_LdQD4h3NNrCuYU3w5jhJF5ktHloAJVw-OqsQ1RfzfSly34iGRKVK4_ROuBEw-a_a81PCGpyTbYamSzxqqws6s75c',
      ],
      agencyImages: [],
      reviews: [
        {
          id: '1',
          user: {
            name: 'Sarah Johnson',
            avatar:
              'https://lh3.googleusercontent.com/aida-public/AB6AXuAtQvhVyGhF9vZ2gsk0k12yfZjV1oZtLzZ-UIRwC7O2kA_1CnL84yqN4ftXTib6f6aBfGO1OG7wLhddpC-l-wmrR_Tii_i_F9pcGhCN8mwO9RE95-e4aJ-PHyJmofmLaxf3ihyT0R7BU4nCj-lhB6p0g0kx-hno1eWq0yCT4LNRuKILXyFBKIWGhDM-B9FUuGE4_PfSLjFqlA_X9XHaz4UYKbONkatEm6R5uqz-YIda0WwyqPS-5KuUpewqj8m--XOBZEnQGTO0QDc',
          },
          rating: 5,
          comment:
            'Amazing experience! The trip was well-organized and the accommodations were beautiful. Highly recommend!',
          date: '2 weeks ago',
          images: [
            'https://lh3.googleusercontent.com/aida-public/AB6AXuBEgIScqGkIVftRRaeJHC_hdObj1Lpm-Ka96KF79X5kg4WgcRJKOY7QaiqThZW6ZM9vhFQ8ZPP8iR0cLHjl7AUjRZ5cOhHTeKd35c35RFLOFNtVNbbfftu78izR9MKLT4_jGIv52TbEb3pOtWxWlUjBusKQ2utZ3Dol4Iaxnl_GId-mVvsa3vZql3dU2SBFvAFgJ02qB5qneCXVZ_Ey8EB1PiuylvWcfT0M_FsW4l3aHiZlRBHZ98uaYWe7Yx3m8HMaDAEZhVrft-c',
          ],
        },
        {
          id: '2',
          user: {
            name: 'Mike Chen',
            avatar:
              'https://lh3.googleusercontent.com/aida-public/AB6AXuATYwzdYgoDurSA5EH6Pm04tANR6UPaa_aOVipElVmXyAgkCf4DF_fqxYhWUDLfFqdHsn07JHCSqpSb2DqcLvzruuNL_hoxCxAvaeFAndRVP789U07vC7mviQ96GGOxeT2p5S_Kx1XeheYnsHormkDpxC4zHE--WfkLa2Vnbl2GkbT5BaU5azS1ZivjD0wBZtLu_JJ6_6FXL_eUm5MxaBtUoKFXdTZqYby-hETTYruaCb6FX7sGTP2NiDoBk4n78yA4JmkLrpLS3PE',
          },
          rating: 4,
          comment: 'Great trip overall! The food was excellent and the activities were fun. Would book again.',
          date: '3 weeks ago',
        },
        {
          id: '3',
          user: {
            name: 'Emily Davis',
            avatar:
              'https://lh3.googleusercontent.com/aida-public/AB6AXuDhCf_efRLPO2bQY0ZveeU6AMPr1d4FAfhALp7SU9CMjkhxHa6DVOh59KJSZS_msTrjRef96S0OCAUNIkBAhFV3UBTxUzwcSrNQcgo2hIz0-aDXG0I5vEqsni87c-lleXZsOWP-BUuaOpRzYCCnYzf2g8yNiHljxNz7eu5TjL9JNfMHFipaxGOONzg1oXGFMb6MtwNktsKuzDQptcaWJ1DPE_uPsp1AgpCnzCcrdfXYniovXGDWs48x5-P1dNKCBFRObZCcbCZuET0',
          },
          rating: 5,
          comment:
            'Perfect vacation! The views were breathtaking and the service was top-notch. Thank you for an unforgettable experience!',
          date: '1 month ago',
          images: [
            'https://lh3.googleusercontent.com/aida-public/AB6AXuBOMq-Qvj6UPiHUEMmuhkqCsaLoR2Am8FTkRSgnHfeCrqi_v1H8ABo1aeDiwEGHd3EL2hMhXI79Vq560zcY17r3uCy5936HGN_aE_xPXjetT2kyNFxUELESK5dNqi_Bso-EundsfiRAgXtiTnDz_jGj8Gmbq-_at-wO4cxbHFI_dqe7lltcpZ_LdQD4h3NNrCuYU3w5jhJF5ktHloAJVw-OqsQ1RfzfSly34iGRKVK4_ROuBEw-a_a81PCGpyTbYamSzxqqws6s75c',
            'https://lh3.googleusercontent.com/aida-public/AB6AXuCxmWDsIkXAsVqGnpCtc1Vyv2qkRrUb08_FOxVFn1ZMbSJFG9CbeIEf6Op957d44rKcURMs8D4_ebvS9z5fao7VESH-GV__Jp1uCerJMMWqe4YEI3Z3nmT4FyjwRmN6mVPvzyaM5OBh1ILh3AfMcG-woKpe95ahKSC2QqiHfViX4c6g4IM77srkrJNcvtIhqPgynhWIYh9I1GK2QfkTRs8JOqE-gg63I_P7YfYrU6kxDjQcwWd3JSIIgStM7ROyPN1B3hwnwQo4_G4',
          ],
        },
      ],
    },
    {
      id: '2',
      title: 'Tokyo Business Conference',
      destination: 'Tokyo, Japan',
      dates: 'Jul 10-15, 2024',
      totalBookings: 18,
      images: [
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCxmWDsIkXAsVqGnpCtc1Vyv2qkRrUb08_FOxVFn1ZMbSJFG9CbeIEf6Op957d44rKcURMs8D4_ebvS9z5fao7VESH-GV__Jp1uCerJMMWqe4YEI3Z3nmT4FyjwRmN6mVPvzyaM5OBh1ILh3AfMcG-woKpe95ahKSC2QqiHfViX4c6g4IM77srkrJNcvtIhqPgynhWIYh9I1GK2QfkTRs8JOqE-gg63I_P7YfYrU6kxDjQcwWd3JSIIgStM7ROyPN1B3hwnwQo4_G4',
      ],
      agencyImages: [],
      reviews: [
        {
          id: '1',
          user: {
            name: 'David Kim',
            avatar:
              'https://lh3.googleusercontent.com/aida-public/AB6AXuBzUsDXs7q9xlpRA5MQqiQ2l7826rinDU44Mrntu0P9mfbCY8ULA5qLYOlNHtKweEyQPBR35czzP2S3C7zcCmwhJ5KZAea43ZUUwOIcGGQ3vO8Bbjx69-7SrY8AJOA8aHxKsAyGVainntUTpd0pZQw1u6GWqg9XwNyIo6axrB35iW9Xqn1fwK459d4gKM6uRoklapacCDyusQGR-pIveDQon59K-I2JFLdHt5YOva_G7uqh2TlZN7o8rcyPe7m5eOxJvn4Os8Xy4fI',
          },
          rating: 5,
          comment: 'Excellent conference organization! Everything was on time and professional.',
          date: '2 months ago',
        },
      ],
    },
    {
      id: '3',
      title: 'European Adventure',
      destination: 'Paris, France',
      dates: 'Jun 5-12, 2024',
      totalBookings: 32,
      images: [
        'https://lh3.googleusercontent.com/aida-public/AB6AXuA_QlhZhBz5YC9ZcxTT4Mr_-n_DfGBQGs8f8DYElLF48g0aBx5jGBszWimY-BWbtBnpH_oPRIYXoqL94jdRFk7K13Vz4h2MWEEAXBDp6jE7skW_m0D5w-0MtvekdiuFFgjh_p4OpSJyjWG1lAkmCmr5YmrYbwT3xyVntx8W6oP6Zm6Gr4M-u8rOGVTz-FycH4lsXgMVxqmTfsLur6_BKhgBAnrhmnVZybN_bKsr-Gl_AP-4ehx6_uq2eyEm-TboVRTH23PXxGdb45w',
      ],
      agencyImages: [],
      reviews: [
        {
          id: '1',
          user: {
            name: 'Lisa Anderson',
            avatar:
              'https://lh3.googleusercontent.com/aida-public/AB6AXuAtQvhVyGhF9vZ2gsk0k12yfZjV1oZtLzZ-UIRwC7O2kA_1CnL84yqN4ftXTib6f6aBfGO1OG7wLhddpC-l-wmrR_Tii_i_F9pcGhCN8mwO9RE95-e4aJ-PHyJmofmLaxf3ihyT0R7BU4nCj-lhB6p0g0kx-hno1eWq0yCT4LNRuKILXyFBKIWGhDM-B9FUuGE4_PfSLjFqlA_X9XHaz4UYKbONkatEm6R5uqz-YIda0WwyqPS-5KuUpewqj8m--XOBZEnQGTO0QDc',
          },
          rating: 5,
          comment: 'Absolutely magical! The itinerary was perfect and we saw all the highlights.',
          date: '3 months ago',
        },
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display overflow-x-hidden pb-24 md:pb-8">
      <Header
        title="Tripster"
        subtitle="Agency Dashboard"
        variant="light"
        showThemeToggle={false}
        rightAction={
          <div className="flex items-center gap-2">
            <NavButton
              href={ROUTES.TRIPS}
              label="Browse Trips"
              icon="explore"
              variant="default"
            />
            <ThemeToggle />
            <LogoutButton />
          </div>
        }
      />

      <main className="flex flex-col w-full max-w-7xl mx-auto">
        <section className="px-5 py-6 md:px-8 md:py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              title="Total Revenue"
              value="$124,500"
              subtitle="vs. last month"
              icon={<span className="material-symbols-outlined">payments</span>}
              trend={{ value: '+12%', isPositive: true }}
              className="col-span-2 md:col-span-1"
            />
            <StatCard
              title="Bookings"
              value="84"
              trend={{ value: '5%', isPositive: true }}
            />
            <StatCard
              title="Active Trips"
              value="12"
              trend={{ value: '0%', isPositive: false }}
            />
            <StatCard
              title="Pending"
              value="8"
              trend={{ value: '-2%', isPositive: false }}
            />
          </div>
        </section>

        <section className="px-5 pb-6 md:px-8">
          <Button
            variant="primary"
            size="lg"
            className="w-full md:w-auto h-14"
            onClick={() => setIsAddTripModalOpen(true)}
          >
            <span className="material-symbols-outlined text-[24px]">add_circle</span>
            <span>Post New Trip</span>
          </Button>
        </section>

        {/* My Trips Section */}
        {agencyTrips.length > 0 && (
          <section className="flex flex-col px-5 md:px-8 py-6">
            <SectionHeader
              title="My Trips"
              action={{ label: 'View All', href: `/agencies/${user?.id}/trips` }}
              className="mb-4"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {agencyTrips.slice(0, 3).map((trip) => (
                <RoundedBox
                  key={trip.id}
                  padding="none"
                  className="overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-200"
                  onClick={() => router.push(`/trips/${trip.slug}`)}
                >
                  <div className="relative h-48 w-full">
                    <div
                      className="absolute inset-0 bg-cover bg-center"
                      style={{ backgroundImage: `url('${trip.images[0]}')` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3">
                      <h3 className="text-white font-bold text-lg mb-1">{trip.title}</h3>
                      <p className="text-white/90 text-sm">{trip.destination}</p>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-slate-500 dark:text-slate-400 text-sm">
                        {trip.startDate} - {trip.endDate}
                      </span>
                      <span className="text-lg font-bold text-slate-900 dark:text-white">
                        ${trip.price.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                          trip.status === 'active'
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                            : trip.status === 'pending'
                              ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {trip.status}
                      </span>
                    </div>
                  </div>
                </RoundedBox>
              ))}
            </div>
          </section>
        )}

        <section className="flex flex-col">
          <SectionHeader
            title="Recent Requests"
            action={{ label: 'View All', href: '/agency/bookings' }}
            className="px-5 md:px-8 pb-3"
          />
          <div className="flex flex-col gap-px bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 mx-5 md:mx-8 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-4 md:bg-transparent md:border-0">
            {bookings.map((booking) => (
              <div key={booking.id} className="md:bg-slate-100 dark:md:bg-slate-800 md:rounded-2xl md:border md:border-slate-200 dark:md:border-slate-800 md:overflow-hidden">
                <BookingCard {...booking} />
              </div>
            ))}
          </div>
        </section>

        {/* Completed Trips Section */}
        <section className="flex flex-col px-5 md:px-8 py-6">
          <SectionHeader
            title="Completed Trips"
            action={{ label: 'View All', href: '/agency/trips/completed' }}
            className="mb-4"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {completedTrips.map((trip) => {
              const avgRating =
                trip.reviews && trip.reviews.length > 0
                  ? trip.reviews.reduce((sum, r) => sum + r.rating, 0) / trip.reviews.length
                  : 0

              return (
                <RoundedBox
                  key={trip.id}
                  padding="none"
                  className="overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
                  onClick={() => setSelectedTrip(trip)}
                >
                  {/* Trip Image */}
                  <div className="relative h-48 w-full">
                    <div
                      className="absolute inset-0 bg-cover bg-center"
                      style={{ backgroundImage: `url('${trip.images[0]}')` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3">
                      <h3 className="text-white font-bold text-lg mb-1">{trip.title}</h3>
                      <p className="text-white/90 text-sm">{trip.destination}</p>
                    </div>
                  </div>

                  {/* Trip Info */}
                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500 dark:text-slate-400">{trip.dates}</span>
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-amber-400 text-sm">star</span>
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {avgRating > 0 ? avgRating.toFixed(1) : 'N/A'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-slate-400 dark:text-slate-500 text-sm">
                          group
                        </span>
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                          {trip.totalBookings} bookings
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-slate-400 dark:text-slate-500 text-sm">
                          rate_review
                        </span>
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                          {trip.reviews?.length || 0} reviews
                        </span>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedTrip(trip)
                      }}
                    >
                      <span className="material-symbols-outlined text-[18px]">visibility</span>
                      View Details
                    </Button>
                  </div>
                </RoundedBox>
              )
            })}
          </div>
        </section>
      </main>

      {/* Completed Trip Detail Modal */}
      <CompletedTripModal
        isOpen={!!selectedTrip}
        onClose={() => setSelectedTrip(null)}
        trip={selectedTrip}
      />

      {/* Add Trip Modal */}
      <AddTripModal
        isOpen={isAddTripModalOpen}
        onClose={() => setIsAddTripModalOpen(false)}
        onSuccess={() => {
          setRefreshKey((prev) => prev + 1)
          // Force re-render to show new trip
          window.location.reload()
        }}
      />

      <BottomNavigation
        items={[
          { href: '/agency/dashboard', icon: 'dashboard', label: 'Home' },
          { href: '/agency/analytics', icon: 'analytics', label: 'Analytics' },
          { href: '/agency/trips', icon: 'flight', label: 'Trips' },
          { href: '/agency/messages', icon: 'chat_bubble', label: 'Messages' },
          { href: '/agency/profile', icon: 'person', label: 'Profile' },
        ]}
        variant="agency"
      />
      <div className="h-24"></div>
    </div>
  )
}
