import { ReactNode } from 'react'
import { cn } from '@/shared/utils/cn'
import { Button } from './Button'

interface AlertBoxProps {
  title: string
  message: string
  icon?: ReactNode
  variant?: 'info' | 'warning' | 'success' | 'error'
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

const variantClasses = {
  info: 'border-blue-100 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-900/20',
  warning: 'border-amber-100 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-900/20',
  success: 'border-emerald-100 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-900/20',
  error: 'border-red-100 dark:border-red-900 bg-red-50/50 dark:bg-red-900/20',
}

const iconColors = {
  info: 'bg-blue-100 dark:bg-blue-800 text-primary dark:text-blue-300',
  warning: 'bg-amber-100 dark:bg-amber-800 text-amber-600 dark:text-amber-300',
  success: 'bg-emerald-100 dark:bg-emerald-800 text-emerald-600 dark:text-emerald-300',
  error: 'bg-red-100 dark:bg-red-800 text-red-600 dark:text-red-300',
}

export function AlertBox({
  title,
  message,
  icon,
  variant = 'info',
  action,
  className,
}: AlertBoxProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-2xl border p-4 shadow-sm',
        variantClasses[variant],
        className
      )}
    >
      <div className="flex items-start gap-3">
        {icon && (
          <div className={cn('rounded-full p-2', iconColors[variant])}>{icon}</div>
        )}
        <div className="flex-1">
          <p className="text-slate-900 dark:text-white text-sm font-bold leading-tight mb-1">
            {title}
          </p>
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-normal">{message}</p>
        </div>
      </div>
      {action && (
        <div className="flex justify-end w-full">
          <Button
            size="sm"
            variant="primary"
            className="h-8 px-4 text-xs font-semibold"
            onClick={action.onClick}
          >
            {action.label}
          </Button>
        </div>
      )}
    </div>
  )
}
