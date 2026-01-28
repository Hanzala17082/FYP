'use client'

import { useRouter } from 'next/navigation'
import { Header } from '@/shared/components/layout'
import { Avatar, RoundedBox, Button, ThemeToggle } from '@/shared/components/ui'
import { BackButton } from '@/shared/components/navigation'
import { findAgencyById } from '@/data/dummyAgencies'
import { cn } from '@/shared/utils/cn'

interface AdminAgencyProfileClientProps {
  agencyId: string
}

export default function AdminAgencyProfileClient({ agencyId }: AdminAgencyProfileClientProps) {
  const router = useRouter()
  const agency = findAgencyById(agencyId)

  if (!agency) {
    return (
      <div className="bg-background-light dark:bg-background-dark min-h-screen p-5">
        <Header
          title="Agency Not Found"
          variant="light"
          showThemeToggle={false}
          rightAction={<ThemeToggle />}
        />
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
        title="Agency Details"
        subtitle="Admin View"
        variant="light"
        showThemeToggle={false}
        rightAction={
          <div className="flex items-center gap-2">
            <BackButton href="/admin/dashboard" label="Back to Dashboard" />
            <ThemeToggle />
          </div>
        }
      />

      <div className="p-5 space-y-6 max-w-5xl mx-auto">
        {/* Agency Header */}
        <RoundedBox variant="default" padding="lg">
          <div className="flex flex-col md:flex-row items-start gap-4">
            <Avatar src={agency.avatar} name={agency.name} size="xl" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{agency.name}</h1>
                {agency.verified && <span className="material-symbols-outlined text-primary text-xl">verified</span>}
              </div>
              <p className="text-slate-500 dark:text-slate-400 mb-3">
                {agency.city}, {agency.country} • {agency.yearsExperience} years of experience
              </p>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">{agency.description}</p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="flex items-center gap-1 mb-1">{renderStars(agency.rating)}</div>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">{agency.rating.toFixed(1)}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{agency.reviewCount} reviews</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">{agency.tripsCount}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Trips organized</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">{agency.stats.totalTravelers}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Total travelers</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">{agency.stats.responseRate}%</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Response rate</p>
                </div>
              </div>
            </div>
          </div>
        </RoundedBox>

        {/* Private Contact Information (Admin Only) */}
        <RoundedBox variant="default" padding="lg">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Private Contact Information</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-slate-400 dark:text-slate-500">email</span>
              <span className="text-slate-700 dark:text-slate-300">{agency.email}</span>
            </div>
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
      </div>
    </div>
  )
}

