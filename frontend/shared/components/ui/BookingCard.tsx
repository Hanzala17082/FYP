import Link from 'next/link'
import { memo } from 'react'
import { cn } from '@/shared/utils/cn'
import { Avatar } from './Avatar'
import { StatusBadge } from './StatusBadge'
import { RoundedBox } from './RoundedBox'
import { Button } from './Button'

interface BookingCardProps {
  id: string
  traveler: {
    name: string
    avatar?: string
    status?: 'online' | 'offline' | 'away' | 'busy'
    id?: string // Traveler ID for profile link
  }
  trip: {
    destination: string
    dates: string
  }
  status: 'pending' | 'confirmed' | 'reviewing' | 'cancelled' | 'rejected'
  timeAgo: string
  onClick?: () => void
  onAccept?: () => void
  onReject?: () => void
  showActions?: boolean
  className?: string
}

function BookingCardInner({
  traveler,
  trip,
  status,
  timeAgo,
  onClick,
  onAccept,
  onReject,
  showActions = false,
  className,
}: BookingCardProps) {
  const isPending = status === 'pending'
  const showActionButtons = showActions && isPending && (onAccept || onReject)

  return (
    <RoundedBox
      variant="default"
      padding="md"
      className={cn(
        'flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors',
        onClick ? 'cursor-pointer group' : '',
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
          {traveler.id ? (
            <Link
              href={`/travelers/${traveler.id}`}
              onClick={(e) => e.stopPropagation()}
              className={cn(
                'text-slate-900 dark:text-white text-base font-semibold leading-normal truncate',
                'hover:text-primary transition-colors cursor-pointer'
              )}
            >
              {traveler.name}
            </Link>
          ) : (
            <p className={cn(
              'text-slate-900 dark:text-white text-base font-semibold leading-normal truncate',
              onClick && 'group-hover:text-primary transition-colors'
            )}>
              {traveler.name}
            </p>
          )}
          <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">{timeAgo}</span>
        </div>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-normal leading-normal truncate">
          {trip.destination} • {trip.dates}
        </p>
      </div>
      <div className="shrink-0 flex items-center gap-2">
        {showActionButtons ? (
          <>
            <Button
              variant="primary"
              size="sm"
              className="h-8 px-3 text-xs"
              onClick={(e) => {
                e.stopPropagation()
                onAccept?.()
              }}
            >
              Accept
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-3 text-xs border-red-500 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              onClick={(e) => {
                e.stopPropagation()
                onReject?.()
              }}
            >
              Reject
            </Button>
          </>
        ) : (
          <StatusBadge status={status} size="md" />
        )}
      </div>
    </RoundedBox>
  )
}

export const BookingCard = memo(BookingCardInner)
