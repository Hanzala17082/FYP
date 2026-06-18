import { cn } from '@/shared/utils/cn'

interface LogoProps {
  className?: string
  showTagline?: boolean
  variant?: 'light' | 'dark'
}

export function Logo({ className, showTagline = true, variant = 'light' }: LogoProps) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div
        className={cn(
          'p-2 rounded-none border',
          variant === 'light'
            ? 'bg-white/10 backdrop-blur-md border-white/20'
            : 'bg-slate-100 border-slate-200'
        )}
      >
        <span
          className={cn(
            'material-symbols-outlined text-3xl',
            variant === 'light' ? 'text-white' : 'text-primary'
          )}
        >
          flight_takeoff
        </span>
      </div>
      <div className="flex flex-col">
        <span
          className={cn(
            'text-2xl font-bold tracking-tight leading-none',
            variant === 'light' ? 'text-white' : 'text-slate-900'
          )}
        >
          Tripster
        </span>
        {showTagline && (
          <span
            className={cn(
              'text-[10px] font-bold tracking-[0.2em] uppercase mt-0.5',
              variant === 'light' ? 'text-white/70' : 'text-slate-500'
            )}
          >
            Travel Smarter
          </span>
        )}
      </div>
    </div>
  )
}
