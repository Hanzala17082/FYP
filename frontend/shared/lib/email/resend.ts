import { logger } from '@/shared/utils/logger'

export interface SendEmailOptions {
  to: string
  subject: string
  html: string
  text: string
}

export interface SendEmailResult {
  sent: boolean
  id?: string
  skippedReason?: string
}

export async function sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim()
  const from = process.env.RESEND_FROM_EMAIL?.trim() || 'Tripster <onboarding@resend.dev>'

  if (!apiKey) {
    if (process.env.NODE_ENV === 'development') {
      logger.info('[email] RESEND_API_KEY not set — booking email preview:')
      logger.info(`  To: ${options.to}`)
      logger.info(`  Subject: ${options.subject}`)
      logger.info(options.text)
    }
    return { sent: false, skippedReason: 'RESEND_API_KEY not configured' }
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [options.to],
      subject: options.subject,
      html: options.html,
      text: options.text,
    }),
  })

  const body = await res.json().catch(() => ({}))
  if (!res.ok) {
    const message =
      typeof (body as { message?: string }).message === 'string'
        ? (body as { message: string }).message
        : `Email API returned ${res.status}`
    throw new Error(message)
  }

  return { sent: true, id: (body as { id?: string }).id }
}
