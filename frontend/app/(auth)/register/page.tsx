'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Logo } from '@/shared/components/layout/Logo'
import { Button } from '@/shared/components/ui/Button'
import { ThemeToggle } from '@/shared/components/ui/ThemeToggle'
import { authService } from '@/services/auth.service'
import { getErrorMessage } from '@/shared/utils/error-message'
import { formatCnicInput, cnicValidationMessage } from '@/shared/utils/cnic'
import { CityAutocomplete } from '@/shared/components/ui/CityAutocomplete'
import { useAuth } from '@/shared/contexts/AuthContext'
import { setAuthCookies, getLoginRedirectRoute } from '@/shared/utils/auth'
import { User } from '@/types/entities/user.entity'

export default function RegisterPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [role, setRole] = useState<'Traveler' | 'Agency'>('Traveler')
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    city: '',
    cnic: '',
    password: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    if (!formData.city.trim()) {
      setError('Please select a city from the suggestions list.')
      setIsLoading(false)
      return
    }

    if (role === 'Traveler') {
      const cnicError = cnicValidationMessage(formData.cnic)
      if (cnicError) {
        setError(cnicError)
        setIsLoading(false)
        return
      }
    }

    try {
      const res = await authService.register({
        fullName: formData.fullName,
        email: formData.email,
        city: formData.city,
        cnic: formData.cnic,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        role,
      })
      const payload = res.data
      if (!payload?.accessToken || !payload?.user) {
        setError('Registration succeeded but invalid response.')
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
        localStorage.setItem('accessToken', payload.accessToken)
        localStorage.setItem('refreshToken', payload.refreshToken ?? '')
      }
      setAuthCookies(user, payload.accessToken)
      login(user, payload.accessToken)
      router.push(getLoginRedirectRoute(user.role))
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Registration failed.'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen flex flex-col w-full overflow-x-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-white antialiased selection:bg-primary/30">
      {/* Background */}
      <div className="fixed inset-0 w-full h-full z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-transparent dark:to-background-dark z-10"></div>
        <div
          className="w-full h-full bg-center bg-no-repeat bg-cover"
          style={{
            backgroundImage:
              'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDh0bSL1iVgeARM6qePfOIh0hNQRBjVRhIPpevXbbzfQkiYtHKFnvj4bqYBhCjqC4YPjQF1OOQLd8Zwgp8S0Ml7e9L2livihz4sljgWGac1i7jUwyDxgzQtoupGgBeXaKpIE6qdEwCLnknvm5q9z-LKbKbi54elDt61QZPnA8FNgwDJKmcYrvJRmd0xBbkklBXRu5K1r0C08fk3Om9Mwe6bzDmz46BTInucSc-JeS1I6h4iFiSYKfizSZvRKw9w-8T9L09x0zAVC5o")',
          }}
        ></div>
      </div>

      {/* Content */}
      <div className="relative z-20 flex flex-col min-h-screen">
        <div className="w-full p-6 flex justify-between items-start">
          <Logo variant="light" />
          <ThemeToggle />
        </div>

        <div className="flex-1 bg-white dark:glass-container border-t border-slate-200 dark:border-white/10 shadow-2xl px-6 pt-8 pb-12 md:pt-12 md:pb-12 flex flex-col items-center w-full max-w-lg md:max-w-2xl mx-auto">
          <div className="w-12 h-1.5 bg-slate-200 dark:bg-white/10 rounded-none mb-6"></div>
          <h1 className="text-slate-900 dark:text-white tracking-tight text-[28px] font-bold leading-tight text-center mb-2">
            Create Account
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 text-center">
            Sign up as a traveler to discover and book trips.
          </p>

          {/* Role Selector */}
          <div className="w-full mb-6">
            <div className="flex h-12 w-full items-center justify-center rounded-none bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-1">
              <label className="flex cursor-pointer h-full flex-1 items-center justify-center overflow-hidden rounded-none px-2 has-[:checked]:bg-white dark:has-[:checked]:bg-white/10 has-[:checked]:text-primary transition-all duration-200 text-slate-500 dark:text-slate-400 text-sm font-semibold leading-normal group">
                <span className="truncate">Traveler</span>
                <input
                  checked={role === 'Traveler'}
                  onChange={() => setRole('Traveler')}
                  className="invisible w-0"
                  name="role_selector"
                  type="radio"
                  value="Traveler"
                />
              </label>
              <label className="flex cursor-pointer h-full flex-1 items-center justify-center overflow-hidden rounded-none px-2 has-[:checked]:bg-white dark:has-[:checked]:bg-white/10 has-[:checked]:text-primary transition-all duration-200 text-slate-500 dark:text-slate-400 text-sm font-semibold leading-normal group">
                <span className="truncate">Agency</span>
                <input
                  checked={role === 'Agency'}
                  onChange={() => setRole('Agency')}
                  className="invisible w-0"
                  name="role_selector"
                  type="radio"
                  value="Agency"
                />
              </label>
            </div>
          </div>

          <form className="w-full flex flex-col gap-4" onSubmit={handleSubmit}>
            <label className="flex flex-col w-full">
              <span className="text-slate-700 dark:text-white text-xs font-medium leading-normal pb-1.5 ml-1 uppercase tracking-wider opacity-70">
                Full Name
              </span>
              <div className="relative">
                <input
                  className="form-input flex w-full rounded-none text-slate-900 dark:text-white border border-slate-200 dark:border-white/20 bg-white dark:bg-white/5 focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4 text-base placeholder:text-slate-400 dark:placeholder:text-white/20 transition-colors"
                  placeholder="e.g. John Doe"
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                />
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/30">
                  person
                </span>
              </div>
            </label>

            <label className="flex flex-col w-full">
              <span className="text-slate-700 dark:text-white text-xs font-medium leading-normal pb-1.5 ml-1 uppercase tracking-wider opacity-70">
                Email Address
              </span>
              <div className="relative">
                <input
                  className="form-input flex w-full rounded-none text-slate-900 dark:text-white border border-slate-200 dark:border-white/20 bg-white dark:bg-white/5 focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4 text-base placeholder:text-slate-400 dark:placeholder:text-white/20 transition-colors"
                  placeholder="name@example.com"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/30">
                  mail
                </span>
              </div>
            </label>

            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <label className="flex flex-col w-full">
                <span className="text-slate-700 dark:text-white text-xs font-medium leading-normal pb-1.5 ml-1 uppercase tracking-wider opacity-70">
                  City
                </span>
                <CityAutocomplete
                  value={formData.city}
                  onChange={(city) => setFormData({ ...formData, city })}
                  placeholder="Search your city"
                  required
                  inputClassName="form-input flex w-full rounded-none text-slate-900 dark:text-white border border-slate-200 dark:border-white/20 bg-white dark:bg-white/5 focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4 pr-11 text-base placeholder:text-slate-400 dark:placeholder:text-white/20 transition-colors"
                />
              </label>

              {role === 'Traveler' && (
              <label className="flex flex-col w-full">
                <span className="text-slate-700 dark:text-white text-xs font-medium leading-normal pb-1.5 ml-1 uppercase tracking-wider opacity-70">
                  CNIC
                </span>
                <div className="relative">
                  <input
                    className="form-input flex w-full rounded-none text-slate-900 dark:text-white border border-slate-200 dark:border-white/20 bg-white dark:bg-white/5 focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4 text-base placeholder:text-slate-400 dark:placeholder:text-white/20 transition-colors"
                    placeholder="xxxxx-xxxxxxx-x"
                    type="text"
                    inputMode="numeric"
                    maxLength={15}
                    value={formData.cnic}
                    onChange={(e) =>
                      setFormData({ ...formData, cnic: formatCnicInput(e.target.value) })
                    }
                    required
                  />
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/30">
                    badge
                  </span>
                </div>
              </label>
              )}
            </div>

            <label className="flex flex-col w-full">
              <span className="text-slate-700 dark:text-white text-xs font-medium leading-normal pb-1.5 ml-1 uppercase tracking-wider opacity-70">
                Password
              </span>
              <div className="relative flex w-full items-stretch">
                <input
                  className="form-input flex w-full rounded-none border border-r-0 border-slate-200 dark:border-white/20 bg-white dark:bg-white/5 focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/20 text-base"
                  placeholder="Create a password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
                <div
                  className="flex items-center justify-center px-4 border border-l-0 border-slate-200 dark:border-white/20 bg-white dark:bg-white/5 rounded-none cursor-pointer hover:bg-slate-50 dark:hover:bg-white/10 transition-colors text-slate-400 dark:text-white/30"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </div>
              </div>
            </label>

            <label className="flex flex-col w-full">
              <span className="text-slate-700 dark:text-white text-xs font-medium leading-normal pb-1.5 ml-1 uppercase tracking-wider opacity-70">
                Confirm Password
              </span>
              <div className="relative flex w-full items-stretch">
                <input
                  className="form-input flex w-full rounded-none border border-r-0 border-slate-200 dark:border-white/20 bg-white dark:bg-white/5 focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/20 text-base"
                  placeholder="Confirm password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                />
                <div
                  className="flex items-center justify-center px-4 border border-l-0 border-slate-200 dark:border-white/20 bg-white dark:bg-white/5 rounded-none cursor-pointer hover:bg-slate-50 dark:hover:bg-white/10 transition-colors text-slate-400 dark:text-white/30"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showConfirmPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </div>
              </div>
            </label>

            {error && (
              <div className="w-full p-3 rounded-none bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}
            <Button
              type="submit"
              disabled={isLoading}
              className="mt-4 w-full h-12 bg-primary hover:bg-blue-600 active:bg-blue-700 text-white font-bold rounded-none shadow-lg shadow-blue-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-8 mb-4 text-center">
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Already have an account?{' '}
              <Link href="/login" className="text-primary font-bold hover:underline ml-1">
                Log In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
