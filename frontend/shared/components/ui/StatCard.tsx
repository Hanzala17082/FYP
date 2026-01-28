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
      padding="lg"
      className={cn(
        'flex flex-col gap-2',
        (clickable || onClick) && 'cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]',
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        {icon && (
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
            {icon}
            <p className="text-sm font-medium">{title}</p>
          </div>
        )}
        {!icon && <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{title}</p>}
        {trend && (
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold border',
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
      <p className="text-slate-900 dark:text-white tracking-tight text-2xl font-bold">{value}</p>
      {subtitle && (
        <p className="text-slate-400 dark:text-slate-500 text-xs font-medium">{subtitle}</p>
      )}
    </RoundedBox>
  )
}
