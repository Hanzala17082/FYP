'use client'

import Link from 'next/link'
import { Avatar } from '../ui/Avatar'
import { RoundedBox } from '../ui/RoundedBox'
import { Button } from '../ui/Button'
import { cn } from '@/shared/utils/cn'

interface AgencyProfileCardProps {
  agency: {
    id: string
    name: string
    avatar: string
    verified: boolean
    city: string
    country: string
    rating: number
    reviewCount: number
    tripsCount: number
    description?: string
    specialties?: string[]
  }
  showFullDetails?: boolean
  onViewProfile?: () => void
}

export function AgencyProfileCard({ agency, showFullDetails = false, onViewProfile }: AgencyProfileCardProps) {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <span
        key={i}
        className={cn(
          'material-symbols-outlined text-sm',
          i < Math.floor(rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-300 dark:text-slate-600'
        )}
      >
        star
      </span>
    ))
  }

  return (
    <RoundedBox padding="lg" className="space-y-4">
      <div className="flex items-start gap-4">
        <Avatar src={agency.avatar} name={agency.name} size="lg" />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{agency.name}</h3>
            {agency.verified && (
              <span className="material-symbols-outlined text-primary text-lg">verified</span>
            )}
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
            {agency.city}, {agency.country}
          </p>
          <div className="flex items-center gap-4 mb-3">
            <div className="flex items-center gap-1">
              {renderStars(agency.rating)}
              <span className="text-sm font-semibold text-slate-900 dark:text-white ml-1">
                {agency.rating.toFixed(1)}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                ({agency.reviewCount} reviews)
              </span>
            </div>
          </div>
          {showFullDetails && agency.description && (
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 leading-relaxed">
              {agency.description}
            </p>
          )}
          {showFullDetails && agency.specialties && agency.specialties.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {agency.specialties.map((specialty, index) => (
                <span
                  key={index}
                  className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded-lg"
                >
                  {specialty}
                </span>
              ))}
            </div>
          )}
          <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">flight</span>
              <span>{agency.tripsCount} trips</span>
            </div>
          </div>
        </div>
      </div>
      {onViewProfile && (
        <Link href={`/agencies/${agency.id}`}>
          <Button variant="outline" size="sm" className="w-full">
            <span className="material-symbols-outlined text-[18px]">visibility</span>
            View Agency Profile
          </Button>
        </Link>
      )}
    </RoundedBox>
  )
}
