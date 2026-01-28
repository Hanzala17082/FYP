import { cn } from '@/shared/utils/cn'
import { Avatar } from './Avatar'
import { StatusBadge } from './StatusBadge'
import { RoundedBox } from './RoundedBox'

interface BookingCardProps {
  id: string
  traveler: {
    name: string
    avatar?: string
    status?: 'online' | 'offline' | 'away' | 'busy'
  }
  trip: {
    destination: string
    dates: string
  }
  status: 'pending' | 'confirmed' | 'reviewing' | 'cancelled'
  timeAgo: string
  onClick?: () => void
  className?: string
}

export function BookingCard({
  traveler,
  trip,
  status,
  timeAgo,
  onClick,
  className,
}: BookingCardProps) {
  return (
    <RoundedBox
      variant="default"
      padding="md"
      className={cn(
        'flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer group',
        className
      )}
      onClick={onClick}
    >
      <div className="shrink-0 relative">
        <Avatar
          src={traveler.avatar}
          name={traveler.name}
          size="lg"
          status={traveler.status}
        />
      </div>
      <div className="flex flex-col flex-1 min-w-0">
        <div className="flex justify-between items-start">
          <p className="text-slate-900 dark:text-white text-base font-semibold leading-normal truncate group-hover:text-primary transition-colors">
            {traveler.name}
          </p>
          <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">{timeAgo}</span>
        </div>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-normal leading-normal truncate">
          {trip.destination} • {trip.dates}
        </p>
      </div>
      <div className="shrink-0">
        <StatusBadge status={status} size="md" />
      </div>
    </RoundedBox>
  )
}
