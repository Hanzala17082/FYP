import { InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/shared/utils/cn'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, iconPosition = 'left', className, ...props }, ref) => {
    return (
      <label className="flex flex-col w-full min-w-0">
        {label && (
          <span className="pb-1.5 ml-1 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
            {label}
          </span>
        )}
        <div className="relative min-w-0">
          {icon && iconPosition === 'left' && (
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/30">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            className={cn(
              'form-input flex h-12 w-full min-w-0 rounded-none border px-4 text-base transition-colors',
              'border-slate-300 bg-white text-slate-900 placeholder:text-slate-400',
              'focus:border-primary focus:ring-1 focus:ring-primary/30',
              'dark:border-slate-600 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500',
              icon && iconPosition === 'left' && 'pl-12',
              icon && iconPosition === 'right' && 'pr-12',
              error && 'border-red-500',
              className
            )}
            {...props}
          />
          {icon && iconPosition === 'right' && (
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/30">
              {icon}
            </span>
          )}
        </div>
        {error && <span className="text-red-500 text-xs mt-1 ml-1">{error}</span>}
      </label>
    )
  }
)

Input.displayName = 'Input'
