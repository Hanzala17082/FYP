import Link from 'next/link'
import { cn } from '@/shared/utils/cn'
import { StatusBadge } from './StatusBadge'
import { Button } from './Button'

interface TripCardProps {
  id: string
  title: string
  agency: { name: string; verified?: boolean }
  startDate: string
  endDate: string
  duration: number
  price: number
  image: string
  badge?: { text: string; status: 'pending' | 'confirmed' | 'trending' | 'approved' | 'active' | 'completed' | 'cancelled' }
  className?: string
}

export function TripCard({
  id,
  title,
  agency,
  startDate,
  endDate,
  duration,
  price,
  image,
  badge,
  className,
}: TripCardProps) {
  // Safety check for agency
  if (!agency) {
    console.warn('TripCard: agency is missing for trip', id)
    return null
  }

  return (
    <Link
      href={`/trips/${id}`}
      className={cn(
        'group flex flex-col overflow-hidden rounded-2xl bg-white dark:bg-card-dark shadow-xl border border-slate-200 dark:border-border-dark hover:border-primary/50 transition-all',
        className
      )}
    >
      <div className="relative h-52 w-full overflow-hidden">
        {badge && (
          <div className="absolute top-3 left-3 z-10">
            <StatusBadge status={badge.status} size="sm" />
          </div>
        )}
        <div
          className="h-full w-full bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
          style={{ backgroundImage: `url('${image}')` }}
          role="img"
          aria-label={title}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white/60 dark:from-card-dark/60 to-transparent"></div>
      </div>
      <div className="flex flex-col gap-3 p-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">
            {agency?.name || 'Unknown Agency'}
          </p>
          <h3 className="text-lg font-bold leading-tight text-slate-900 dark:text-white">{title}</h3>
        </div>
        <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[18px] text-primary">calendar_month</span>
            <span>
              {startDate}-{endDate}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[18px] text-primary">schedule</span>
            <span>{duration} Days</span>
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between pt-4 border-t border-slate-200 dark:border-border-dark">
          <div>
            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-500">
              Starting from
            </p>
            <p className="text-xl font-extrabold text-slate-900 dark:text-white">${price.toLocaleString()}</p>
          </div>
          <Button variant="primary" size="sm" className="px-5 py-2.5">
            View Details
          </Button>
        </div>
      </div>
    </Link>
  )
}
