'use client'

import { useState } from 'react'
import { authService } from '@/services/auth.service'
import { getErrorMessage } from '@/shared/utils/error-message'
import type { AppUserRole } from '@/shared/lib/supabase/user-provision'

interface GoogleSignInButtonProps {
  role: AppUserRole
  onError?: (message: string) => void
  className?: string
  label?: string
}

export function GoogleSignInButton({
  role,
  onError,
  className = 'flex-1 h-14 flex items-center justify-center gap-2 rounded-none border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 hover:border-slate-300 dark:hover:border-white/20 transition-all text-slate-700 dark:text-white font-semibold text-sm shadow-sm active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed',
  label = 'Google',
}: GoogleSignInButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleClick = async () => {
    setIsLoading(true)
    try {
      await authService.signInWithGoogle(role)
    } catch (err: unknown) {
      onError?.(
        getErrorMessage(
          err,
          'Google sign-in failed. In Supabase Dashboard: enable Google under Authentication → Providers, add Client ID/Secret from Google Cloud, and allow redirect URL http://localhost:3000/auth/callback under URL Configuration.'
        )
      )
      setIsLoading(false)
    }
  }

  return (
    <button
      type="button"
      disabled={isLoading}
      onClick={() => void handleClick()}
      className={className}
    >
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M23.7663 12.2764C23.7663 11.4607 23.6999 10.6406 23.5588 9.83807H12.2402V14.4591H18.722C18.4528 15.9494 17.5887 17.2678 16.3233 18.1056V21.1039H20.1903C22.4611 19.0139 23.7663 15.9274 23.7663 12.2764Z"
          fill="#4285F4"
        />
        <path
          d="M12.2401 24.0008C15.4765 24.0008 18.2059 22.9382 20.1945 21.1039L16.3275 18.1055C15.2517 18.8375 13.8627 19.252 12.2445 19.252C9.11391 19.252 6.45949 17.1399 5.50708 14.3003H1.5166V17.3912C3.55374 21.4434 7.70293 24.0008 12.2401 24.0008Z"
          fill="#34A853"
        />
        <path
          d="M5.50277 14.3003C4.99952 12.8099 4.99952 11.1961 5.50277 9.70575V6.61481H1.51674C-0.185512 10.0056 -0.185512 14.0004 1.51674 17.3912L5.50277 14.3003Z"
          fill="#FBBC05"
        />
        <path
          d="M12.2401 4.74966C13.9509 4.7232 15.6044 5.36697 16.8434 6.54867L20.2695 3.12262C18.1001 1.0855 15.2208 -0.0344664 12.2401 0.000808666C7.70293 0.000808666 3.55374 2.55822 1.5166 6.61481L5.50264 9.70575C6.45064 6.86173 9.10947 4.74966 12.2401 4.74966Z"
          fill="#EA4335"
        />
      </svg>
      {isLoading ? 'Redirecting…' : label}
    </button>
  )
}
