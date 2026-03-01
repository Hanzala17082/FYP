'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/shared/contexts/AuthContext'
import { ROUTES, USER_ROLES } from '@/config/constants'
import { dashboardService } from '@/services/dashboard.service'
import AgencyProfileClient from '@/app/agencies/[id]/AgencyProfileClient'

export default function AgencyProfilePageClient() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuth()
  const [agencyId, setAgencyId] = useState<string | null>(null)
  const [agencyLoading, setAgencyLoading] = useState(true)

  useEffect(() => {
    if (isLoading) return

    if (!isAuthenticated || !user) {
      router.push(ROUTES.LOGIN)
      return
    }

    if (user.role !== USER_ROLES.AGENCY) {
      router.push(
        user.role === USER_ROLES.ADMIN
          ? ROUTES.DASHBOARD.ADMIN
          : user.role === USER_ROLES.TRAVELER
            ? ROUTES.DASHBOARD.TRAVELER
            : ROUTES.LOGIN
      )
      return
    }

    dashboardService
      .getAgencyDashboard()
      .then((dash) => {
        if (dash.agency?.id) setAgencyId(dash.agency.id)
      })
      .catch(() => setAgencyId(null))
      .finally(() => setAgencyLoading(false))
  }, [isAuthenticated, isLoading, user, router])

  if (isLoading || agencyLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !user || user.role !== USER_ROLES.AGENCY) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark p-6">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Access Denied</h1>
          <p className="text-slate-600 dark:text-slate-400">
            You don&apos;t have permission to view this page.
          </p>
        </div>
      </div>
    )
  }

  if (!agencyLoading && !agencyId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark p-6">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Profile not found</h1>
          <p className="text-slate-600 dark:text-slate-400">
            We couldn&apos;t locate an agency profile for your account yet.
          </p>
        </div>
      </div>
    )
  }

  if (!agencyId) return null

  return <AgencyProfileClient agencyId={agencyId} />
}

