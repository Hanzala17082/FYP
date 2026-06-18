'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  CURRENCY_OPTIONS,
  getCurrencyOption,
  type CurrencyCode,
} from '@/shared/utils/currency-options'
import { cn } from '@/shared/utils/cn'

interface CurrencySelectProps {
  id?: string
  value: CurrencyCode
  onChange: (code: CurrencyCode) => void
  className?: string
}

function matchesCurrencyQuery(code: CurrencyCode, label: string, symbol: string, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return (
    code.toLowerCase().includes(q) ||
    label.toLowerCase().includes(q) ||
    symbol.toLowerCase().includes(q)
  )
}

export function CurrencySelect({ id, value, onChange, className }: CurrencySelectProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const selected = getCurrencyOption(value)

  const filtered = useMemo(
    () =>
      CURRENCY_OPTIONS.filter((opt) =>
        matchesCurrencyQuery(opt.code, opt.label, opt.symbol, search)
      ),
    [search]
  )

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (!open) {
      setSearch('')
      return
    }
    const timer = window.setTimeout(() => searchRef.current?.focus(), 0)
    return () => window.clearTimeout(timer)
  }, [open])

  const selectCurrency = (code: CurrencyCode) => {
    onChange(code)
    setOpen(false)
    setSearch('')
  }

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      <button
        id={id}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between gap-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm text-slate-900 dark:text-white text-left"
      >
        <span className="truncate">
          {selected.code} — {selected.label}
        </span>
        <span
          className={cn(
            'material-symbols-outlined text-[20px] text-slate-400 shrink-0 transition-transform',
            open && 'rotate-180'
          )}
        >
          expand_more
        </span>
      </button>

      {open && (
        <div className="absolute z-40 mt-1 w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg">
          <div className="border-b border-slate-200 dark:border-slate-700 p-2">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[18px] text-slate-400 pointer-events-none">
                search
              </span>
              <input
                ref={searchRef}
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search currency…"
                autoComplete="off"
                className="w-full min-w-0 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 py-2 pl-9 pr-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400"
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setOpen(false)
                  }
                  if (e.key === 'Enter' && filtered[0]) {
                    e.preventDefault()
                    selectCurrency(filtered[0].code)
                  }
                }}
              />
            </div>
          </div>

          <ul
            role="listbox"
            aria-label="Currency options"
            className="max-h-56 overflow-y-auto scrollbar-tripster py-1"
          >
            {filtered.length === 0 ? (
              <li className="px-3 py-2.5 text-sm text-slate-500 dark:text-slate-400">
                No currency matches &ldquo;{search.trim()}&rdquo;
              </li>
            ) : (
              filtered.map((opt) => {
                const isSelected = opt.code === value
                return (
                  <li key={opt.code}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      className={cn(
                        'w-full px-3 py-2.5 text-left text-sm transition-colors',
                        isSelected
                          ? 'bg-primary text-white'
                          : 'text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-white/10'
                      )}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => selectCurrency(opt.code)}
                    >
                      {opt.code} — {opt.label}
                    </button>
                  </li>
                )
              })
            )}
          </ul>
        </div>
      )}
    </div>
  )
}
