import { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/shared/utils/cn'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  variant?: 'default' | 'dark' | 'glass'
}

export function Card({ children, variant = 'default', className, ...props }: CardProps) {
  const variants = {
    default: 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700',
    dark: 'bg-card-dark border border-border-dark',
    glass: 'glass-container border border-white/10',
  }

  return (
    <div
      className={cn(
        'rounded-none shadow-xl overflow-hidden',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
