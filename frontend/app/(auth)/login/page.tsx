'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Logo } from '@/shared/components/layout/Logo'
import { Button } from '@/shared/components/ui/Button'
import { ThemeToggle } from '@/shared/components/ui/ThemeToggle'
import { useAuth } from '@/shared/contexts/AuthContext'
import { setAuthCookies, getLoginRedirectRoute } from '@/shared/utils/auth'
import { ROUTES } from '@/config/constants'
import { findUserByCredentials, toUser } from '@/data/dummyUsers'

export default function LoginPage() {
  const [role, setRole] = useState<'Traveler' | 'Agency'>('Traveler')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const { login, isAuthenticated } = useAuth()
  const router = useRouter()

      // Redirect if already authenticated
  useEffect(() => {
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
      // Find user in dummy users database
      const dummyUser = findUserByCredentials(email, password, role)

      if (!dummyUser) {
        setError('Invalid email or password. Please check your credentials.')
        setIsLoading(false)
        return
      }

      // Convert to User (remove password)
      const user = toUser(dummyUser)

      // Generate token (in production, this would come from API)
      const token = `token-${user.id}-${Date.now()}`

      // Set auth cookies for middleware
      setAuthCookies(user, token)

      // Login via context
      login(user, token)

      // Redirect based on role (Travelers go to trips, others to dashboard)
      router.push(getLoginRedirectRoute(user.role))
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.')
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
        <h1 className="text-slate-900 dark:text-white tracking-tight text-3xl font-bold leading-tight text-center mb-2 font-display">
          Welcome Back
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 text-center leading-relaxed">
          Please enter your details to sign in.
        </p>

        {/* Role Selector */}
        <div className="w-full mb-8">
          <div className="flex h-14 w-full items-center justify-center rounded-2xl bg-slate-100/80 dark:bg-white/5 p-1.5 border border-slate-100 dark:border-white/10">
            <label className="flex cursor-pointer h-full flex-1 items-center justify-center overflow-hidden rounded-xl px-2 has-[:checked]:bg-white dark:has-[:checked]:bg-white/10 has-[:checked]:shadow-sm has-[:checked]:text-primary transition-all duration-200 text-slate-500 dark:text-slate-400 text-sm font-semibold leading-normal group relative">
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
            <label className="flex cursor-pointer h-full flex-1 items-center justify-center overflow-hidden rounded-xl px-2 has-[:checked]:bg-white dark:has-[:checked]:bg-white/10 has-[:checked]:shadow-sm has-[:checked]:text-primary transition-all duration-200 text-slate-500 dark:text-slate-400 text-sm font-semibold leading-normal group relative">
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
                className="form-input flex w-full rounded-2xl text-slate-900 dark:text-white border border-slate-200 dark:border-white/20 bg-white dark:bg-white/5 focus:border-primary focus:ring-4 focus:ring-primary/10 h-14 px-4 pl-12 text-base placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all duration-200"
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
            {isLoading ? 'Logging in...' : 'Log In'}
          </Button>
        </form>

        <div className="relative w-full my-8 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200 dark:border-white/10"></div>
          </div>
          <span className="relative bg-white dark:bg-card-dark px-3 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            Or continue with
          </span>
        </div>

        <div className="flex gap-4 w-full">
          <button className="flex-1 h-14 flex items-center justify-center gap-2 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 hover:border-slate-300 dark:hover:border-white/20 transition-all text-slate-700 dark:text-white font-semibold text-sm shadow-sm active:scale-[0.98]">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M23.7663 12.2764C23.7663 11.4607 23.6999 10.6406 23.5588 9.83807H12.2402V14.4591H18.722C18.4528 15.9494 17.5887 17.2678 16.3233 18.1056V21.1039H20.1903C22.4611 19.0139 23.7663 15.9274 23.7663 12.2764Z"
                fill="#4285F4"
              ></path>
              <path
                d="M12.2401 24.0008C15.4765 24.0008 18.2059 22.9382 20.1945 21.1039L16.3275 18.1055C15.2517 18.8375 13.8627 19.252 12.2445 19.252C9.11391 19.252 6.45949 17.1399 5.50708 14.3003H1.5166V17.3912C3.55374 21.4434 7.70293 24.0008 12.2401 24.0008Z"
                fill="#34A853"
              ></path>
              <path
                d="M5.50277 14.3003C4.99952 12.8099 4.99952 11.1961 5.50277 9.70575V6.61481H1.51674C-0.185512 10.0056 -0.185512 14.0004 1.51674 17.3912L5.50277 14.3003Z"
                fill="#FBBC05"
              ></path>
              <path
                d="M12.2401 4.74966C13.9509 4.7232 15.6044 5.36697 16.8434 6.54867L20.2695 3.12262C18.1001 1.0855 15.2208 -0.0344664 12.2401 0.000808666C7.70293 0.000808666 3.55374 2.55822 1.5166 6.61481L5.50264 9.70575C6.45064 6.86173 9.10947 4.74966 12.2401 4.74966Z"
                fill="#EA4335"
              ></path>
            </svg>
            Google
          </button>
          <button className="flex-1 h-14 flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all text-slate-700 font-semibold text-sm shadow-sm active:scale-[0.98]">
            <svg
              className="w-5 h-5 text-slate-900"
              fill="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-.68-.32-1.39-.32-2.08 0-1.03.48-2.1.55-3.07-.4-4.15-4.08-3.5-11.2 1.48-11.45 1.25-.06 2.14.65 2.82.63.78-.02 2.14-0.89 3.6-0.65 1.53.25 2.68 1.01 3.42 2.12-2.95 1.83-2.45 6.09.52 7.37-.66 1.34-1.54 2.66-2.61 3.73v.25ZM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.17 2.37-1.92 4.22-3.74 4.25Z"></path>
            </svg>
            Apple
          </button>
        </div>

        <div className="mt-8 mb-4 text-center">
          <p className="text-slate-500 text-sm font-medium">
            Don't have an account?{' '}
            <Link href="/register" className="text-primary font-bold hover:underline ml-1">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
