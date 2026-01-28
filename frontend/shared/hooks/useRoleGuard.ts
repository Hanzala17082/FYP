'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/shared/contexts/AuthContext'
import { getDashboardRoute } from '@/shared/utils/auth'
import { UserRole } from '@/types/entities/user.entity'

/**
 * Hook to guard routes based on user role
 * Redirects to appropriate dashboard if user doesn't have required role
 */
export function useRoleGuard(allowedRoles: UserRole[]) {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (isLoading) return

    if (!isAuthenticated || !user) {
      router.push('/login')
      return
    }

    if (!allowedRoles.includes(user.role)) {
      router.push(getDashboardRoute(user.role))
    }
  }, [user, isAuthenticated, isLoading, allowedRoles, router, pathname])

  return {
    hasAccess: user ? allowedRoles.includes(user.role) : false,
    isLoading,
    user,
  }
}
