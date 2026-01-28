import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
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
  images?: string[]
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
  images,
  badge,
  className,
}: TripCardProps) {
  // Safety check for agency
  if (!agency) {
    console.warn('TripCard: agency is missing for trip', id)
    return null
  }

  const allImages = useMemo(() => {
    const arr = (images || []).filter(Boolean)
    if (arr.length > 0) return arr
    return image ? [image] : []
  }, [images, image])

  const hasCarousel = allImages.length > 1

  // We use a "track index" with clones for smooth infinite sliding:
  // slides = [last, ...images, first]
  // start at 1 (the first real slide)
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
    // Reset when images change
    if (!hasCarousel) {
      setTrackIndex(0)
      setIsAnimating(false)
      return
    }

    setTrackIndex(1)
    setIsAnimating(false)
  }, [hasCarousel, allImages.length])

  // Slower autoplay
  useEffect(() => {
    if (!hasCarousel) return
    if (isPaused) return

    const interval = setInterval(() => {
      setIsAnimating(true)
      setTrackIndex((i) => i + 1)
    }, 6500)

    return () => clearInterval(interval)
  }, [hasCarousel, isPaused])

  const activeIndex = useMemo(() => {
    if (!hasCarousel) return 0
    // trackIndex: 1..len maps to 0..len-1
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

  return (
    <Link
      href={`/trips/${id}`}
      className={cn(
        'group flex flex-col overflow-hidden rounded-2xl bg-white dark:bg-card-dark shadow-xl border border-slate-200 dark:border-border-dark hover:border-primary/50 transition-all',
        className
      )}
    >
      <div
        className="relative h-52 w-full overflow-hidden"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {badge && (
          <div className="absolute top-3 left-3 z-10">
            <StatusBadge status={badge.status} size="sm" />
          </div>
        )}

        {/* Carousel controls */}
        {hasCarousel && (
          <>
            <button
              type="button"
              aria-label="Previous image"
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 grid place-items-center w-9 h-9 rounded-full bg-black/35 hover:bg-black/50 text-white backdrop-blur-sm transition-colors"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                goPrev()
              }}
            >
              <span className="material-symbols-outlined text-[20px]">chevron_left</span>
            </button>
            <button
              type="button"
              aria-label="Next image"
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 grid place-items-center w-9 h-9 rounded-full bg-black/35 hover:bg-black/50 text-white backdrop-blur-sm transition-colors"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                goNext()
              }}
            >
              <span className="material-symbols-outlined text-[20px]">chevron_right</span>
            </button>
          </>
        )}

        {/* Sliding track */}
        <div
          className={cn(
            'absolute inset-0 flex',
            isAnimating ? 'transition-transform duration-1000 ease-in-out' : 'transition-none'
          )}
          style={{ transform: `translateX(-${trackIndex * 100}%)` }}
          onTransitionEnd={() => {
            if (!hasCarousel) return

            const len = allImages.length
            // Jump (without animation) when landing on clones
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
        <div className="absolute inset-0 bg-gradient-to-t from-white/60 dark:from-card-dark/60 to-transparent"></div>

        {/* Dots */}
        {hasCarousel && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5">
            {allImages.slice(0, 6).map((_, idx) => (
              <button
                key={idx}
                type="button"
                aria-label={`Go to image ${idx + 1}`}
                className={cn(
                  'h-1.5 rounded-full transition-all',
                  idx === activeIndex ? 'w-6 bg-white' : 'w-1.5 bg-white/60 hover:bg-white/80'
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
