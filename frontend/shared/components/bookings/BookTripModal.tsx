'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { RoundedBox, Button, Input, AlertBox } from '@/shared/components/ui'
import { BookingSuccessFlipCard } from './BookingSuccessFlipCard'
import { bookingsService } from '@/services/bookings.service'
import { walletService } from '@/services/wallet.service'
import { useAuth } from '@/shared/contexts/AuthContext'
import { useCurrency } from '@/shared/contexts/CurrencyContext'
import { getErrorMessage } from '@/shared/utils/error-message'
import { ROUTES, USER_ROLES } from '@/config/constants'
import type { TripDTO } from '@/types/api/trips.types'

interface BookTripModalProps {
  isOpen: boolean
  trip: TripDTO
  onClose: () => void
}

interface BookingCelebration {
  totalAmount: number
  travelers: number
}

function formatDate(value: string | null | undefined): string {
  if (!value) return ''
  try {
    const d = new Date(value)
    return isNaN(d.getTime()) ? value : d.toLocaleDateString()
  } catch {
    return value
  }
}

export function BookTripModal({ isOpen, trip, onClose }: BookTripModalProps) {
  const router = useRouter()
  const { user } = useAuth()
  const { formatPrice } = useCurrency()
  const [numberOfTravelers, setNumberOfTravelers] = useState(1)
  const [specialRequests, setSpecialRequests] = useState('')
  const [balance, setBalance] = useState<number | null>(null)
  const [loadingWallet, setLoadingWallet] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [celebration, setCelebration] = useState<BookingCelebration | null>(null)

  const isTraveler = user?.role === USER_ROLES.TRAVELER

  const totalAmount = useMemo(() => trip.price * numberOfTravelers, [trip.price, numberOfTravelers])
  const canAfford = balance == null ? true : balance >= totalAmount

  useEffect(() => {
    if (!isOpen) {
      setCelebration(null)
      setNumberOfTravelers(1)
      setSpecialRequests('')
      setError('')
      return
    }

    let cancelled = false
    setLoadingWallet(true)
    setError('')
    walletService
      .getWallet()
      .then((data) => {
        if (!cancelled) setBalance(data.balance)
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(getErrorMessage(err, 'Failed to load wallet.'))
      })
      .finally(() => {
        if (!cancelled) setLoadingWallet(false)
      })
    return () => {
      cancelled = true
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleContinueAfterSuccess = () => {
    onClose()
    router.push(`${ROUTES.DASHBOARD.TRAVELER}?tab=myTrips`)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canAfford) {
      setError('Insufficient wallet balance. Add demo funds from your Wallet tab or reduce travelers.')
      return
    }

    setSubmitting(true)
    setError('')
    try {
      await bookingsService.createBookingWithWallet({
        tripId: trip.id,
        startDate: trip.startDate,
        endDate: trip.endDate,
        numberOfTravelers,
        specialRequests: specialRequests.trim() || undefined,
      })

      if (isTraveler) {
        setCelebration({ totalAmount, travelers: numberOfTravelers })
        return
      }

      onClose()
      router.push(`${ROUTES.DASHBOARD.TRAVELER}?tab=myTrips`)
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to book trip.'))
    } finally {
      setSubmitting(false)
    }
  }

  const dateLabel = `${formatDate(trip.startDate)} – ${formatDate(trip.endDate)}`

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-sm"
      onClick={celebration ? undefined : onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby={celebration ? 'booking-success-title' : 'book-trip-title'}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-[24px] bg-background-light shadow-2xl ring-1 ring-slate-200/70 dark:bg-[#141820] dark:ring-slate-600"
        onClick={(e) => e.stopPropagation()}
      >
        {celebration && isTraveler ? (
          <div className="p-6">
            <BookingSuccessFlipCard
              tripTitle={trip.title}
              destination={trip.destination}
              amountLabel={formatPrice(celebration.totalAmount)}
              dateLabel={dateLabel}
              travelers={celebration.travelers}
              onContinue={handleContinueAfterSuccess}
            />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 p-6">
            <div>
              <h2 id="book-trip-title" className="text-xl font-bold text-slate-900 dark:text-white">
                Book Trip
              </h2>
              <p className="mt-1 text-sm font-medium text-slate-700 dark:text-slate-400">{trip.title}</p>
            </div>

            <RoundedBox
              padding="md"
              className="space-y-2.5 border border-slate-200/80 bg-white text-sm shadow-sm dark:border-slate-700 dark:bg-slate-900/40"
            >
              <div className="flex justify-between gap-4">
                <span className="font-medium text-slate-700 dark:text-slate-400">Dates</span>
                <span className="text-right font-semibold text-slate-900 dark:text-white">{dateLabel}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="font-medium text-slate-700 dark:text-slate-400">Price per traveler</span>
                <span className="font-semibold text-slate-900 dark:text-white">{formatPrice(trip.price)}</span>
              </div>
              <div className="flex justify-between gap-4 border-t border-slate-200 pt-2 dark:border-slate-700">
                <span className="font-bold text-slate-900 dark:text-white">Total</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatPrice(totalAmount)}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="font-medium text-slate-700 dark:text-slate-400">Wallet balance</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {loadingWallet ? '…' : balance != null ? formatPrice(balance) : '—'}
                </span>
              </div>
            </RoundedBox>

            {!canAfford && !loadingWallet && (
              <AlertBox
                variant="error"
                title="Insufficient balance"
                message="You need more funds in your wallet to complete this booking."
              />
            )}

            <Input
              label="Number of travelers"
              type="number"
              min={1}
              max={20}
              value={String(numberOfTravelers)}
              onChange={(e) => setNumberOfTravelers(Math.max(1, Number(e.target.value) || 1))}
              required
            />

            <div>
              <label
                htmlFor="book-trip-special-requests"
                className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400"
              >
                Special requests (optional)
              </label>
              <textarea
                id="book-trip-special-requests"
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                rows={3}
                className="w-full rounded-none border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30 dark:border-slate-600 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500"
                placeholder="Dietary needs, accessibility, etc."
              />
            </div>

            {error && <AlertBox variant="error" title="Booking failed" message={error} />}

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={submitting}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                className="flex-1"
                disabled={submitting || loadingWallet || !canAfford}
              >
                {submitting ? 'Booking…' : `Pay ${formatPrice(totalAmount)}`}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
