import Link from 'next/link'
import { ReactNode } from 'react'
import { cn } from '@/shared/utils/cn'

interface SectionHeaderProps {
  title: string
  action?: {
    label: string
    href: string
  }
  className?: string
}

export function SectionHeader({ title, action, className }: SectionHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between', className)}>
      <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-tight">
        {title}
      </h2>
      {action && (
        <Link
          href={action.href}
          className="text-primary text-sm font-semibold hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          {action.label}
        </Link>
      )}
    </div>
  )
}
