'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/shared/contexts/AuthContext'
import { cn } from '@/shared/utils/cn'

interface BackButtonProps {
  href?: string
  label?: string
  onClick?: () => void
  className?: string
  showLabel?: boolean
  validateRole?: boolean
  expectedRole?: 'Admin' | 'Agency' | 'Traveler'
}

/**
 * Reusable back button component
 * Position: Always on the LEFT side of header
 * Icon: arrow_back (consistent)
 */
export function BackButton({
  href,
  label = 'Back',
  onClick,
  className,
  showLabel = true,
  validateRole = false,
  expectedRole,
}: BackButtonProps) {
  const router = useRouter()
  const { user } = useAuth()

  const handleClick = () => {
    // Validate role if required
    if (validateRole && expectedRole && user?.role !== expectedRole) {
      console.warn(`BackButton: Role mismatch. Expected ${expectedRole}, got ${user?.role}`)
      return
    }

    if (onClick) {
      onClick()
    } else if (href) {
      router.push(href)
    } else {
      router.back()
    }
  }

  return (
    <button
      onClick={handleClick}
      className={cn(
        'flex items-center gap-2 h-10 px-3 text-sm font-semibold',
        'text-slate-700 dark:text-white',
        'hover:bg-slate-100 dark:hover:bg-slate-700',
        'rounded-xl transition-colors duration-200',
        'border border-slate-200 dark:border-slate-700',
        'bg-white dark:bg-slate-800',
        className
      )}
    >
      <span className="material-symbols-outlined text-[20px]">arrow_back</span>
      {showLabel && <span className="hidden sm:inline">{label}</span>}
    </button>
  )
}
