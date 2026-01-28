'use client'

import { Avatar } from '../ui/Avatar'
import { RoundedBox } from '../ui/RoundedBox'
import { cn } from '@/shared/utils/cn'

interface Review {
  id: string
  user: {
    name: string
    avatar?: string
  }
  rating: number
  comment: string
  date: string
  images?: string[]
}

interface TripReviewCardProps {
  review: Review
}

export function TripReviewCard({ review }: TripReviewCardProps) {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <span
        key={i}
        className={cn(
          'material-symbols-outlined text-sm',
          i < rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300 dark:text-slate-600'
        )}
      >
        star
      </span>
    ))
  }

  return (
    <RoundedBox padding="md" className="space-y-3">
      <div className="flex items-start gap-3">
        <Avatar src={review.user.avatar} name={review.user.name} size="md" />
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <p className="font-semibold text-slate-900 dark:text-white">{review.user.name}</p>
            <span className="text-xs text-slate-500 dark:text-slate-400">{review.date}</span>
          </div>
          <div className="flex items-center gap-1 mb-2">{renderStars(review.rating)}</div>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            {review.comment}
          </p>
          {review.images && review.images.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mt-3">
              {review.images.map((image, index) => (
                <div
                  key={index}
                  className="aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                >
                  <img
                    src={image}
                    alt={`Review image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </RoundedBox>
  )
}
