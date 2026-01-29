'use client'

import { usePathname } from 'next/navigation'
import { cn } from '@/shared/utils/cn'

interface ContentWrapperProps {
  children: React.ReactNode
  className?: string
}

/**
 * Wraps page content so that on large screens and laptops it is constrained
 * to max-w-content (72rem) and centered. Home page stays full-bleed.
 */
export function ContentWrapper({ children, className }: ContentWrapperProps) {
  const pathname = usePathname()
  const isHome = pathname === '/'

  return (
    <div
      className={cn(
        'min-h-screen flex flex-col w-full',
        !isHome && 'content-container',
        className
      )}
    >
      {children}
    </div>
  )
}
