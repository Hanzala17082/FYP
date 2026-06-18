import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/shared/utils/cn'

interface NavItem {
  href: string
  icon: string
  label: string
  badge?: number | boolean
}

interface BottomNavigationProps {
  items: NavItem[]
  variant?: 'default' | 'agency'
  className?: string
}

export function BottomNavigation({ items, variant = 'default', className }: BottomNavigationProps) {
  const pathname = usePathname()

  if (variant === 'agency') {
    return (
      <nav
        className={cn(
          'fixed bottom-0 left-0 right-0 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 z-50 pb-safe pt-2 px-6 h-[84px] md:hidden',
          className
        )}
      >
        <div className="flex items-start justify-between h-full">
          {items.map((item, index) => {
            const isActive = pathname === item.href
            const isCenter = index === 2

            if (isCenter) {
              return (
                <div key={item.href} className="relative -top-6">
                  <Link
                    href={item.href}
                    className="flex items-center justify-center w-14 h-14 rounded-none bg-primary shadow-lg shadow-sky-500/30 dark:shadow-sky-900/50 text-white hover:bg-blue-600 transition-colors ring-4 ring-white dark:ring-background-dark"
                  >
                    <span className="material-symbols-outlined text-[28px]">{item.icon}</span>
                  </Link>
                  <div className="absolute -bottom-5 w-full text-center">
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      {item.label}
                    </span>
                  </div>
                </div>
              )
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center gap-1 w-16 group"
              >
                <span
                  className={cn(
                    'material-symbols-outlined text-[26px] transition-colors',
                    isActive
                      ? 'text-primary'
                      : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                  )}
                >
                  {item.icon}
                </span>
                <span
                  className={cn(
                    'text-xs transition-colors',
                    isActive
                      ? 'font-bold text-primary'
                      : 'font-medium text-slate-500 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300'
                  )}
                >
                  {item.label}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>
    )
  }

  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50 bg-background-light/95 dark:bg-card-dark/95 backdrop-blur-md border-t border-slate-200 dark:border-border-dark md:hidden',
        className
      )}
    >
      <div className="grid grid-cols-4 h-16">
        {items.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 transition-colors',
                isActive
                  ? 'text-primary'
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
              )}
            >
              <div className="relative">
                <span
                  className={cn(
                    'material-symbols-outlined text-[24px]',
                    isActive && "style={{ fontVariationSettings: \"'FILL' 1\" }}"
                  )}
                >
                  {item.icon}
                </span>
                {item.badge && (
                  <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-red-500"></span>
                )}
              </div>
              <span className={cn('text-[10px]', isActive ? 'font-bold' : 'font-medium')}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
