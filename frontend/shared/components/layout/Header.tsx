'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { cn } from '@/shared/utils/cn'
import { Logo } from './Logo'
import { IconButton } from '../ui/IconButton'
import { ThemeToggle } from '../ui/ThemeToggle'

interface HeaderProps {
  title?: string
  subtitle?: string
  showLogo?: boolean
  variant?: 'light' | 'dark'
  /** When set, the title becomes a link (e.g. to home). */
  titleHref?: string
  leftAction?: ReactNode
  rightAction?: ReactNode
  showThemeToggle?: boolean
  className?: string
}

export function Header({
  title,
  subtitle,
  showLogo = false,
  variant = 'light',
  titleHref,
  leftAction,
  rightAction,
  showThemeToggle = true,
  className,
}: HeaderProps) {
  return (
    <header
      className={cn(
        'sticky top-0 z-20 backdrop-blur-md border-b',
        variant === 'light'
          ? 'bg-background-light/90 dark:bg-background-dark/90 border-slate-200 dark:border-slate-800'
          : 'bg-background-dark/95 border-border-dark',
        className
      )}
    >
      <div className="flex items-center px-5 py-4 justify-between">
        <div className="flex items-center gap-3">
          {leftAction}
          {showLogo ? (
            <Link href="/" className="focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg">
              <Logo variant={variant} />
            </Link>
          ) : (
            <div className="flex flex-col">
              {subtitle && (
                <span
                  className={cn(
                    'text-xs font-bold uppercase tracking-wider mb-1',
                    variant === 'light'
                      ? 'text-slate-500 dark:text-slate-400'
                      : 'text-slate-400'
                  )}
                >
                  {subtitle}
                </span>
              )}
              {title && (
                titleHref ? (
                  <Link href={titleHref}>
                    <h2
                      className={cn(
                        'text-2xl sm:text-3xl font-extrabold leading-tight tracking-tight flex items-center gap-1 hover:opacity-90 transition-opacity',
                        variant === 'light'
                          ? 'text-slate-900 dark:text-white'
                          : 'text-white'
                      )}
                    >
                      {title}
                      {variant === 'light' && <span className="text-primary">.</span>}
                    </h2>
                  </Link>
                ) : (
                  <h2
                    className={cn(
                      'text-2xl sm:text-3xl font-extrabold leading-tight tracking-tight flex items-center gap-1',
                      variant === 'light'
                        ? 'text-slate-900 dark:text-white'
                        : 'text-white'
                    )}
                  >
                    {title}
                    {variant === 'light' && <span className="text-primary">.</span>}
                  </h2>
                )
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {showThemeToggle && <ThemeToggle />}
          {rightAction || (
            <IconButton
              icon={<span className="material-symbols-outlined">notifications</span>}
              variant={variant === 'light' ? 'default' : 'ghost'}
              badge={true}
            />
          )}
        </div>
      </div>
    </header>
  )
}
