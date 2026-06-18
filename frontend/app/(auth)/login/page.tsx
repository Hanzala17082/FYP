import { Metadata } from 'next'
import { Suspense } from 'react'
import LoginClient from './LoginClient'
import { generateMetadata } from '@/shared/utils/seo'

export const metadata: Metadata = generateMetadata({
  title: 'Log In - Tripster',
  description: 'Sign in to your Tripster account',
})

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginClient />
    </Suspense>
  )
}
