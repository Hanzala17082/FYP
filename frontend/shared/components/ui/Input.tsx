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
      <label className="flex flex-col w-full">
        {label && (
          <span className="text-white text-xs font-medium leading-normal pb-1.5 ml-1 uppercase tracking-wider opacity-70">
            {label}
          </span>
        )}
        <div className="relative">
          {icon && iconPosition === 'left' && (
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            className={cn(
              'form-input flex w-full rounded-xl text-white border border-white/20 bg-white/5',
              'focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4 text-base',
              'placeholder:text-white/20 transition-colors',
              icon && iconPosition === 'left' && 'pl-12',
              icon && iconPosition === 'right' && 'pr-12',
              error && 'border-red-500',
              className
            )}
            {...props}
          />
          {icon && iconPosition === 'right' && (
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30">
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
