'use client'

import { Header, BottomNavigation } from '@/shared/components/layout'
import { Avatar, RoundedBox, ThemeToggle, SectionHeader } from '@/shared/components/ui'
import Link from 'next/link'

export default function AgenciesClient() {
  const agencies = [
    {
      id: '1',
      name: 'Global Corp Travel',
      verified: true,
      avatar:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBzUsDXs7q9xlpRA5MQqiQ2l7826rinDU44Mrntu0P9mfbCY8ULA5qLYOlNHtKweEyQPBR35czzP2S3C7zcCmwhJ5KZAea43ZUUwOIcGGQ3vO8Bbjx69-7SrY8AJOA8aHxKsAyGVainntUTpd0pZQw1u6GWqg9XwNyIo6axrB35iW9Xqn1fwK459d4gKM6uRoklapacCDyusQGR-pIveDQon59K-I2JFLdHt5YOva_G7uqh2TlZN7o8rcyPe7m5eOxJvn4Os8Xy4fI',
      location: 'San Francisco, CA',
      rating: 4.8,
      reviewCount: 124,
      tripsCount: 45,
    },
    {
      id: '2',
      name: 'Zenith Experiences',
      verified: true,
      avatar:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBOMq-Qvj6UPiHUEMmuhkqCsaLoR2Am8FTkRSgnHfeCrqi_v1H8ABo1aeDiwEGHd3EL2hMhXI79Vq560zcY17r3uCy5936HGN_aE_xPXjetT2kyNFxUELESK5dNqi_Bso-EundsfiRAgXtiTnDz_jGj8Gmbq-_at-wO4cxbHFI_dqe7lltcpZ_LdQD4h3NNrCuYU3w5jhJF5ktHloAJVw-OqsQ1RfzfSly34iGRKVK4_ROuBEw-a_a81PCGpyTbYamSzxqqws6s75c',
      location: 'Bali, Indonesia',
      rating: 4.9,
      reviewCount: 89,
      tripsCount: 32,
    },
    {
      id: '3',
      name: 'EuroExec Travel',
      verified: true,
      avatar:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuA_QlhZhBz5YC9ZcxTT4Mr_-n_DfGBQGs8f8DYElLF48g0aBx5jGBszWimY-BWbtBnpH_oPRIYXoqL94jdRFk7K13Vz4h2MWEEAXBDp6jE7skW_m0D5w-0MtvekdiuFFgjh_p4OpSJyjWG1lAkmCmr5YmrYbwT3xyVntx8W6oP6Zm6Gr4M-u8rOGVTz-FycH4lsXgMVxqmTfsLur6_BKhgBAnrhmnVZybN_bKsr-Gl_AP-4ehx6_uq2eyEm-TboVRTH23PXxGdb45w',
      location: 'London, UK',
      rating: 4.7,
      reviewCount: 156,
      tripsCount: 67,
    },
  ]

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen pb-24">
      <Header
        title="Travel Agencies"
        variant="light"
        showThemeToggle={true}
      />

      <main className="p-5">
        <SectionHeader title="Verified Agencies" className="mb-4" />
        <div className="flex flex-col gap-3">
          {agencies.map((agency) => (
            <Link key={agency.id} href={`/agencies/${agency.id}`}>
              <RoundedBox variant="default" padding="lg" className="hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <Avatar src={agency.avatar} name={agency.name} size="lg" />
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
                      {agency.location}
                    </p>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-primary text-[16px]">star</span>
                        <span className="font-semibold text-slate-900 dark:text-white">{agency.rating}</span>
                        <span className="text-slate-500 dark:text-slate-400">
                          ({agency.reviewCount} reviews)
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-primary text-[16px]">flight</span>
                        <span className="text-slate-500 dark:text-slate-400">
                          {agency.tripsCount} trips
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
