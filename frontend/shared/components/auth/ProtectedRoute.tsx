'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/shared/contexts/AuthContext'
import { USER_ROLES, ROUTES } from '@/config/constants'
import { UserRole } from '@/types/entities/user.entity'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: UserRole[]
  redirectTo?: string
}

export function ProtectedRoute({
  children,
  allowedRoles,
  redirectTo,
}: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading, canAccess } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  // Helper function to get redirect URL based on user role
  const getRedirectUrl = (userRole: string): string => {
    if (redirectTo) return redirectTo
    
    switch (userRole) {
      case USER_ROLES.ADMIN:
        return ROUTES.DASHBOARD.ADMIN
      case USER_ROLES.AGENCY:
        return ROUTES.DASHBOARD.AGENCY
      case USER_ROLES.TRAVELER:
        return ROUTES.DASHBOARD.TRAVELER
      default:
        return ROUTES.LOGIN
    }
  }

  useEffect(() => {
    if (isLoading) return

    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      router.push(ROUTES.LOGIN)
      return
    }

    if (!user) return

    // If user exists but can't access this route
    if (!canAccess(pathname)) {
      router.push(getRedirectUrl(user.role))
      return
    }

    // If specific roles are required, check them
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      router.push(getRedirectUrl(user.role))
      return
    }
  }, [isAuthenticated, isLoading, user, pathname, canAccess, allowedRoles, redirectTo, router])

  // Show loading state
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

  // If not authenticated or doesn't have access, don't render children
  if (!isAuthenticated || (user && !canAccess(pathname))) {
    return null
  }

  // If specific roles required, check them
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return null
  }

  return <>{children}</>
}
