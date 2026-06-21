'use client'

import { memo } from 'react'
import { ThemeToggle } from '@/shared/components/ui'
import { LogoutButton } from '@/shared/components/auth/LogoutButton'
import { NavButton } from '@/shared/components/navigation'
import { ROUTES } from '@/config/constants'

/** Admin top-bar actions: dashboard link, theme, logout only. */
export const AdminHeaderActions = memo(function AdminHeaderActions() {
  return (
    <div className="flex flex-wrap items-center justify-end gap-1.5 sm:gap-2">
      <NavButton href={ROUTES.DASHBOARD.ADMIN} label="Dashboard" icon="dashboard" variant="default" />
      <ThemeToggle />
      <LogoutButton />
    </div>
  )
})
