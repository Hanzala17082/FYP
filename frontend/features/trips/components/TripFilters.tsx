'use client'

import { useState, useEffect, useRef, useCallback, useMemo, memo } from 'react'
import type { TripFiltersDTO, AgencyDTO } from '@/types/api/trips.types'
import { agenciesService } from '@/services/agencies.service'
import { cn } from '@/shared/utils/cn'

const DURATION_OPTIONS = [
  { value: '', label: 'Any duration' },
  { value: '2', label: '2 days' },
  { value: '3', label: '3 days' },
  { value: '4', label: '4 days' },
  { value: '5', label: '5 days' },
  { value: '7', label: '7+ days' },
]

const SORT_OPTIONS: { value: TripFiltersDTO['sortBy']; order: 'asc' | 'desc'; label: string }[] = [
  { value: 'date', order: 'desc', label: 'Date (newest first)' },
  { value: 'date', order: 'asc', label: 'Date (oldest first)' },
  { value: 'price', order: 'asc', label: 'Price (low first)' },
  { value: 'price', order: 'desc', label: 'Price (high first)' },
  { value: 'rating', order: 'desc', label: 'Rating (highest first)' },
  { value: 'rating', order: 'asc', label: 'Rating (lowest first)' },
  { value: 'popularity', order: 'desc', label: 'Popularity' },
]

export interface TripFiltersState extends TripFiltersDTO {
  startDate?: string
  endDate?: string
  minPrice?: number
  maxPrice?: number
  duration?: number
  agencyId?: string
  sortBy?: TripFiltersDTO['sortBy']
  sortOrder?: 'asc' | 'desc'
}

type OpenFilter = 'dates' | 'price' | 'duration' | 'agency' | 'sort' | null

interface TripFiltersProps {
  filters: TripFiltersState
  onFiltersChange: (f: TripFiltersState) => void
}

const INPUT_CLASS =
  'w-full rounded-xl border border-slate-200/80 dark:border-slate-500/50 bg-white dark:bg-slate-700/80 px-4 py-2.5 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-400 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all'
const LABEL_CLASS =
  'block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2'
const CHIP_BASE =
  'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200 cursor-pointer shrink-0 ' +
  'border-slate-200/80 dark:border-slate-500/50 bg-white/80 dark:bg-slate-700/80 text-slate-600 dark:text-slate-300 ' +
  'hover:border-primary/40 hover:bg-primary/5 dark:hover:bg-primary/10 hover:text-primary dark:hover:text-sky-300 hover:shadow-sm'
const CHIP_ACTIVE =
  'border-primary bg-primary/10 dark:bg-primary/20 text-primary dark:text-sky-300 shadow-sm ring-1 ring-primary/20 dark:ring-primary/30'
const DROPDOWN_PANEL_CLASS =
  'absolute left-0 right-0 mt-3 rounded-2xl overflow-hidden z-40 min-w-[300px] ' +
  'bg-white dark:bg-slate-800/98 shadow-2xl shadow-slate-300/30 dark:shadow-slate-950/60 ' +
  'ring-1 ring-slate-200/80 dark:ring-slate-600/80 ' +
  'border-t-4 border-t-primary'

