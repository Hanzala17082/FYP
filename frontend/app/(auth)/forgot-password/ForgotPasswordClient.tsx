'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Logo } from '@/shared/components/layout/Logo'
import { Button } from '@/shared/components/ui/Button'
import { ThemeToggle } from '@/shared/components/ui/ThemeToggle'
import { authService } from '@/services/auth.service'
import { getErrorMessage } from '@/shared/utils/error-message'

export default function ForgotPasswordClient() {
  const searchParams = useSearchParams()
  const linkExpired = searchParams.get('error') === 'link_expired'
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [resetLink, setResetLink] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setResetLink(null)
    try {
      const res = await authService.forgotPassword({ email })
      setResetLink(res.data?.resetLink ?? null)
      setIsSubmitted(true)
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Something went wrong. Please try again.'))
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
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

        {/* Success Message */}
        <div className="flex-1 relative -mt-12 z-30 bg-white dark:bg-card-dark shadow-[0_-10px_40px_rgba(0,0,0,0.06)] px-6 pt-8 pb-8 md:pt-12 md:pb-12 flex flex-col items-center w-full max-w-lg md:max-w-2xl mx-auto">
          <div className="w-12 h-1.5 bg-slate-200 dark:bg-white/10 rounded-none mb-6 opacity-60"></div>
          
          <div className="w-20 h-20 rounded-none bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-4xl text-emerald-600 dark:text-emerald-400">
              check_circle
            </span>
          </div>

          <h1 className="text-slate-900 dark:text-white tracking-tight text-3xl font-bold leading-tight text-center mb-2 font-display">
            {resetLink ? 'Reset Link Ready' : 'Check Your Email'}
          </h1>
          {resetLink ? (
            <>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 text-center leading-relaxed max-w-sm">
                Supabase also sent a reset email if an account exists. For local testing, open the link below
                (expires soon — use it once).
              </p>
              <a href={resetLink} className="block w-full mb-4">
                <Button variant="primary" size="lg" className="w-full h-14">
                  Open Reset Password Page
                </Button>
              </a>
            </>
          ) : (
            <>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-4 text-center leading-relaxed max-w-sm">
                If an account exists for{' '}
                <span className="font-semibold text-slate-900 dark:text-white">{email}</span>, Supabase sent a
                password reset link. Check your inbox and spam folder.
              </p>
              <p className="text-slate-400 dark:text-slate-500 text-xs mb-8 text-center leading-relaxed max-w-sm">
                Use an email you signed up with using email and password. Open only the latest reset email.
              </p>
            </>
          )}

          <div className="w-full space-y-4">
            <Button
              variant={resetLink ? 'outline' : 'primary'}
              size="lg"
              className="w-full h-14"
              onClick={() => {
                setIsSubmitted(false)
                setResetLink(null)
              }}
            >
              {resetLink ? 'Send Another Link' : 'Resend Email'}
            </Button>
            <Link href="/login" className="block w-full">
              <Button variant="outline" size="lg" className="w-full h-14">
                Back to Login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
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
      <div className="flex-1 relative -mt-12 z-30 bg-white dark:bg-card-dark shadow-[0_-10px_40px_rgba(0,0,0,0.06)] px-6 pt-8 pb-8 md:pt-12 md:pb-12 flex flex-col items-center w-full max-w-lg md:max-w-2xl mx-auto">
        <div className="w-12 h-1.5 bg-slate-200 dark:bg-white/10 rounded-none mb-6 opacity-60"></div>
        <h1 className="text-slate-900 dark:text-white tracking-tight text-3xl font-bold leading-tight text-center mb-2 font-display">
          Forgot Password?
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 text-center leading-relaxed">
          No worries! Enter your email address and we&apos;ll send you a link to reset your password.
        </p>

        {linkExpired && (
          <div className="w-full p-3 mb-4 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20">
            <p className="text-sm text-amber-800 dark:text-amber-300">
              This reset link expired or was already used. Request a new one below and open the latest email only once.
            </p>
          </div>
        )}

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

          {error && (
            <div className="w-full p-3 rounded-none bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            variant="primary"
            size="lg"
            className="mt-4 w-full h-14 bg-primary hover:bg-blue-600 active:scale-[0.98] text-white text-lg font-bold rounded-none shadow-glow transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Sending...' : 'Send Reset Link'}
          </Button>
        </form>

        <div className="mt-8 mb-4 text-center">
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
            Remember your password?{' '}
            <Link href="/login" className="text-primary font-bold hover:underline ml-1">
              Log In
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
