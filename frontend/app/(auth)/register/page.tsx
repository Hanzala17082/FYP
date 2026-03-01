'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Logo } from '@/shared/components/layout/Logo'
import { Button } from '@/shared/components/ui/Button'
import { ThemeToggle } from '@/shared/components/ui/ThemeToggle'
import { authService } from '@/services/auth.service'
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
    agreeToTerms: false,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    try {
      const res = await authService.register({
        fullName: formData.fullName,
        email: formData.email,
        city: formData.city,
        cnic: formData.cnic,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        role,
        agreeToTerms: formData.agreeToTerms,
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
    } catch (err: any) {
      const msg = err.response?.data?.message ?? err.response?.data?.errors ? Object.values(err.response.data.errors).flat().join(' ') : err.message ?? 'Registration failed.'
      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen flex flex-col w-full overflow-x-hidden bg-slate-50 dark:bg-background-dark text-slate-900 dark:text-white antialiased selection:bg-primary/30">
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

        <div className="flex-1 bg-white dark:glass-container border-t border-slate-200 dark:border-white/10 rounded-t-3xl md:rounded-3xl shadow-2xl px-6 pt-8 pb-12 md:pt-12 md:pb-12 flex flex-col items-center w-full max-w-lg md:max-w-2xl mx-auto">
          <div className="w-12 h-1.5 bg-slate-200 dark:bg-white/10 rounded-full mb-6"></div>
          <h1 className="text-slate-900 dark:text-white tracking-tight text-[28px] font-bold leading-tight text-center mb-2">
            Create Account
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 text-center">
            Sign up as a traveler to discover and book trips.
          </p>

          {/* Role Selector */}
          <div className="w-full mb-6">
            <div className="flex h-12 w-full items-center justify-center rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-1">
              <label className="flex cursor-pointer h-full flex-1 items-center justify-center overflow-hidden rounded-lg px-2 has-[:checked]:bg-white dark:has-[:checked]:bg-white/10 has-[:checked]:text-primary transition-all duration-200 text-slate-500 dark:text-slate-400 text-sm font-semibold leading-normal group">
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
              <label className="flex cursor-pointer h-full flex-1 items-center justify-center overflow-hidden rounded-lg px-2 has-[:checked]:bg-white dark:has-[:checked]:bg-white/10 has-[:checked]:text-primary transition-all duration-200 text-slate-500 dark:text-slate-400 text-sm font-semibold leading-normal group">
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
                  className="form-input flex w-full rounded-xl text-slate-900 dark:text-white border border-slate-200 dark:border-white/20 bg-white dark:bg-white/5 focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4 text-base placeholder:text-slate-400 dark:placeholder:text-white/20 transition-colors"
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
                  className="form-input flex w-full rounded-xl text-slate-900 dark:text-white border border-slate-200 dark:border-white/20 bg-white dark:bg-white/5 focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4 text-base placeholder:text-slate-400 dark:placeholder:text-white/20 transition-colors"
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
                <div className="relative">
                  <input
                    className="form-input flex w-full rounded-xl text-slate-900 dark:text-white border border-slate-200 dark:border-white/20 bg-white dark:bg-white/5 focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4 text-base placeholder:text-slate-400 dark:placeholder:text-white/20 transition-colors"
                    placeholder="Your City"
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    required
                  />
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/30">
                    location_on
                  </span>
                </div>
              </label>

              <label className="flex flex-col w-full">
                <span className="text-slate-700 dark:text-white text-xs font-medium leading-normal pb-1.5 ml-1 uppercase tracking-wider opacity-70">
                  CNIC
                </span>
                <div className="relative">
                  <input
                    className="form-input flex w-full rounded-xl text-slate-900 dark:text-white border border-slate-200 dark:border-white/20 bg-white dark:bg-white/5 focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4 text-base placeholder:text-slate-400 dark:placeholder:text-white/20 transition-colors"
                    placeholder="xxxxx-xxxxxxx-x"
                    type="text"
                    value={formData.cnic}
                    onChange={(e) => setFormData({ ...formData, cnic: e.target.value })}
                    required
                  />
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/30">
                    badge
                  </span>
                </div>
              </label>
            </div>

            <label className="flex flex-col w-full">
              <span className="text-slate-700 dark:text-white text-xs font-medium leading-normal pb-1.5 ml-1 uppercase tracking-wider opacity-70">
                Password
              </span>
              <div className="relative flex w-full items-stretch">
                <input
                  className="form-input flex w-full rounded-l-xl border border-r-0 border-slate-200 dark:border-white/20 bg-white dark:bg-white/5 focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/20 text-base"
                  placeholder="Create a password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
                <div
                  className="flex items-center justify-center px-4 border border-l-0 border-slate-200 dark:border-white/20 bg-white dark:bg-white/5 rounded-r-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-white/10 transition-colors text-slate-400 dark:text-white/30"
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
                  className="form-input flex w-full rounded-l-xl border border-r-0 border-slate-200 dark:border-white/20 bg-white dark:bg-white/5 focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/20 text-base"
                  placeholder="Confirm password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                />
                <div
                  className="flex items-center justify-center px-4 border border-l-0 border-slate-200 dark:border-white/20 bg-white dark:bg-white/5 rounded-r-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-white/10 transition-colors text-slate-400 dark:text-white/30"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showConfirmPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </div>
              </div>
            </label>

            <label className="flex items-center gap-3 mt-1 ml-1 cursor-pointer">
              <input
                className="form-checkbox w-5 h-5 text-primary rounded border-slate-200 dark:border-white/20 focus:ring-primary bg-white dark:bg-white/5"
                type="checkbox"
                checked={formData.agreeToTerms}
                onChange={(e) => setFormData({ ...formData, agreeToTerms: e.target.checked })}
                required
              />
              <span className="text-sm text-slate-500 dark:text-slate-400 select-none">
                I agree to the{' '}
                <a href="#" className="text-primary font-semibold hover:underline">
                  Terms & Conditions
                </a>
              </span>
            </label>

            {error && (
              <div className="w-full p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}
            <Button
              type="submit"
              disabled={isLoading}
              className="mt-4 w-full h-12 bg-primary hover:bg-blue-600 active:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>

          <div className="relative w-full my-8 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-white/10"></div>
            </div>
            <span className="relative bg-white dark:bg-background-dark/50 px-3 text-[10px] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-widest">
              Or sign up with
            </span>
          </div>

          <div className="flex gap-4 w-full">
            <button className="flex-1 h-12 flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 transition-colors text-slate-700 dark:text-white font-medium text-sm">
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
            <button className="flex-1 h-12 flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors text-white font-medium text-sm">
              <svg
                className="w-5 h-5 text-white"
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
