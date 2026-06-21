'use client'

import { memo } from 'react'

type RecentUserRowProps = {
  id: string
  name: string
  email: string
  joined: string
  status: string
}

export const RecentUserRow = memo(function RecentUserRow({
  name,
  email,
  joined,
  status,
}: RecentUserRowProps) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between p-3 rounded-none bg-slate-50 dark:bg-slate-700/30 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 shrink-0 rounded-none bg-primary/10 flex items-center justify-center">
          <span className="material-symbols-outlined text-primary">person</span>
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-slate-900 dark:text-white truncate">{name}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{email}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 sm:text-right pl-[52px] sm:pl-0">
        <p className="text-xs text-slate-500 dark:text-slate-400">{joined}</p>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-none text-xs font-semibold bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400">
          {status}
        </span>
      </div>
    </div>
  )
})

type RecentTripRowProps = {
  title: string
  agency: string
  price: string
  bookings: number
}

export const RecentTripRow = memo(function RecentTripRow({
  title,
  agency,
  price,
  bookings,
}: RecentTripRowProps) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between p-3 rounded-none bg-slate-50 dark:bg-slate-700/30 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 shrink-0 rounded-none bg-blue-500/10 flex items-center justify-center">
          <span className="material-symbols-outlined text-blue-500">flight_takeoff</span>
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-slate-900 dark:text-white truncate">{title}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{agency}</p>
        </div>
      </div>
      <div className="text-left sm:text-right pl-[52px] sm:pl-0">
        <p className="text-sm font-semibold text-slate-900 dark:text-white">{price}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">{bookings} bookings</p>
      </div>
    </div>
  )
})