function TripFiltersInner({ filters, onFiltersChange }: TripFiltersProps) {
  const [agencies, setAgencies] = useState<AgencyDTO[]>([])
  const [openFilter, setOpenFilter] = useState<OpenFilter>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    agenciesService
      .getAgencies({ limit: 50 })
      .then((res) => {
        if (res?.data?.agencies) setAgencies(res.data.agencies)
      })
      .catch(() => {})
  }, [])

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
      setOpenFilter(null)
    }
  }, [])

  useEffect(() => {
    if (openFilter == null) return
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [openFilter, handleClickOutside])

  const update = useCallback(
    (patch: Partial<TripFiltersState>) => {
      onFiltersChange({ ...filters, ...patch })
    },
    [filters, onFiltersChange]
  )

  const clearAll = useCallback(() => {
    onFiltersChange({
      startDate: undefined,
      endDate: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      duration: undefined,
      agencyId: undefined,
      sortBy: 'date',
      sortOrder: 'desc',
    })
    setOpenFilter(null)
  }, [onFiltersChange])

  const toggle = useCallback((key: OpenFilter) => {
    setOpenFilter((prev) => (prev === key ? null : key))
  }, [])

  const hasActiveFilters = useMemo(
    () =>
      !!(filters.startDate ||
        filters.endDate ||
        filters.minPrice != null ||
        filters.maxPrice != null ||
        filters.duration != null ||
        filters.agencyId),
    [
      filters.startDate,
      filters.endDate,
      filters.minPrice,
      filters.maxPrice,
      filters.duration,
      filters.agencyId,
    ]
  )

  const sortValue = useMemo(
    () => `${filters.sortBy ?? 'date'}-${filters.sortOrder ?? 'desc'}`,
    [filters.sortBy, filters.sortOrder]
  )
  const sortLabel = useMemo(
    () => SORT_OPTIONS.find((o) => `${o.value}-${o.order}` === sortValue)?.label ?? 'Sort',
    [sortValue]
  )
  const durationLabel = useMemo(
    () =>
      DURATION_OPTIONS.find(
        (o) => o.value === (filters.duration != null ? String(filters.duration) : '')
      )?.label ?? 'Duration',
    [filters.duration]
  )
  const agencyLabel = useMemo(
    () =>
      filters.agencyId
        ? agencies.find((a) => a.id === filters.agencyId)?.name ?? 'Agency'
        : 'Agency',
    [filters.agencyId, agencies]
  )
  const datesLabel = useMemo(
    () =>
      filters.startDate || filters.endDate
        ? [filters.startDate, filters.endDate].filter(Boolean).join(' – ')
        : 'Dates',
    [filters.startDate, filters.endDate]
  )
  const priceLabel = useMemo(
    () =>
      filters.minPrice != null || filters.maxPrice != null
        ? `${filters.minPrice ?? '0'} – ${filters.maxPrice ?? 'Any'}`
        : 'Price',
    [filters.minPrice, filters.maxPrice]
  )

  return (
    <div ref={containerRef} className="space-y-0 relative z-30">
      <div className="rounded-2xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm p-3 shadow-soft dark:shadow-none ring-1 ring-slate-200/60 dark:ring-slate-600/60">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => toggle('dates')}
            className={cn(CHIP_BASE, openFilter === 'dates' && CHIP_ACTIVE)}
            aria-expanded={openFilter === 'dates'}
          >
            <span className="material-symbols-outlined text-[18px]">calendar_month</span>
            <span>{datesLabel}</span>
            <span
              className={cn(
                'material-symbols-outlined text-[16px] transition-transform',
                openFilter === 'dates' && 'rotate-180'
              )}
            >
              expand_more
            </span>
          </button>

          <button
            type="button"
            onClick={() => toggle('price')}
            className={cn(CHIP_BASE, openFilter === 'price' && CHIP_ACTIVE)}
            aria-expanded={openFilter === 'price'}
          >
            <span className="material-symbols-outlined text-[18px]">attach_money</span>
            <span>{priceLabel}</span>
            <span
              className={cn(
                'material-symbols-outlined text-[16px] transition-transform',
                openFilter === 'price' && 'rotate-180'
              )}
            >
              expand_more
            </span>
          </button>

          <button
            type="button"
            onClick={() => toggle('duration')}
            className={cn(CHIP_BASE, openFilter === 'duration' && CHIP_ACTIVE)}
            aria-expanded={openFilter === 'duration'}
          >
            <span className="material-symbols-outlined text-[18px]">schedule</span>
            <span>{durationLabel}</span>
            <span
              className={cn(
                'material-symbols-outlined text-[16px] transition-transform',
                openFilter === 'duration' && 'rotate-180'
              )}
            >
              expand_more
            </span>
          </button>

          <button
            type="button"
            onClick={() => toggle('agency')}
            className={cn(CHIP_BASE, openFilter === 'agency' && CHIP_ACTIVE)}
            aria-expanded={openFilter === 'agency'}
          >
            <span className="material-symbols-outlined text-[18px]">business</span>
            <span className="max-w-[120px] truncate">{agencyLabel}</span>
            <span
              className={cn(
                'material-symbols-outlined text-[16px] transition-transform shrink-0',
                openFilter === 'agency' && 'rotate-180'
              )}
            >
              expand_more
            </span>
          </button>

          <button
            type="button"
            onClick={() => toggle('sort')}
            className={cn(CHIP_BASE, openFilter === 'sort' && CHIP_ACTIVE)}
            aria-expanded={openFilter === 'sort'}
          >
            <span className="material-symbols-outlined text-[18px]">sort</span>
            <span className="max-w-[140px] truncate">{sortLabel}</span>
            <span
              className={cn(
                'material-symbols-outlined text-[16px] transition-transform',
                openFilter === 'sort' && 'rotate-180'
              )}
            >
              expand_more
            </span>
          </button>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                clearAll()
              }}
              className="ml-1 px-4 py-2 rounded-full text-sm font-medium text-primary hover:bg-primary/10 dark:hover:bg-primary/20 cursor-pointer shrink-0 transition-colors"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Dropdown panel */}
        {openFilter && (
          <div
            className={DROPDOWN_PANEL_CLASS}
            role="dialog"
            aria-label={`${openFilter} filter`}
          >
            <div className="p-5 pb-4 bg-slate-50/50 dark:bg-slate-900/40">
            {openFilter === 'dates' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={LABEL_CLASS}>
                    <span className="material-symbols-outlined align-middle text-[14px] mr-1">
                      calendar_month
                    </span>
                    Start date
                  </label>
                  <input
                    type="date"
                    value={filters.startDate ?? ''}
                    onChange={(e) => update({ startDate: e.target.value || undefined })}
                    className={INPUT_CLASS}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS}>
                    <span className="material-symbols-outlined align-middle text-[14px] mr-1">event</span>
                    End date
                  </label>
                  <input
                    type="date"
                    value={filters.endDate ?? ''}
                    onChange={(e) => update({ endDate: e.target.value || undefined })}
                    className={INPUT_CLASS}
                  />
                </div>
              </div>
            )}

            {openFilter === 'price' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={LABEL_CLASS}>
                    <span className="material-symbols-outlined align-middle text-[14px] mr-1">
                      attach_money
                    </span>
                    Min price ($)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={50}
                    placeholder="0"
                    value={filters.minPrice ?? ''}
                    onChange={(e) =>
                      update({ minPrice: e.target.value === '' ? undefined : Number(e.target.value) })
                    }
                    className={INPUT_CLASS}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS}>Max price ($)</label>
                  <input
                    type="number"
                    min={0}
                    step={50}
                    placeholder="Any"
                    value={filters.maxPrice ?? ''}
                    onChange={(e) =>
                      update({ maxPrice: e.target.value === '' ? undefined : Number(e.target.value) })
                    }
                    className={INPUT_CLASS}
                  />
                </div>
              </div>
            )}

            {openFilter === 'duration' && (
              <div>
                <label className={LABEL_CLASS}>
                  <span className="material-symbols-outlined align-middle text-[14px] mr-1">schedule</span>
                  Duration
                </label>
                <select
                  value={filters.duration != null ? String(filters.duration) : ''}
                  onChange={(e) => {
                    const v = e.target.value
                    update({ duration: v === '' ? undefined : Number(v) })
                  }}
                  className={cn(INPUT_CLASS, 'cursor-pointer')}
                >
                  {DURATION_OPTIONS.map((opt) => (
                    <option key={opt.value || 'any'} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {openFilter === 'agency' && (
              <div>
                <label className={LABEL_CLASS}>
                  <span className="material-symbols-outlined align-middle text-[14px] mr-1">business</span>
                  Agency
                </label>
                <select
                  value={filters.agencyId ?? ''}
                  onChange={(e) => update({ agencyId: e.target.value || undefined })}
                  className={cn(INPUT_CLASS, 'cursor-pointer')}
                >
                  <option value="">All agencies</option>
                  {agencies.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {openFilter === 'sort' && (
              <div>
                <label className={LABEL_CLASS}>
                  <span className="material-symbols-outlined align-middle text-[14px] mr-1">sort</span>
                  Sort by
                </label>
                <select
                  value={sortValue}
                  onChange={(e) => {
                    const v = (e.target as HTMLSelectElement).value
                    const opt = SORT_OPTIONS.find((o) => `${o.value}-${o.order}` === v)
                    if (opt) update({ sortBy: opt.value, sortOrder: opt.order })
                  }}
                  className={cn(INPUT_CLASS, 'cursor-pointer')}
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={`${opt.value}-${opt.order}`} value={`${opt.value}-${opt.order}`}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export const TripFilters = memo(TripFiltersInner)
