import { cn } from '@/shared/utils/cn'

export type StatusIndicator = 'online' | 'offline' | 'away' | 'busy'

interface AvatarProps {
  src?: string
  alt?: string
  name?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  status?: StatusIndicator
  className?: string
  fallback?: string
}

const sizeClasses = {
  xs: 'size-6',
  sm: 'size-8',
  md: 'size-10',
  lg: 'size-12',
  xl: 'size-16',
}

const statusColors = {
  online: 'bg-emerald-500',
  offline: 'bg-slate-400',
  away: 'bg-yellow-400',
  busy: 'bg-red-500',
}

const statusSizes = {
  xs: 'size-1.5',
  sm: 'size-2',
  md: 'size-2.5',
  lg: 'size-3',
  xl: 'size-3.5',
}

export function Avatar({
  src,
  alt,
  name,
  size = 'md',
  status,
  className,
  fallback,
}: AvatarProps) {
  const initials = name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const avatarSize = sizeClasses[size]
  const statusSize = statusSizes[size]

  return (
    <div className={cn('relative shrink-0', className)}>
      {src ? (
        <div
          className={cn(
            'bg-center bg-no-repeat bg-cover rounded-full border-2 border-white dark:border-slate-700 shadow-sm',
            avatarSize
          )}
          style={{ backgroundImage: `url('${src}')` }}
          role="img"
          aria-label={alt || name || 'Avatar'}
        />
      ) : (
        <div
          className={cn(
            'flex items-center justify-center rounded-full bg-gradient-to-br from-primary to-blue-600 text-white font-bold border-2 border-white dark:border-slate-700 shadow-sm',
            avatarSize,
            size === 'xs' ? 'text-[8px]' : size === 'sm' ? 'text-xs' : 'text-sm'
          )}
        >
          {initials || fallback || '?'}
        </div>
      )}

      {status && (
        <div
          className={cn(
            'absolute -bottom-0.5 -right-0.5 rounded-full border-2 border-white dark:border-slate-800',
            statusColors[status],
            statusSize
          )}
        />
      )}
    </div>
  )
}
