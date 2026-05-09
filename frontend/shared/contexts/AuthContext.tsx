'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, UserRole } from '@/types/entities/user.entity'
import { USER_ROLES, ROUTES } from '@/config/constants'
import { setAuthCookies, clearAuthCookies } from '@/shared/utils/auth'
import type { Session } from '@supabase/supabase-js'
import { createBrowserSupabaseClient } from '@/shared/lib/supabase/client'
import { isSupabaseConfigured, SUPABASE_ENV_HINT } from '@/shared/lib/supabase/env'
import { fetchUserDTO, userDtoToEntity } from '@/shared/lib/supabase/profile'
import { authService } from '@/services/auth.service'

interface AuthContextType {
  user: User | null
  role: UserRole | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (user: User, token: string) => void
  logout: () => Promise<void>
  setUser: (user: User | null) => void
  hasRole: (role: UserRole) => boolean
  canAccess: (path: string) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const VALID_ROLES: UserRole[] = ['Admin', 'Agency', 'Traveler']

function isValidRole(role: unknown): role is UserRole {
  return typeof role === 'string' && VALID_ROLES.includes(role as UserRole)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      console.warn(`[REHNUM] Supabase env incomplete — not hydrating auth. ${SUPABASE_ENV_HINT}`)
      setIsLoading(false)
      return
    }

    const sb = createBrowserSupabaseClient()

    async function applySession(session: Session | null) {
      if (!session?.user) {
        setUserState(null)
        if (typeof window !== 'undefined') {
          localStorage.removeItem('user')
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
          clearAuthCookies()
        }
        return
      }

      try {
        const dto = await fetchUserDTO(session.user.id)
        if (!isValidRole(dto.role)) {
          console.error('Invalid user role detected:', dto.role)
          await sb.auth.signOut()
          setUserState(null)
          if (typeof window !== 'undefined') {
            localStorage.removeItem('user')
            localStorage.removeItem('accessToken')
            localStorage.removeItem('refreshToken')
            clearAuthCookies()
          }
          return
        }

        const appUser = userDtoToEntity(dto)
        setUserState(appUser)
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(appUser))
          localStorage.setItem('accessToken', session.access_token)
          if (session.refresh_token) {
            localStorage.setItem('refreshToken', session.refresh_token)
          }
          setAuthCookies(appUser, session.access_token)
        }
      } catch (e) {
        console.error('Auth hydration failed:', e)
        await sb.auth.signOut()
        setUserState(null)
        if (typeof window !== 'undefined') {
          localStorage.removeItem('user')
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
          clearAuthCookies()
        }
      }
    }

    let cancelled = false

    void (async () => {
      setIsLoading(true)
      const {
        data: { session },
      } = await sb.auth.getSession()
      if (cancelled) return
      await applySession(session)
      if (!cancelled) setIsLoading(false)
    })()

    const {
      data: { subscription },
    } = sb.auth.onAuthStateChange((_event, session) => {
      void (async () => {
        await applySession(session)
        setIsLoading(false)
      })()
    })

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [])

  const login = (userData: User, token: string) => {
    setUserState(userData)
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(userData))
      localStorage.setItem('accessToken', token)
      setAuthCookies(userData, token)
    }
  }

  const logout = async () => {
    try {
      await authService.logout()
    } catch (e) {
      console.error('Supabase signOut:', e)
    }
    setUserState(null)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user')
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
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
    if (!VALID_ROLES.includes(user.role)) return false
    return user.role === role
  }

  const canAccess = (path: string): boolean => {
    if (!user) return false

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

    if (path.startsWith(ROUTES.DASHBOARD.ADMIN)) {
      return user.role === USER_ROLES.ADMIN
    }

    if (path.startsWith(ROUTES.DASHBOARD.AGENCY)) {
      return user.role === USER_ROLES.AGENCY
    }

    if (path.startsWith(ROUTES.DASHBOARD.TRAVELER)) {
      return user.role === USER_ROLES.TRAVELER
    }

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
