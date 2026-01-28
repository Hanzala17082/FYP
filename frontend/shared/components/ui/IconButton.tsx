import { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/shared/utils/cn'

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode
  variant?: 'default' | 'primary' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  badge?: number | boolean
  className?: string
}

const variantClasses = {
  default:
    'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700',
  primary: 'bg-primary text-white hover:bg-blue-600 shadow-lg shadow-primary/20',
  ghost: 'bg-transparent hover:bg-white/10 text-white',
  outline:
    'bg-transparent border border-white/20 hover:bg-white/5 text-white hover:border-white/30',
}

const sizeClasses = {
  sm: 'size-8 text-[18px]',
  md: 'size-10 text-[24px]',
  lg: 'size-12 text-[28px]',
}

export function IconButton({
  icon,
  variant = 'default',
  size = 'md',
  badge,
  className,
  ...props
}: IconButtonProps) {
  return (
    <button
      className={cn(
        'relative flex items-center justify-center rounded-full transition-colors',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {icon}
      {badge && (
        <span
          className={cn(
            'absolute rounded-full bg-red-500 border-2',
            size === 'sm' ? 'top-1 right-1 size-2' : 'top-2 right-2 size-2.5',
            variant === 'default' ? 'border-white dark:border-slate-800' : 'border-white'
          )}
        />
      )}
    </button>
  )
}
