'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, UserRole } from '@/types/entities/user.entity'
import { USER_ROLES, ROUTES } from '@/config/constants'
import { setAuthCookies, clearAuthCookies } from '@/shared/utils/auth'

interface AuthContextType {
  user: User | null
  role: UserRole | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (user: User, token: string) => void
  logout: () => void
  setUser: (user: User | null) => void
  hasRole: (role: UserRole) => boolean
  canAccess: (path: string) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load user from localStorage on mount and sync cookies
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user')
      const token = localStorage.getItem('accessToken')
      
      if (storedUser && token) {
        try {
          const parsedUser = JSON.parse(storedUser)
          // Validate user role before setting
          const validRoles = ['Admin', 'Agency', 'Traveler']
          if (!parsedUser.role || !validRoles.includes(parsedUser.role)) {
            console.error('Invalid user role detected:', parsedUser.role)
            localStorage.removeItem('user')
            localStorage.removeItem('accessToken')
            clearAuthCookies()
            setIsLoading(false)
            return
          }
          setUserState(parsedUser)
          // Ensure cookies are in sync with localStorage
          setAuthCookies(parsedUser, token)
        } catch (error) {
          console.error('Error parsing user from localStorage:', error)
          localStorage.removeItem('user')
          localStorage.removeItem('accessToken')
          clearAuthCookies()
        }
      } else {
        // If no user in localStorage, clear cookies to prevent stale auth
        clearAuthCookies()
      }
      setIsLoading(false)
    }
  }, [])

  const login = (userData: User, token: string) => {
    setUserState(userData)
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(userData))
      localStorage.setItem('accessToken', token)
      // Always set cookies when logging in to keep them in sync
      setAuthCookies(userData, token)
    }
  }

  const logout = () => {
    setUserState(null)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user')
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      // Clear cookies using utility function
      clearAuthCookies()
      window.location.href = ROUTES.LOGIN
    }
  }

  const setUser = (userData: User | null) => {
    setUserState(userData)
    if (typeof window !== 'undefined') {
      if (userData) {
        localStorage.setItem('user', JSON.stringify(userData))
        const token = localStorage.getItem('accessToken')
        if (token) {
          // Sync cookies when user is updated
          setAuthCookies(userData, token)
        }
      } else {
        localStorage.removeItem('user')
        clearAuthCookies()
      }
    }
  }

  const hasRole = (role: UserRole): boolean => {
    if (!user) return false
    // Validate role matches expected values
    const validRoles: UserRole[] = ['Admin', 'Agency', 'Traveler']
    if (!validRoles.includes(user.role)) return false
    return user.role === role
  }

  const canAccess = (path: string): boolean => {
    if (!user) return false

    // Public routes that everyone can access
    const publicRoutes = [
      ROUTES.HOME,
      ROUTES.LOGIN,
      ROUTES.REGISTER,
      ROUTES.FORGOT_PASSWORD,
      ROUTES.TRIPS,
      ROUTES.AGENCIES,
    ]

    if (publicRoutes.some((route) => path.startsWith(route))) {
      return true
    }

    // Role-based route access
    if (path.startsWith(ROUTES.DASHBOARD.ADMIN)) {
      return user.role === USER_ROLES.ADMIN
    }

    if (path.startsWith(ROUTES.DASHBOARD.AGENCY)) {
      return user.role === USER_ROLES.AGENCY
    }

    if (path.startsWith(ROUTES.DASHBOARD.TRAVELER)) {
      return user.role === USER_ROLES.TRAVELER
    }

    // Default: allow access if authenticated
    return true
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        setUser,
        hasRole,
        canAccess,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
