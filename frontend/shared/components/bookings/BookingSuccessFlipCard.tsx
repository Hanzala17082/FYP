'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/shared/contexts/AuthContext'
import { Button } from '@/shared/components/ui'
import styles from './BookingSuccessFlipCard.module.css'

interface BookingSuccessFlipCardProps {
  tripTitle: string
  destination?: string
  amountLabel: string
  dateLabel: string
  travelers: number
  onContinue: () => void
}

/**
 * Wallet card flip celebration (uiverse.io/Praashoo7/black-lizard-62, MIT).
 */
export function BookingSuccessFlipCard({
  tripTitle,
  destination,
  amountLabel,
  dateLabel,
  travelers,
  onContinue,
}: BookingSuccessFlipCardProps) {
  const { user } = useAuth()
  const [flipped, setFlipped] = useState(false)

  useEffect(() => {
    const t1 = window.setTimeout(() => setFlipped(true), 450)
    return () => window.clearTimeout(t1)
  }, [])

  const holderName = (user?.fullName || user?.email?.split('@')[0] || 'Traveler').toUpperCase()
  const tripShort = tripTitle.length > 22 ? `${tripTitle.slice(0, 22)}…` : tripTitle

  return (
    <div className="flex flex-col items-center gap-6 rounded-[18px] bg-background-light px-4 py-2 text-center dark:bg-transparent">
      <div className={`${styles.flipCard} ${flipped ? styles.flipped : ''}`}>
        <div className={styles.flipCardInner}>
          <div className={`${styles.flipCardFront} relative p-5 text-left`}>
            <p className="text-[10px] font-bold tracking-[0.22em] text-white/75">TRIPSTER WALLET</p>

            <div className="absolute right-5 top-5 flex -space-x-2">
              <span className="inline-block h-7 w-7 rounded-full bg-red-500/90" />
              <span className="inline-block h-7 w-7 rounded-full bg-amber-400/90" />
            </div>

            <div className="mt-5 flex items-start justify-between gap-3">
              <span className="inline-grid h-8 w-10 place-items-center rounded bg-gradient-to-br from-amber-200/90 to-amber-500/80 text-[10px] font-black text-amber-950">
                PKR
              </span>
              <span className="material-symbols-outlined text-[28px] text-white/35">contactless</span>
            </div>

            <p className="mt-5 text-lg font-bold tracking-[0.12em] text-white">{amountLabel}</p>

            <div className="mt-3 flex items-end justify-between gap-2 text-[10px] uppercase tracking-wider">
              <div>
                <p className="text-white/45">Trip</p>
                <p className="max-w-[9rem] truncate font-semibold normal-case tracking-normal text-white">
                  {tripShort}
                </p>
              </div>
              <div className="text-right">
                <p className="text-white/45">Dates</p>
                <p className="font-semibold normal-case tracking-normal text-white">{dateLabel}</p>
              </div>
            </div>

            <p className="mt-auto pt-3 text-[11px] font-bold tracking-[0.14em] text-white/90">{holderName}</p>
            {destination && (
              <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-primary/90">
                {destination.split(',')[0]?.trim()}
              </p>
            )}
          </div>

          <div className={styles.flipCardBack}>
            <div className={styles.magneticStrip} />
            <div className={styles.stripRow}>
              <div className={`${styles.stripBlock} ${styles.stripBlockWide}`}>
                <span className={styles.stripCode}>PAID</span>
              </div>
              <div className={`${styles.stripBlock} ${styles.stripBlockNarrow}`}>
                <span className={styles.stripCode}>OK</span>
              </div>
            </div>

            <div className="flex flex-1 flex-col items-center justify-center px-4 pb-4">
              <span className="material-symbols-outlined text-[52px] text-emerald-400">verified</span>
              <p id="booking-success-title" className="mt-2 text-base font-extrabold tracking-wide text-white">
                Booking confirmed
              </p>
              <p className="mt-1 text-xs text-white/65">
                {travelers} traveler{travelers === 1 ? '' : 's'} · {amountLabel} debited
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-1">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">You&apos;re all set!</h2>
        <p className="max-w-sm text-sm text-slate-600 dark:text-slate-300">
          Payment received. The agency will review your booking request shortly.
        </p>
      </div>

      <Button variant="primary" size="lg" className="w-full max-w-xs rounded-full" onClick={onContinue}>
        View my trips
        <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
      </Button>
    </div>
  )
}
