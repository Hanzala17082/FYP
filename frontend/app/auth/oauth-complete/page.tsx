'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { authService } from '@/services/auth.service'
import { useAuth } from '@/shared/contexts/AuthContext'
import { setAuthCookies, getLoginRedirectRoute } from '@/shared/utils/auth'
import { getErrorMessage } from '@/shared/utils/error-message'
import { User } from '@/types/entities/user.entity'
import type { AppUserRole } from '@/shared/lib/supabase/user-provision'

const OAUTH_ROLE_KEY = 'oauth_role'

export default function OAuthCompletePage() {
  const router = useRouter()
  const { login } = useAuth()
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function complete() {
      const storedRole = sessionStorage.getItem(OAUTH_ROLE_KEY) as AppUserRole | null
      sessionStorage.removeItem(OAUTH_ROLE_KEY)
      const role: AppUserRole = storedRole === 'Agency' ? 'Agency' : 'Traveler'

      try {
        const res = await authService.completeOAuthSession(role)
        const payload = res.data
        if (!payload?.accessToken || !payload?.user) {
          if (!cancelled) setError('Google sign-in succeeded but profile setup failed.')
          return
        }

        const user: User = {
          id: payload.user.id,
          email: payload.user.email,
          fullName: payload.user.fullName,
          role: payload.user.role,
          city: payload.user.city,
          avatar: payload.user.avatar,
          createdAt: payload.user.createdAt ?? '',
          updatedAt: payload.user.createdAt ?? '',
        }

        if (typeof window !== 'undefined') {
          localStorage.setItem('refreshToken', payload.refreshToken ?? '')
        }
        setAuthCookies(user, payload.accessToken)
        login(user, payload.accessToken)
        router.replace(getLoginRedirectRoute(user.role))
      } catch (err: unknown) {
        if (!cancelled) {
          setError(getErrorMessage(err, 'Google sign-in failed. Please try again.'))
        }
      }
    }

    void complete()
    return () => {
      cancelled = true
    }
  }, [login, router])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background-light dark:bg-background-dark px-6">
      {error ? (
        <div className="max-w-md w-full text-center space-y-4">
          <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          <button
            type="button"
            onClick={() => router.push('/login')}
            className="text-primary font-semibold hover:underline"
          >
            Back to Login
          </button>
        </div>
      ) : (
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-600 dark:text-slate-400 text-sm">Completing Google sign-in…</p>
        </div>
      )}
    </div>
  )
}
