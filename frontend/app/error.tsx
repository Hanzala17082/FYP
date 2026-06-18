'use client'

import { useEffect } from 'react'
import { Button } from '@/shared/components/ui/Button'
import { Logo } from '@/shared/components/layout/Logo'
import { logger } from '@/shared/utils/logger'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    logger.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background-light dark:bg-background-dark p-6">
      <div className="max-w-md w-full text-center space-y-6">
        <Logo variant="dark" />
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
            Something went wrong!
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            {error.message || 'An unexpected error occurred. Please try again.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button onClick={reset} variant="primary" size="lg" className="w-full sm:w-auto">
              Try again
            </Button>
            <Button
              onClick={() => (window.location.href = '/')}
              variant="outline"
              size="lg"
              className="w-full sm:w-auto"
            >
              Go home
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
