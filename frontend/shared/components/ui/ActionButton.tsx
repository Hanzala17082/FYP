import { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/shared/utils/cn'

interface ActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: string
  label: string
  variant?: 'default' | 'primary'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses = {
  sm: 'size-10 text-[20px]',
  md: 'size-14 text-[26px]',
  lg: 'size-16 text-[28px]',
}

export function ActionButton({
  icon,
  label,
  variant = 'default',
  size = 'md',
  className,
  ...props
}: ActionButtonProps) {
  return (
    <button
      className={cn(
        'group flex flex-col items-center gap-2',
        className
      )}
      {...props}
    >
      <div
        className={cn(
          'flex items-center justify-center rounded-none transition-all',
          variant === 'default'
            ? 'bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 group-hover:border-primary/30 group-hover:bg-primary/5'
            : 'bg-primary text-white shadow-lg shadow-primary/20 hover:bg-blue-600',
          sizeClasses[size]
        )}
      >
        <span
          className={cn(
            'material-symbols-outlined',
            variant === 'default' ? 'text-primary' : 'text-white'
          )}
        >
          {icon}
        </span>
      </div>
      <span
        className={cn(
          'text-xs font-medium transition-colors',
          variant === 'default'
            ? 'text-slate-600 dark:text-slate-300 group-hover:text-primary'
            : 'text-white'
        )}
      >
        {label}
      </span>
    </button>
  )
}
