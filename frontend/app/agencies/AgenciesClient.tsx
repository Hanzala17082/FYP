'use client'

import { useEffect, useState } from 'react'
import { Header, BottomNavigation } from '@/shared/components/layout'
import { Avatar, RoundedBox, SectionHeader } from '@/shared/components/ui'
import Link from 'next/link'
import { agenciesService } from '@/services/agencies.service'
import type { AgencyDTO } from '@/types/api/trips.types'

export default function AgenciesClient() {
  const [agencies, setAgencies] = useState<AgencyDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    agenciesService
      .getAgencies({ limit: 50 })
      .then((res) => {
        if (!cancelled && res?.data?.agencies) setAgencies(res.data.agencies)
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message || 'Failed to load agencies')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen pb-24">
      <Header
        title="Travel Agencies"
        variant="light"
        showThemeToggle={true}
      />

      <main className="p-5">
        <SectionHeader title="Verified Agencies" className="mb-4" />
        {loading && <p className="text-slate-500 dark:text-slate-400">Loading…</p>}
        {error && <p className="text-red-500 dark:text-red-400">{error}</p>}
        <div className="flex flex-col gap-3">
          {!loading && agencies.map((agency) => (
            <Link key={agency.id} href={`/agencies/${agency.id}`}>
              <RoundedBox variant="default" padding="lg" className="hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <Avatar src={agency.logo || agency.avatar} name={agency.name} size="lg" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        {agency.name}
                      </h3>
                      {agency.verified && (
                        <span className="material-symbols-outlined text-primary text-sm">verified</span>
                      )}
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">location_on</span>
                      {agency.location || '—'}
                    </p>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-primary text-[16px]">star</span>
                        <span className="font-semibold text-slate-900 dark:text-white">{agency.rating}</span>
                        <span className="text-slate-500 dark:text-slate-400">
                          ({agency.reviewCount} reviews)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </RoundedBox>
            </Link>
          ))}
        </div>
      </main>

      <BottomNavigation
        items={[
          { href: '/traveler/dashboard', icon: 'home', label: 'Home' },
          { href: '/trips', icon: 'explore', label: 'Explore' },
          { href: '/profile', icon: 'person', label: 'Profile' },
        ]}
        variant="default"
      />
    </div>
  )
}
