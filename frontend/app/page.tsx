import { Metadata } from 'next'
import { generateMetadata } from '@/shared/utils/seo'
import HomeClient from './HomeClient'

export const metadata: Metadata = generateMetadata({
  title: 'Tripster - Discover Amazing Trips',
  description: 'Connect with verified travel agencies and discover your next adventure',
})

export default function HomePage() {
  return <HomeClient />
}
