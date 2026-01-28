import { cn } from '@/shared/utils/cn'
import { RoundedBox } from './RoundedBox'
import { IconButton } from './IconButton'

interface PastTripItemProps {
  image: string
  imageAlt?: string
  title: string
  dates: string
  onViewReceipt?: () => void
  className?: string
}

export function PastTripItem({
  image,
  imageAlt,
  title,
  dates,
  onViewReceipt,
  className,
}: PastTripItemProps) {
  return (
    <RoundedBox
      variant="default"
      padding="md"
      className={cn('flex items-center gap-4', className)}
    >
      <div
        className="size-12 rounded-lg bg-cover bg-center shrink-0"
        style={{ backgroundImage: `url('${image}')` }}
        role="img"
        aria-label={imageAlt || title}
      />
      <div className="flex flex-1 flex-col">
        <p className="font-bold text-slate-900 dark:text-white text-sm">{title}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">{dates}</p>
      </div>
      {onViewReceipt && (
        <IconButton
          icon={<span className="material-symbols-outlined">receipt_long</span>}
          variant="ghost"
          size="sm"
          onClick={onViewReceipt}
          className="bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600"
        />
      )}
    </RoundedBox>
  )
}
