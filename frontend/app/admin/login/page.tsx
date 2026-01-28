'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Logo } from '@/shared/components/layout/Logo'
import { Button } from '@/shared/components/ui/Button'
import { ThemeToggle } from '@/shared/components/ui/ThemeToggle'
import { useAuth } from '@/shared/contexts/AuthContext'
import { setAuthCookies, getDashboardRoute, getLoginRedirectRoute } from '@/shared/utils/auth'
import { ROUTES } from '@/config/constants'
import { findUserByCredentials, toUser } from '@/data/dummyUsers'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const { login, isAuthenticated } = useAuth()
  const router = useRouter()

  // Redirect if already authenticated as admin
  // Allow other roles to access this page (they can log out and log in as admin)
  useEffect(() => {
    if (isAuthenticated) {
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser)
          // Only redirect if already logged in as Admin
          // Other roles can stay on this page to log in as admin
          if (user.role === 'Admin') {
            router.push(ROUTES.DASHBOARD.ADMIN)
          }
          // Don't redirect other roles - let them access the admin login page
        } catch {
          // If parsing fails, allow them to stay on the page
        }
      }
    }
  }, [isAuthenticated, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // Find admin user in dummy users database
      const dummyUser = findUserByCredentials(email, password, 'Admin')

      if (!dummyUser) {
        setError('Invalid admin credentials. Please check your email and password.')
        setIsLoading(false)
        return
      }

      // Convert to User (remove password)
      const user = toUser(dummyUser)

      // Generate token (in production, this would come from API)
      const token = `admin-token-${user.id}-${Date.now()}`

      // Set auth cookies for middleware
      setAuthCookies(user, token)

      // Login via context
      login(user, token)

      // Redirect to admin dashboard
      router.push(ROUTES.DASHBOARD.ADMIN)
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.')
      setIsLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen flex flex-col w-full overflow-x-hidden bg-slate-50 dark:bg-background-dark">
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
      <div className="flex-1 relative -mt-12 z-30 bg-white dark:bg-card-dark rounded-t-[32px] md:rounded-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.06)] px-6 pt-8 pb-8 md:pt-12 md:pb-12 flex flex-col items-center w-full max-w-lg mx-auto md:max-w-2xl">
        <div className="w-12 h-1.5 bg-slate-200 dark:bg-white/10 rounded-full mb-6 opacity-60"></div>
        <div className="flex items-center gap-2 mb-2">
          <span className="material-symbols-outlined text-primary text-2xl">admin_panel_settings</span>
          <h1 className="text-slate-900 dark:text-white tracking-tight text-3xl font-bold leading-tight text-center font-display">
            Admin Access
          </h1>
        </div>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 text-center leading-relaxed">
          Enter your admin credentials to access the management panel.
        </p>

        <form className="w-full flex flex-col gap-5" onSubmit={handleSubmit}>
          <label className="flex flex-col w-full group">
            <span className="text-slate-700 dark:text-slate-300 text-xs font-bold uppercase tracking-wider mb-2 ml-1">
              Email Address
            </span>
            <div className="relative">
              <input
                className="form-input flex w-full rounded-2xl text-slate-900 dark:text-white border border-slate-200 dark:border-white/20 bg-white dark:bg-white/5 focus:border-primary focus:ring-4 focus:ring-primary/10 h-14 px-4 pl-12 text-base placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all duration-200"
                placeholder="admin@tripster.com"
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
            <div className="relative flex w-full items-stretch rounded-2xl">
              <input
                className="form-input flex w-full rounded-2xl text-slate-900 dark:text-white border border-slate-200 dark:border-white/20 bg-white dark:bg-white/5 focus:border-primary focus:ring-4 focus:ring-primary/10 h-14 px-4 pl-12 text-base placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all duration-200 z-0"
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
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="mt-4 w-full h-14 bg-primary hover:bg-blue-600 active:scale-[0.98] text-white text-lg font-bold rounded-2xl shadow-glow transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Logging in...' : 'Access Admin Panel'}
          </Button>
        </form>

        <div className="mt-8 mb-4 text-center">
          <p className="text-slate-500 text-sm font-medium">
            Regular user?{' '}
            <Link href="/login" className="text-primary font-bold hover:underline ml-1">
              Go to User Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
