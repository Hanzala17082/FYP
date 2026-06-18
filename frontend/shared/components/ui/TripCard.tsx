import Link from 'next/link'
import { memo, useEffect, useMemo, useState } from 'react'
import { cn } from '@/shared/utils/cn'
import { useCurrency } from '@/shared/contexts/CurrencyContext'
import { StatusBadge } from './StatusBadge'
import { Button } from './Button'

interface TripCardProps {
  id: string
  title: string
  agency: { name: string; verified?: boolean }
  destination?: string
  startDate: string
  endDate: string
  duration: number
  price: number
  image: string
  images?: string[]
  /** Use for /trips/[slug] link; falls back to id if not set */
  slug?: string
  badge?: { text: string; status: 'pending' | 'confirmed' | 'trending' | 'approved' | 'active' | 'completed' | 'cancelled' }
  /** When set, card opens this modal instead of navigating to detail page */
  onSelectTrip?: (slug: string) => void
  className?: string
}

const cardShellClass =
  'group flex h-full flex-col overflow-hidden rounded-[24px] bg-white p-4 shadow-[0_10px_40px_rgba(15,23,42,0.08)] transition-all duration-300 dark:bg-[#1a1a1a] dark:shadow-[0_12px_40px_rgba(0,0,0,0.45)] border border-slate-100 dark:border-slate-800/80 hover:border-primary/35 hover:shadow-[0_16px_48px_rgba(19,127,236,0.15)]'

