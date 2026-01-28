'use client'

import Link from 'next/link'
import { useAuth } from '@/shared/contexts/AuthContext'
import { cn } from '@/shared/utils/cn'

interface NavButtonProps {
  href: string
  label: string
  icon?: string
  variant?: 'default' | 'outline'
  className?: string
  showLabel?: boolean
  validateRole?: boolean
  expectedRole?: 'Admin' | 'Agency' | 'Traveler'
}

/**
 * Reusable navigation button component
 * Position: Always on the LEFT side of header (for navigation)
 * Use for: Dashboard, Browse Trips, etc.
 */
export function NavButton({
  href,
  label,
  icon = 'arrow_forward',
  variant = 'default',
  className,
  showLabel = true,
  validateRole = false,
  expectedRole,
}: NavButtonProps) {
  const { user } = useAuth()

  // Validate role if required
  if (validateRole && expectedRole && user?.role !== expectedRole) {
    console.warn(`NavButton: Role mismatch. Expected ${expectedRole}, got ${user?.role}`)
    return null
  }
  const baseStyles =
    'flex items-center gap-2 h-10 px-3 text-sm font-semibold rounded-xl transition-colors duration-200 border'

  const variants = {
    default: cn(
      'text-slate-700 dark:text-white',
      'hover:bg-slate-100 dark:hover:bg-slate-700',
      'border-slate-200 dark:border-slate-700',
      'bg-white dark:bg-slate-800'
    ),
    outline: cn(
      'text-slate-700 dark:text-white',
      'hover:bg-slate-100 dark:hover:bg-slate-700',
      'border-slate-200 dark:border-slate-700',
      'bg-transparent'
    ),
  }

  return (
    <Link href={href} className={cn(baseStyles, variants[variant], className)}>
      {icon && <span className="material-symbols-outlined text-[20px]">{icon}</span>}
      {showLabel && <span className="hidden sm:inline">{label}</span>}
    </Link>
  )
}
