'use client'

import { useState } from 'react'
import { useAuth } from '@/shared/contexts/AuthContext'
import { Avatar } from '@/shared/components/ui/Avatar'
import { cn } from '@/shared/utils/cn'
import { logger } from '@/shared/utils/logger'

interface LogoutButtonProps {
  variant?: 'default' | 'ghost' | 'icon'
  className?: string
  showText?: boolean
}

export function LogoutButton({ variant = 'icon', className, showText = false }: LogoutButtonProps) {
  const { logout, user } = useAuth()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)

  const handleLogout = async () => {
    if (isLoggingOut) return
    
    setIsLoggingOut(true)
    try {
      // Small delay for better UX
      await new Promise((resolve) => setTimeout(resolve, 300))
      await logout()
    } catch (error) {
      logger.error('Logout error:', error)
      setIsLoggingOut(false)
    }
  }

  if (variant === 'icon') {
    return (
      <div className="relative">
        <button
          onClick={handleLogout}
          onMouseEnter={() => user && setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          disabled={isLoggingOut}
          className={cn(
            'relative flex items-center justify-center rounded-none transition-colors',
            'size-10 text-[24px]',
            'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700',
            'text-slate-700 dark:text-white',
            'hover:bg-red-50 dark:hover:bg-red-500/10',
            'hover:text-red-600 dark:hover:text-red-400',
            'hover:border-red-200 dark:hover:border-red-500/30',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            className
          )}
          title="Logout"
        >
          <span className="material-symbols-outlined">logout</span>
        </button>

        {/* User Info Tooltip */}
        {showTooltip && user && (
          <div
            className="absolute right-0 top-full mt-2 z-50 w-64 p-4 rounded-none shadow-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 animate-in fade-in slide-in-from-top-2 duration-200"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            <div className="flex items-center gap-3 mb-3 pb-3 border-b border-slate-200 dark:border-slate-700">
              <Avatar src={user.avatar} name={user.fullName} size="md" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">
                  {user.fullName}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-slate-400 dark:text-slate-500 text-sm">
                  badge
                </span>
                <span className="text-xs text-slate-600 dark:text-slate-400">
                  Role: <span className="font-semibold text-slate-900 dark:text-white">{user.role}</span>
                </span>
              </div>
              {user.city && (
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-slate-400 dark:text-slate-500 text-sm">
                    location_on
                  </span>
                  <span className="text-xs text-slate-600 dark:text-slate-400">{user.city}</span>
                </div>
              )}
            </div>
            <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-none text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[18px]">logout</span>
                <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <button
      onClick={handleLogout}
      disabled={isLoggingOut}
      className={cn(
        'flex items-center gap-2 px-4 py-2 rounded-none font-semibold text-sm transition-all duration-200',
        'text-slate-700 dark:text-white',
        'hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variant === 'ghost' && 'bg-transparent',
        variant === 'default' && 'bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700',
        className
      )}
    >
      <span className="material-symbols-outlined text-[20px]">logout</span>
      {showText && <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>}
      {!showText && user && (
        <span className="hidden sm:inline">{user.fullName.split(' ')[0]}</span>
      )}
    </button>
  )
}
