'use client'

export function TripFilters() {
  const filters = [
    { label: 'Dates', icon: 'calendar_month' },
    { label: 'Price Range', icon: 'attach_money' },
    { label: 'Duration', icon: 'schedule' },
    { label: 'Agency', icon: 'business' },
  ]

  return (
    <div className="flex gap-2 px-4 py-1 overflow-x-auto hide-scrollbar pb-3">
      {filters.map((filter) => (
        <button
          key={filter.label}
          className="flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-xl bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark px-4 active:scale-95 transition-all hover:bg-slate-50 dark:hover:bg-white/5"
        >
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{filter.label}</span>
          <span className="material-symbols-outlined text-[18px] text-slate-400">
            keyboard_arrow_down
          </span>
        </button>
      ))}
    </div>
  )
}
