import Link from 'next/link'
import { ReactNode } from 'react'
import { cn } from '@/shared/utils/cn'

interface SectionHeaderProps {
  title: string
  subtitle?: string
  action?: {
    label: string
    href: string
  }
  className?: string
}

export function SectionHeader({ title, subtitle, action, className }: SectionHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between', className)}>
      <div className="min-w-0">
        <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>
        )}
      </div>
      {action && (
        <Link
          href={action.href}
          className="text-primary text-sm font-semibold hover:text-blue-600 dark:hover:text-blue-400 transition-colors shrink-0"
        >
          {action.label}
        </Link>
      )}
    </div>
  )
}
