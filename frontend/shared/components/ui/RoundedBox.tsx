import { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/shared/utils/cn'

export type BoxVariant = 'default' | 'dark' | 'glass' | 'light' | 'outline'

interface RoundedBoxProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  variant?: BoxVariant
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
}

const variantClasses = {
  default:
    'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700',
  dark: 'bg-card-dark border border-border-dark',
  glass: 'glass-container border border-white/10',
  light: 'bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800',
  outline: 'bg-transparent border-2 border-slate-200 dark:border-slate-700',
}

const roundedClasses = {
  none: 'rounded-none',
  sm: 'rounded-none',
  md: 'rounded-none',
  lg: 'rounded-none',
  xl: 'rounded-none',
  '2xl': 'rounded-none',
  full: 'rounded-none',
}

const paddingClasses = {
  none: '',
  sm: 'p-2',
  md: 'p-4',
  lg: 'p-6',
  xl: 'p-8',
}

const shadowClasses = {
  none: '',
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
}

export function RoundedBox({
  children,
  variant = 'default',
  rounded = 'none',
  padding = 'md',
  shadow = 'sm',
  className,
  ...props
}: RoundedBoxProps) {
  return (
    <div
      className={cn(
        variantClasses[variant],
        roundedClasses[rounded],
        paddingClasses[padding],
        shadowClasses[shadow],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
