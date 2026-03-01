'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/shared/components/ui/Button'

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Admin section error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-6">
      <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
        Something went wrong
      </h1>
      <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 max-w-md text-center">
        {error.message || 'An error occurred in the admin section.'}
      </p>
      <div className="flex gap-3">
        <Button onClick={reset} className="bg-primary text-white">
          Try again
        </Button>
        <Link href="/admin/login">
          <Button variant="outline">Go to Admin Login</Button>
        </Link>
      </div>
    </div>
  )
}
