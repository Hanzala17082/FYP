import { Metadata } from 'next'
import ResetPasswordClient from './ResetPasswordClient'
import { generateMetadata } from '@/shared/utils/seo'

export const metadata: Metadata = generateMetadata({
  title: 'Reset Password - Tripster',
  description: 'Set a new password for your Tripster account',
})

export default function ResetPasswordPage() {
  return <ResetPasswordClient />
}
