import { Metadata } from 'next'
import AgenciesClient from './AgenciesClient'
import { generateMetadata } from '@/shared/utils/seo'

export const metadata: Metadata = generateMetadata({
  title: 'Travel Agencies - Tripster',
  description: 'Browse verified travel agencies and their offerings',
})

export default function AgenciesPage() {
  return <AgenciesClient />
}
