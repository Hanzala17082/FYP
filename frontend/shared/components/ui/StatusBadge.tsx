import { memo } from 'react'
import { cn } from '@/shared/utils/cn'

export type StatusType =
  | 'pending'
  | 'confirmed'
  | 'reviewing'
  | 'cancelled'
  | 'completed'
  | 'active'
  | 'trending'
  | 'approved'
  | 'rejected'

interface StatusBadgeProps {
  status: StatusType
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const statusConfig: Record<
  StatusType,
  { label: string; bg: string; text: string; border?: string }
> = {
  pending: {
    label: 'Pending',
    bg: 'bg-yellow-100 dark:bg-yellow-500/10',
    text: 'text-yellow-700 dark:text-yellow-400',
    border: 'border-transparent dark:border-yellow-500/20',
  },
  confirmed: {
    label: 'Confirmed',
    bg: 'bg-emerald-100 dark:bg-emerald-500/10',
    text: 'text-emerald-700 dark:text-emerald-400',
    border: 'border-transparent dark:border-emerald-500/20',
  },
  reviewing: {
    label: 'Reviewing',
    bg: 'bg-slate-100 dark:bg-slate-700/30',
    text: 'text-slate-600 dark:text-slate-400',
    border: 'border-transparent dark:border-slate-700/50',
  },
  cancelled: {
    label: 'Cancelled',
    bg: 'bg-red-100 dark:bg-red-500/10',
    text: 'text-red-700 dark:text-red-400',
    border: 'border-transparent dark:border-red-500/20',
  },
  completed: {
    label: 'Completed',
    bg: 'bg-blue-100 dark:bg-blue-500/10',
    text: 'text-blue-700 dark:text-blue-400',
    border: 'border-transparent dark:border-blue-500/20',
  },
  active: {
    label: 'Active',
    bg: 'bg-emerald-100 dark:bg-emerald-500/10',
    text: 'text-emerald-700 dark:text-emerald-400',
    border: 'border-transparent dark:border-emerald-500/20',
  },
  trending: {
    label: 'Trending',
    bg: 'bg-orange-500/90',
    text: 'text-white',
  },
  approved: {
    label: 'Company Approved',
    bg: 'bg-emerald-500/90',
    text: 'text-white',
  },
  rejected: {
    label: 'Rejected',
    bg: 'bg-red-500/90',
    text: 'text-white',
  },
}

const sizeClasses = {
  sm: 'px-2 py-0.5 text-[9px]',
  md: 'px-2.5 py-1 text-xs',
  lg: 'px-3 py-1.5 text-sm',
}

function StatusBadgeInner({ status, className, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status]
  const isOverlay = status === 'trending' || status === 'approved' || status === 'rejected'

  if (!config) {
    return (
      <div
        className={cn(
          'flex items-center justify-center rounded-none font-bold uppercase tracking-wider',
          'bg-slate-100 dark:bg-slate-700/30',
          'text-slate-600 dark:text-slate-400',
          sizeClasses[size],
          className
        )}
      >
        {status}
      </div>
    )
  }

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-none font-bold uppercase tracking-wider',
        config.bg,
        config.text,
        config.border && `border ${config.border}`,
        sizeClasses[size],
        isOverlay && 'backdrop-blur-sm shadow-sm',
        className
      )}
    >
      {config.label}
    </div>
  )
}

export const StatusBadge = memo(StatusBadgeInner)
