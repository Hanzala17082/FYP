'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Logo } from '@/shared/components/layout/Logo'
import { Button } from '@/shared/components/ui/Button'
import { ThemeToggle } from '@/shared/components/ui/ThemeToggle'
import { useAuth } from '@/shared/contexts/AuthContext'
import { setAuthCookies, getLoginRedirectRoute } from '@/shared/utils/auth'
import { ROUTES } from '@/config/constants'
import { authService } from '@/services/auth.service'
import { User } from '@/types/entities/user.entity'
import { getErrorMessage } from '@/shared/utils/error-message'

export default function LoginClient() {
  const searchParams = useSearchParams()
  const [role, setRole] = useState<'Traveler' | 'Agency'>('Traveler')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const { login, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const callbackError = searchParams.get('error')
    if (callbackError === 'auth_callback_failed') {
      router.replace('/forgot-password?error=link_expired')
      return
    }

    if (typeof window === 'undefined') return
    const hash = window.location.hash.replace(/^#/, '')
    if (!hash) return

    const params = new URLSearchParams(hash)
    if (params.get('error_code') === 'otp_expired' || params.get('error') === 'access_denied') {
      router.replace('/forgot-password?error=link_expired')
    }
  }, [searchParams, router])

      // Redirect if already authenticated (skip when Supabase sent a recovery error in the hash)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace(/^#/, '')
      if (hash) {
        const params = new URLSearchParams(hash)
        if (params.get('error_code') === 'otp_expired' || params.get('error') === 'access_denied') {
          return
        }
      }
    }
    if (isAuthenticated) {
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser)
          router.push(getLoginRedirectRoute(user.role))
        } catch {
          router.push(ROUTES.HOME)
        }
      }
    }
  }, [isAuthenticated, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const res = await authService.login({ email, password, role })
      const payload = res.data
      if (!payload?.accessToken || !payload?.user) {
        setError('Invalid response from server.')
        setIsLoading(false)
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
      router.push(getLoginRedirectRoute(user.role))
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Invalid email or password. Please check your credentials.'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen flex flex-col w-full overflow-x-hidden bg-background-light dark:bg-background-dark">
      {/* Background Image */}
      <div className="relative h-[42vh] w-full shrink-0">
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-transparent z-10"></div>
        <div
          className="w-full h-full bg-center bg-no-repeat bg-cover"
          style={{
            backgroundImage:
              'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDh0bSL1iVgeARM6qePfOIh0hNQRBjVRhIPpevXbbzfQkiYtHKFnvj4bqYBhCjqC4YPjQF1OOQLd8Zwgp8S0Ml7e9L2livihz4sljgWGac1i7jUwyDxgzQtoupGgBeXaKpIE6qdEwCLnknvm5q9z-LKbKbi54elDt61QZPnA8FNgwDJKmcYrvJRmd0xBbkklBXRu5K1r0C08fk3Om9Mwe6bzDmz46BTInucSc-JeS1I6h4iFiSYKfizSZvRKw9w-8T9L09x0zAVC5o")',
          }}
        ></div>
        <div className="absolute top-0 left-0 w-full p-6 pt-12 z-20 flex justify-between items-center">
          <Logo variant="light" showTagline={true} />
          <ThemeToggle />
        </div>
      </div>

      {/* Form Container */}
      <div className="flex-1 relative -mt-12 z-30 bg-white dark:bg-card-dark shadow-[0_-10px_40px_rgba(0,0,0,0.06)] px-6 pt-8 pb-8 md:pt-12 md:pb-12 flex flex-col items-center w-full max-w-lg mx-auto md:max-w-2xl">
        <div className="w-12 h-1.5 bg-slate-200 dark:bg-white/10 rounded-none mb-6 opacity-60"></div>
        <h1 className="text-slate-900 dark:text-white tracking-tight text-3xl font-bold leading-tight text-center mb-2 font-display">
          Welcome Back
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 text-center leading-relaxed">
          Please enter your details to sign in.
        </p>

        {/* Role Selector */}
        <div className="w-full mb-8">
          <div className="flex h-14 w-full items-center justify-center rounded-none bg-slate-100/80 dark:bg-white/5 p-1.5 border border-slate-100 dark:border-white/10">
            <label className="flex cursor-pointer h-full flex-1 items-center justify-center overflow-hidden rounded-none px-2 has-[:checked]:bg-white dark:has-[:checked]:bg-white/10 has-[:checked]:shadow-sm has-[:checked]:text-primary transition-all duration-200 text-slate-500 dark:text-slate-400 text-sm font-semibold leading-normal group relative">
              <span className="z-10 relative">Traveler</span>
              <input
                checked={role === 'Traveler'}
                onChange={() => setRole('Traveler')}
                className="invisible w-0 absolute"
                name="role_selector"
                type="radio"
                value="Traveler"
              />
            </label>
            <label className="flex cursor-pointer h-full flex-1 items-center justify-center overflow-hidden rounded-none px-2 has-[:checked]:bg-white dark:has-[:checked]:bg-white/10 has-[:checked]:shadow-sm has-[:checked]:text-primary transition-all duration-200 text-slate-500 dark:text-slate-400 text-sm font-semibold leading-normal group relative">
              <span className="z-10 relative">Agency</span>
              <input
                checked={role === 'Agency'}
                onChange={() => setRole('Agency')}
                className="invisible w-0 absolute"
                name="role_selector"
                type="radio"
                value="Agency"
              />
            </label>
          </div>
        </div>

        <form className="w-full flex flex-col gap-5" onSubmit={handleSubmit}>
          <label className="flex flex-col w-full group">
            <span className="text-slate-700 dark:text-slate-300 text-xs font-bold uppercase tracking-wider mb-2 ml-1">
              Email Address
            </span>
            <div className="relative">
              <input
                className="form-input flex w-full rounded-none text-slate-900 dark:text-white border border-slate-200 dark:border-white/20 bg-white dark:bg-white/5 focus:border-primary focus:ring-4 focus:ring-primary/10 h-14 px-4 pl-12 text-base placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all duration-200"
                placeholder="name@company.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-400 group-focus-within:text-primary transition-colors text-[22px]">
                mail
              </span>
            </div>
          </label>

          <label className="flex flex-col w-full group">
            <div className="flex justify-between items-center mb-2 ml-1">
              <span className="text-slate-700 dark:text-slate-300 text-xs font-bold uppercase tracking-wider">
                Password
              </span>
              <Link
                href="/forgot-password"
                className="text-primary text-xs font-bold hover:text-blue-600 hover:underline transition-colors"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative flex w-full items-stretch rounded-none">
              <input
                className="form-input flex w-full rounded-none text-slate-900 dark:text-white border border-slate-200 dark:border-white/20 bg-white dark:bg-white/5 focus:border-primary focus:ring-4 focus:ring-primary/10 h-14 px-4 pl-12 text-base placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all duration-200 z-0"
                placeholder="Enter your password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-400 group-focus-within:text-primary transition-colors text-[22px] z-10">
                lock
              </span>
              <button
                type="button"
                className="absolute right-0 top-0 h-full px-4 flex items-center justify-center text-slate-400 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer z-20 focus:outline-none transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </label>

          {error && (
            <div className="w-full p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              {error.includes('reset link') && (
                <Link href="/forgot-password" className="inline-block mt-2 text-sm font-semibold text-primary hover:underline">
                  Request a new reset link
                </Link>
              )}
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="mt-4 w-full h-14 bg-primary hover:bg-blue-600 active:scale-[0.98] text-white text-lg font-bold rounded-none shadow-glow transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Logging in...' : 'Log In'}
          </Button>
        </form>

        <div className="mt-8 mb-4 text-center">
          <p className="text-slate-500 text-sm font-medium">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-primary font-bold hover:underline ml-1">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
