import type { BookingDTO } from '@/types/api/bookings.types'
import { sendEmail } from '@/shared/lib/email/resend'
import {
  buildBookingConfirmationEmail,
  type BookingConfirmationEmailData,
} from '@/shared/lib/email/templates/booking-confirmation'

export async function sendBookingConfirmationEmail(params: {
  booking: BookingDTO
  travelerEmail: string
  totalAmount: number
  newBalance: number
  siteOrigin: string
}): Promise<{ sent: boolean; skippedReason?: string }> {
  const { booking, travelerEmail, totalAmount, newBalance, siteOrigin } = params
  const trip = booking.trip

  if (!travelerEmail?.trim()) {
    return { sent: false, skippedReason: 'Traveler email missing' }
  }

  const emailData: BookingConfirmationEmailData = {
    travelerName: booking.traveler?.fullName || 'Traveler',
    bookingId: booking.id,
    tripTitle: trip?.title || 'Your trip',
    tripSlug: trip?.slug || '',
    destination: trip?.destination || '—',
    agencyName: trip?.agency?.name || '—',
    startDate: booking.startDate,
    endDate: booking.endDate,
    numberOfTravelers: booking.numberOfTravelers,
    totalAmount,
    newBalance,
    specialRequests: booking.specialRequests,
    status: booking.status,
    siteOrigin,
  }

  if (!emailData.tripSlug) {
    return { sent: false, skippedReason: 'Trip slug missing' }
  }

  const { subject, html, text } = buildBookingConfirmationEmail(emailData)
  return sendEmail({ to: travelerEmail.trim(), subject, html, text })
}
