'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global error:', error)
  }, [error])

  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex flex-col items-center justify-center bg-background-light dark:bg-background-dark p-6">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
                Something went wrong!
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                A critical error occurred. Please refresh the page or contact support.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <button
                  onClick={reset}
                  className="px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-blue-600 transition-colors w-full sm:w-auto"
                >
                  Try again
                </button>
                <button
                  onClick={() => (window.location.href = '/')}
                  className="px-6 py-3 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors w-full sm:w-auto"
                >
                  Go home
                </button>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
