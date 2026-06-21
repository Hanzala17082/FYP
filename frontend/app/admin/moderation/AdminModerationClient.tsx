'use client'

import { Header } from '@/shared/components/layout'
import { SectionHeader, ThemeToggle } from '@/shared/components/ui'
import { LogoutButton } from '@/shared/components/auth/LogoutButton'
import { NavButton } from '@/shared/components/navigation'
import { ModerationFlagList } from '@/shared/components/moderation/ModerationFlagList'
import { ROUTES } from '@/config/constants'

export default function AdminModerationClient() {
  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen">
      <Header
        title="Moderation Queue"
        subtitle="Flagged chat messages across all agencies"
        variant="light"
        showThemeToggle={false}
        rightAction={
          <div className="flex items-center gap-2">
            <NavButton href={ROUTES.DASHBOARD.ADMIN} label="Dashboard" icon="dashboard" variant="default" />
            <ThemeToggle />
            <LogoutButton />
          </div>
        }
      />

      <main className="flex flex-col w-full max-w-5xl mx-auto p-5 md:p-8 space-y-6">
        <SectionHeader
          title="Flagged Messages"
          subtitle="Messages blocked for adult, hate, or harassment content"
        />
        <ModerationFlagList showAgency />
      </main>
    </div>
  )
}
