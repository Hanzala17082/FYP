import { Metadata } from 'next'
import ForgotPasswordClient from './ForgotPasswordClient'
import { generateMetadata } from '@/shared/utils/seo'

export const metadata: Metadata = generateMetadata({
  title: 'Forgot Password - Tripster',
  description: 'Reset your password to regain access to your Tripster account',
})

export default function ForgotPasswordPage() {
  return <ForgotPasswordClient />
}
