'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Logo } from '@/shared/components/layout/Logo'
import { Button } from '@/shared/components/ui/Button'
import { ThemeToggle } from '@/shared/components/ui/ThemeToggle'
import { authService } from '@/services/auth.service'
import { createBrowserSupabaseClient } from '@/shared/lib/supabase/client'
import { getErrorMessage } from '@/shared/utils/error-message'

const SESSION_WAIT_MS = 8000

function parseAuthHashError(): string | null {
  if (typeof window === 'undefined') return null
  const hash = window.location.hash.replace(/^#/, '')
  if (!hash) return null

  const params = new URLSearchParams(hash)
  const errorCode = params.get('error_code')
  const error = params.get('error')
  const description = params.get('error_description')?.replace(/\+/g, ' ')

  if (errorCode === 'otp_expired' || error === 'access_denied') {
    return description || 'This reset link has expired or was already used.'
  }

  return null
}

export default function ResetPasswordClient() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  const [linkInvalid, setLinkInvalid] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const hashError = parseAuthHashError()
    if (hashError) {
      setError(hashError)
      setLinkInvalid(true)
      setIsChecking(false)
      return
    }

    const sb = createBrowserSupabaseClient()
    let cancelled = false
    let ready = false

    const markReady = () => {
      if (!cancelled && !ready) {
        ready = true
        setIsReady(true)
        setIsChecking(false)
        setLinkInvalid(false)
      }
    }

    void sb.auth.getSession().then(({ data: { session } }) => {
      if (session) markReady()
    })

    const {
      data: { subscription },
    } = sb.auth.onAuthStateChange((event, nextSession) => {
      if (event === 'PASSWORD_RECOVERY' || nextSession) markReady()
    })

    const timeout = window.setTimeout(() => {
      if (!cancelled && !ready) {
        setLinkInvalid(true)
        setIsChecking(false)
        setError('Reset link expired or invalid. Request a new password reset email.')
      }
    }, SESSION_WAIT_MS)

    return () => {
      cancelled = true
      subscription.unsubscribe()
      window.clearTimeout(timeout)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (linkInvalid || !isReady) return

    setIsLoading(true)
    setError('')

    try {
      await authService.resetPassword({
        token: '',
        password,
        confirmPassword,
      })
      setSuccess(true)
      setTimeout(() => router.push('/login'), 2500)
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Could not reset password. Request a new link and try again.'))
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="relative min-h-screen flex flex-col w-full overflow-x-hidden bg-background-light dark:bg-background-dark">
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-4xl text-emerald-600 dark:text-emerald-400">
              check_circle
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Password Updated</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm text-center">
            Redirecting you to login…
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen flex flex-col w-full overflow-x-hidden bg-background-light dark:bg-background-dark">
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

      <div className="flex-1 relative -mt-12 z-30 bg-white dark:bg-card-dark rounded-t-[32px] md:rounded-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.06)] px-6 pt-8 pb-8 md:pt-12 md:pb-12 flex flex-col items-center w-full max-w-lg md:max-w-2xl mx-auto">
        <div className="w-12 h-1.5 bg-slate-200 dark:bg-white/10 rounded-full mb-6 opacity-60"></div>
        <h1 className="text-slate-900 dark:text-white tracking-tight text-3xl font-bold leading-tight text-center mb-2 font-display">
          Set New Password
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 text-center leading-relaxed">
          Choose a strong password for your account.
        </p>

        {linkInvalid ? (
          <div className="w-full space-y-4 text-center">
            <div className="w-full p-4 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20">
              <p className="text-sm text-amber-800 dark:text-amber-300">
                {error || 'This reset link has expired or was already used.'}
              </p>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Request a new link and open it once. Older emails stop working after a new one is sent.
            </p>
            <Link href="/forgot-password" className="block w-full">
              <Button variant="primary" size="lg" className="w-full h-14">
                Request New Reset Link
              </Button>
            </Link>
            <Link href="/login" className="block text-primary font-semibold text-sm hover:underline">
              Back to Login
            </Link>
          </div>
        ) : isChecking || !isReady ? (
          <div className="w-full text-center py-8">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-500 dark:text-slate-400 text-sm">Verifying reset link…</p>
          </div>
        ) : (
          <form className="w-full flex flex-col gap-5" onSubmit={handleSubmit}>
            <label className="flex flex-col w-full group">
              <span className="text-slate-700 dark:text-slate-300 text-xs font-bold uppercase tracking-wider mb-2 ml-1">
                New Password
              </span>
              <div className="relative flex w-full items-stretch rounded-2xl">
                <input
                  className="form-input flex w-full rounded-2xl text-slate-900 dark:text-white border border-slate-200 dark:border-white/20 bg-white dark:bg-white/5 focus:border-primary focus:ring-4 focus:ring-primary/10 h-14 px-4 pl-12 text-base placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all duration-200"
                  placeholder="Enter new password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-400 group-focus-within:text-primary transition-colors text-[22px]">
                  lock
                </span>
                <button
                  type="button"
                  className="absolute right-0 top-0 h-full px-4 flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </label>

            <label className="flex flex-col w-full group">
              <span className="text-slate-700 dark:text-slate-300 text-xs font-bold uppercase tracking-wider mb-2 ml-1">
                Confirm Password
              </span>
              <div className="relative">
                <input
                  className="form-input flex w-full rounded-2xl text-slate-900 dark:text-white border border-slate-200 dark:border-white/20 bg-white dark:bg-white/5 focus:border-primary focus:ring-4 focus:ring-primary/10 h-14 px-4 pl-12 text-base placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all duration-200"
                  placeholder="Confirm new password"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                />
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-400 group-focus-within:text-primary transition-colors text-[22px]">
                  lock
                </span>
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
              className="mt-4 w-full h-14 bg-primary hover:bg-blue-600 text-white text-lg font-bold rounded-2xl shadow-glow transition-all disabled:opacity-50"
            >
              {isLoading ? 'Updating…' : 'Update Password'}
            </Button>
          </form>
        )}

        {!linkInvalid && (
          <div className="mt-8 mb-4 text-center">
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
              Link expired?{' '}
              <Link href="/forgot-password" className="text-primary font-bold hover:underline ml-1">
                Request a new one
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
