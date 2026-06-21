export const APP_NAME = 'Tripster'
export const APP_TAGLINE = 'Travel Smarter'

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  ADMIN_LOGIN: '/admin/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  TRIPS: '/trips',
  AGENCIES: '/agencies',
  DASHBOARD: {
    TRAVELER: '/dashboard',
    AGENCY: '/dashboard',
    ADMIN: '/admin/dashboard',
  },
  ADMIN_USERS: '/admin/users',
  ADMIN_TRIPS: '/admin/trips',
} as const

export const USER_ROLES = {
  TRAVELER: 'Traveler',
  AGENCY: 'Agency',
  ADMIN: 'Admin',
} as const
