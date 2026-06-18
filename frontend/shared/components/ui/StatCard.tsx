import { ReactNode } from 'react'
import { cn } from '@/shared/utils/cn'
import { RoundedBox } from './RoundedBox'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: ReactNode
  trend?: {
    value: string
    isPositive: boolean
  }
  className?: string
  variant?: 'default' | 'highlight'
  onClick?: () => void
  clickable?: boolean
}

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  className,
  variant = 'default',
  onClick,
  clickable = false,
}: StatCardProps) {
  return (
    <RoundedBox
      variant={variant === 'highlight' ? 'default' : 'default'}
      padding="md"
      className={cn(
        'flex min-w-0 flex-col gap-2 overflow-hidden',
        (clickable || onClick) && 'cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]',
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-2 min-w-0">
        <div className="flex min-w-0 flex-1 items-start gap-2">
          {icon && (
            <div className="shrink-0 text-slate-500 dark:text-slate-400 [&_.material-symbols-outlined]:text-[18px] sm:[&_.material-symbols-outlined]:text-[20px]">
              {icon}
            </div>
          )}
          <p className="min-w-0 text-xs sm:text-sm font-medium leading-snug text-slate-500 dark:text-slate-400 break-words">
            {title}
          </p>
        </div>
        {trend && (
          <span
            className={cn(
              'inline-flex shrink-0 items-center gap-1 rounded-none px-2 py-1 text-xs font-semibold border',
              trend.isPositive
                ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-transparent dark:border-emerald-500/20'
                : 'bg-slate-100 dark:bg-slate-700/30 text-slate-600 dark:text-slate-400 border-transparent dark:border-slate-700/50'
            )}
          >
            <span className="material-symbols-outlined text-[14px]">
              {trend.isPositive ? 'trending_up' : 'remove'}
            </span>
            {trend.value}
          </span>
        )}
      </div>
      <p className="min-w-0 truncate text-slate-900 dark:text-white tracking-tight text-xl sm:text-2xl font-bold">
        {value}
      </p>
      {subtitle && (
        <p className="min-w-0 text-slate-400 dark:text-slate-500 text-xs font-medium leading-snug break-words">
          {subtitle}
        </p>
      )}
    </RoundedBox>
  )
}
