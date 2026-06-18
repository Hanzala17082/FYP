import { ReactNode } from 'react'
import { cn } from '@/shared/utils/cn'
import Image from 'next/image'

interface ImageCardProps {
  image?: string
  imageAlt?: string
  title: string
  subtitle?: string
  overlay?: ReactNode
  onClick?: () => void
  className?: string
  variant?: 'default' | 'wishlist' | 'add'
  imageHeight?: 'sm' | 'md' | 'lg'
}

const imageHeights = {
  sm: 'h-24',
  md: 'h-36',
  lg: 'h-52',
}

export function ImageCard({
  image,
  imageAlt,
  title,
  subtitle,
  overlay,
  onClick,
  className,
  variant = 'default',
  imageHeight = 'md',
}: ImageCardProps) {
  if (variant === 'add') {
    return (
      <div
        className={cn(
          'bg-white dark:bg-slate-800 rounded-none overflow-hidden shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-center min-h-[140px] relative group cursor-pointer',
          className
        )}
        onClick={onClick}
      >
        <div className="absolute inset-0 bg-slate-50 dark:bg-slate-700/50 flex flex-col items-center justify-center gap-2 group-hover:bg-slate-100 dark:group-hover:bg-slate-700 transition-colors">
          <div className="size-8 rounded-none bg-slate-200 dark:bg-slate-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-slate-500 dark:text-slate-300 text-[20px]">
              add
            </span>
          </div>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-300">
            Add Destination
          </span>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'bg-white dark:bg-slate-800 rounded-none overflow-hidden shadow-sm border border-slate-100 dark:border-slate-700',
        onClick && 'cursor-pointer hover:shadow-md transition-shadow',
        className
      )}
      onClick={onClick}
    >
      {image && (
        <div className={cn('relative w-full bg-cover bg-center', imageHeights[imageHeight])}>
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url('${image}')` }}
            role="img"
            aria-label={imageAlt || title}
          />
          {overlay && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent">
              {overlay}
            </div>
          )}
        </div>
      )}
      <div className="p-3">
        <p className="font-bold text-sm text-slate-900 dark:text-white">{title}</p>
        {subtitle && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>
        )}
      </div>
    </div>
  )
}
