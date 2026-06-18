import { formatPkr } from '@/shared/utils/currency'

export interface BookingConfirmationEmailData {
  travelerName: string
  bookingId: string
  tripTitle: string
  tripSlug: string
  destination: string
  agencyName: string
  startDate: string
  endDate: string
  numberOfTravelers: number
  totalAmount: number
  newBalance: number
  specialRequests?: string
  status: string
  siteOrigin: string
}

function formatDate(value: string): string {
  if (!value) return '—'
  try {
    const d = new Date(value)
    return isNaN(d.getTime()) ? value : d.toLocaleDateString('en-PK', { dateStyle: 'medium' })
  } catch {
    return value
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function buildBookingConfirmationEmail(data: BookingConfirmationEmailData): {
  subject: string
  html: string
  text: string
} {
  const tripUrl = `${data.siteOrigin}/trips/${encodeURIComponent(data.tripSlug)}`
  const bookingsUrl = `${data.siteOrigin}/dashboard?tab=myTrips`
  const walletUrl = `${data.siteOrigin}/dashboard?tab=wallet`

  const subject = `Booking confirmed — ${data.tripTitle}`

  const rows: Array<[string, string]> = [
    ['Booking ID', data.bookingId.slice(0, 8).toUpperCase()],
    ['Trip', data.tripTitle],
    ['Destination', data.destination],
    ['Agency', data.agencyName],
    ['Travel dates', `${formatDate(data.startDate)} → ${formatDate(data.endDate)}`],
    ['Travelers', String(data.numberOfTravelers)],
    ['Amount paid', formatPkr(data.totalAmount)],
    ['Wallet balance', formatPkr(data.newBalance)],
    ['Status', data.status.charAt(0).toUpperCase() + data.status.slice(1)],
  ]

  if (data.specialRequests?.trim()) {
    rows.push(['Special requests', data.specialRequests.trim()])
  }

  const tableRowsHtml = rows
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:14px;width:140px;vertical-align:top;">${escapeHtml(label)}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;color:#0f172a;font-size:14px;font-weight:600;">${escapeHtml(value)}</td>
        </tr>`
    )
    .join('')

  const textRows = rows.map(([label, value]) => `${label}: ${value}`).join('\n')

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f1f5f9;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border:1px solid #e2e8f0;">
          <tr>
            <td style="background:#0ea5e9;padding:24px 28px;">
              <p style="margin:0;color:#e0f2fe;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">Tripster</p>
              <h1 style="margin:8px 0 0;color:#ffffff;font-size:24px;line-height:1.3;">Your booking is confirmed</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:28px;">
              <p style="margin:0 0 16px;color:#334155;font-size:16px;line-height:1.6;">
                Hi ${escapeHtml(data.travelerName || 'Traveler')},
              </p>
              <p style="margin:0 0 24px;color:#334155;font-size:16px;line-height:1.6;">
                Thank you for booking with Tripster. Your payment has been deducted from your wallet. The agency will review your request — once they accept, your trip will be confirmed.
              </p>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #e2e8f0;border-radius:0;margin-bottom:28px;">
                ${tableRowsHtml}
              </table>
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin-bottom:16px;">
                <tr>
                  <td style="padding-right:12px;">
                    <a href="${tripUrl}" style="display:inline-block;background:#0ea5e9;color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;padding:14px 24px;">
                      View trip details
                    </a>
                  </td>
                  <td>
                    <a href="${bookingsUrl}" style="display:inline-block;background:#ffffff;color:#0ea5e9;text-decoration:none;font-size:15px;font-weight:700;padding:13px 22px;border:2px solid #0ea5e9;">
                      My bookings
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 8px;color:#64748b;font-size:13px;line-height:1.5;">
                You can also check your wallet balance anytime:
                <a href="${walletUrl}" style="color:#0ea5e9;">Open wallet</a>
              </p>
              <p style="margin:24px 0 0;color:#94a3b8;font-size:12px;line-height:1.5;">
                If you did not make this booking, please contact support immediately.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 28px;background:#f8fafc;border-top:1px solid #e2e8f0;">
              <p style="margin:0;color:#94a3b8;font-size:12px;text-align:center;">
                © ${new Date().getFullYear()} Tripster · Travel Smarter
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

  const text = `Tripster — Booking confirmed

Hi ${data.travelerName || 'Traveler'},

Thank you for booking with Tripster. Your payment has been deducted from your wallet. The agency will review your request before confirming the trip.

${textRows}

View trip: ${tripUrl}
My bookings: ${bookingsUrl}
Wallet: ${walletUrl}

If you did not make this booking, please contact support immediately.`

  return { subject, html, text }
}
