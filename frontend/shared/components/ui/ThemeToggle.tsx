'use client'

import { useTheme } from '@/shared/contexts/ThemeContext'
import { IconButton } from './IconButton'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    // Return a placeholder during SSR to avoid hydration mismatch
    return (
      <IconButton
        icon={<span className="material-symbols-outlined">dark_mode</span>}
        variant="default"
        size="md"
        onClick={() => {}}
      />
    )
  }

  return (
    <IconButton
      icon={
        <span className="material-symbols-outlined">
          {theme === 'dark' ? 'light_mode' : 'dark_mode'}
        </span>
      }
      variant="default"
      size="md"
      onClick={toggleTheme}
    />
  )
}
