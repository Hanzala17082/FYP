import { User } from '@/types/entities/user.entity'
import { ROUTES } from '@/config/constants'

export function setAuthCookies(user: User, token: string) {
  if (typeof document !== 'undefined') {
    // Set cookie for middleware (expires in 7 days)
    const expires = new Date()
    expires.setTime(expires.getTime() + 7 * 24 * 60 * 60 * 1000)
    document.cookie = `accessToken=${token}; expires=${expires.toUTCString()}; path=/`
    document.cookie = `userRole=${user.role}; expires=${expires.toUTCString()}; path=/`
  }
}

export function clearAuthCookies() {
  if (typeof document !== 'undefined') {
    document.cookie = 'accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    document.cookie = 'userRole=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
  }
}

export function getDashboardRoute(role: string): string {
  switch (role) {
    case 'Admin':
      return ROUTES.DASHBOARD.ADMIN
    case 'Agency':
      return ROUTES.DASHBOARD.AGENCY
    case 'Traveler':
      return ROUTES.DASHBOARD.TRAVELER
    default:
      return ROUTES.LOGIN
  }
}

/**
 * Get the initial redirect route after login
 * Redirect users to their dashboard
 */
export function getLoginRedirectRoute(role: string): string {
  switch (role) {
    case 'Traveler':
      return ROUTES.DASHBOARD.TRAVELER
    case 'Admin':
      return ROUTES.DASHBOARD.ADMIN
    case 'Agency':
      return ROUTES.DASHBOARD.AGENCY
    default:
      return ROUTES.LOGIN
  }
}
