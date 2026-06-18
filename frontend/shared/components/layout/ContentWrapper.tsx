'use client'

import { usePathname } from 'next/navigation'
import { cn } from '@/shared/utils/cn'

interface ContentWrapperProps {
  children: React.ReactNode
  className?: string
}

/**
 * Full-bleed page shell (background + min height), with optional centered content width.
 * Home page stays full-bleed without max-width constraint.
 */
export function ContentWrapper({ children, className }: ContentWrapperProps) {
  const pathname = usePathname()
  const isHome = pathname === '/'

  return (
    <div
      className={cn(
        'min-h-screen flex w-full flex-col bg-background-light text-slate-900 dark:bg-background-dark dark:text-white',
        className
      )}
    >
      <div className={cn('flex w-full flex-1 flex-col', !isHome && 'content-container')}>
        {children}
      </div>
    </div>
  )
}