function TripCardInner({
  id,
  title,
  agency,
  destination,
  startDate,
  endDate,
  duration,
  price,
  image,
  images,
  slug,
  badge,
  onSelectTrip,
  className,
}: TripCardProps) {
  const { formatPrice } = useCurrency()

  if (!agency) {
    return null
  }

  const allImages = useMemo(() => {
    const arr = (images || []).filter(Boolean)
    if (arr.length > 0) return arr
    return image ? [image] : []
  }, [images, image])

  const hasCarousel = allImages.length > 1

  const slides = useMemo(() => {
    if (!hasCarousel) return allImages
    const first = allImages[0]
    const last = allImages[allImages.length - 1]
    return [last, ...allImages, first]
  }, [allImages, hasCarousel])

  const [trackIndex, setTrackIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    if (!hasCarousel) {
      setTrackIndex(0)
      setIsAnimating(false)
      return
    }

    setTrackIndex(1)
    setIsAnimating(false)
  }, [hasCarousel, allImages.length])

  useEffect(() => {
    if (!hasCarousel || isPaused) return

    const interval = setInterval(() => {
      setIsAnimating(true)
      setTrackIndex((i) => i + 1)
    }, 6500)

    return () => clearInterval(interval)
  }, [hasCarousel, isPaused])

  const activeIndex = useMemo(() => {
    if (!hasCarousel) return 0
    const logical = trackIndex - 1
    const len = allImages.length
    return ((logical % len) + len) % len
  }, [trackIndex, allImages.length, hasCarousel])

  const goPrev = () => {
    if (!hasCarousel) return
    setIsAnimating(true)
    setTrackIndex((i) => i - 1)
  }

  const goNext = () => {
    if (!hasCarousel) return
    setIsAnimating(true)
    setTrackIndex((i) => i + 1)
  }

  const tripSlug = slug ?? id
  const destinationLabel = destination?.split(',')[0]?.trim()

  const imageBlock = (
    <div
      className="relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-[20px] bg-slate-100 dark:bg-slate-900"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {badge && (
        <div className="absolute left-3 top-3 z-10">
          <StatusBadge status={badge.status} size="sm" />
        </div>
      )}

      {destinationLabel && (
        <div className="absolute right-3 top-3 z-10 flex max-w-[55%] items-center gap-1 rounded-full bg-black/35 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
          <span className="material-symbols-outlined text-[14px]">location_on</span>
          <span className="truncate">{destinationLabel}</span>
        </div>
      )}

      {hasCarousel && (
        <>
          <button
            type="button"
            aria-label="Previous image"
            className="absolute left-2 top-1/2 z-10 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-black/35 text-white backdrop-blur-sm transition-colors hover:bg-black/55"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              goPrev()
            }}
          >
            <span className="material-symbols-outlined text-[18px]">chevron_left</span>
          </button>
          <button
            type="button"
            aria-label="Next image"
            className="absolute right-2 top-1/2 z-10 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-black/35 text-white backdrop-blur-sm transition-colors hover:bg-black/55"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              goNext()
            }}
          >
            <span className="material-symbols-outlined text-[18px]">chevron_right</span>
          </button>
        </>
      )}

      {allImages.length === 0 ? (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 via-primary/10 to-slate-200 dark:from-primary/30 dark:to-slate-800">
          <span className="material-symbols-outlined text-5xl text-primary/50">landscape</span>
        </div>
      ) : (
        <div
          className={cn(
            'absolute inset-0 flex',
            isAnimating ? 'transition-transform duration-1000 ease-in-out' : 'transition-none'
          )}
          style={{ transform: `translateX(-${trackIndex * 100}%)` }}
          onTransitionEnd={() => {
            if (!hasCarousel) return

            const len = allImages.length
            if (trackIndex === 0) {
              setIsAnimating(false)
              setTrackIndex(len)
              return
            }
            if (trackIndex === len + 1) {
              setIsAnimating(false)
              setTrackIndex(1)
              return
            }

            setIsAnimating(false)
          }}
          aria-label={
            hasCarousel ? `${title} image ${activeIndex + 1} of ${allImages.length}` : title
          }
        >
          {slides.map((src, idx) => (
            <div
              key={`${src}-${idx}`}
              className="h-full w-full shrink-0 bg-cover bg-center"
              style={{ backgroundImage: `url('${src}')` }}
              role="img"
              aria-hidden={hasCarousel ? idx !== trackIndex : undefined}
            />
          ))}
        </div>
      )}

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />

      <div className="absolute bottom-3 left-3 right-3 z-10 flex items-end justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white drop-shadow-sm">{title}</p>
          <p className="truncate text-[11px] text-white/80">{agency.name}</p>
        </div>
        <p className="shrink-0 text-2xl font-extrabold leading-none text-white drop-shadow-md">
          {duration}
          <span className="ml-0.5 text-xs font-semibold">d</span>
        </p>
      </div>

      {hasCarousel && (
        <div className="absolute bottom-14 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5">
          {allImages.slice(0, 6).map((_, idx) => (
            <button
              key={idx}
              type="button"
              aria-label={`Go to image ${idx + 1}`}
              className={cn(
                'h-1.5 rounded-full transition-all',
                idx === activeIndex ? 'w-5 bg-white' : 'w-1.5 bg-white/55 hover:bg-white/80'
              )}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setIsAnimating(true)
                setTrackIndex(idx + 1)
              }}
            />
          ))}
        </div>
      )}
    </div>
  )

  const detailsBlock = (
    <div className="mt-4 flex flex-1 flex-col gap-3">
      <div>
        <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-primary">
          {agency.name}
          {agency.verified && (
            <span className="material-symbols-outlined ml-1 align-middle text-[14px]">verified</span>
          )}
        </p>
        <h3 className="text-lg font-bold leading-snug text-slate-900 dark:text-white">{title}</h3>
      </div>

      <ul className="divide-y divide-slate-100 dark:divide-slate-800/90">
        <li className="flex items-center justify-between gap-3 py-2.5 text-sm">
          <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
            <span className="material-symbols-outlined text-[18px] text-primary">calendar_month</span>
            Dates
          </span>
          <span className="text-right font-medium text-slate-800 dark:text-slate-200">
            {startDate} – {endDate}
          </span>
        </li>
        <li className="flex items-center justify-between gap-3 py-2.5 text-sm">
          <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
            <span className="material-symbols-outlined text-[18px] text-primary">schedule</span>
            Duration
          </span>
          <span className="font-medium text-slate-800 dark:text-slate-200">{duration} days</span>
        </li>
        {destination && (
          <li className="flex items-center justify-between gap-3 py-2.5 text-sm">
            <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
              <span className="material-symbols-outlined text-[18px] text-primary">explore</span>
              Destination
            </span>
            <span className="max-w-[55%] truncate text-right font-medium text-slate-800 dark:text-slate-200">
              {destination}
            </span>
          </li>
        )}
      </ul>

      <div className="mt-auto flex items-center justify-between gap-3 pt-1">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-500">
            From
          </p>
          <p className="text-xl font-extrabold text-slate-900 dark:text-white">{formatPrice(price)}</p>
        </div>
        <Button
          variant="primary"
          size="sm"
          className="rounded-full px-5 py-2.5 shadow-[0_0_20px_rgba(19,127,236,0.35)] group-hover:shadow-[0_0_28px_rgba(19,127,236,0.5)]"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          View trip
        </Button>
      </div>
    </div>
  )

  const content = (
    <>
      {imageBlock}
      {detailsBlock}
    </>
  )

  if (onSelectTrip) {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={() => onSelectTrip(tripSlug)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onSelectTrip(tripSlug)
          }
        }}
        className={cn(cardShellClass, 'cursor-pointer', className)}
      >
        {content}
      </div>
    )
  }

  return (
    <Link href={`/trips/${tripSlug}`} className={cn(cardShellClass, className)}>
      {content}
    </Link>
  )
}

export const TripCard = memo(TripCardInner)
