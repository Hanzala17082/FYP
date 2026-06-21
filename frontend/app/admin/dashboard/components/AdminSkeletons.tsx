'use client'

import { memo } from 'react'

export const StatSkeleton = memo(function StatSkeleton() {
  return (
    <div className="animate-pulse rounded-none border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 space-y-3">
      <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
      <div className="h-8 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
      <div className="h-3 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
    </div>
  )
})

export const ListRowSkeleton = memo(function ListRowSkeleton() {
  return (
    <div className="animate-pulse flex items-center gap-3 p-3 rounded-none bg-slate-50 dark:bg-slate-700/30">
      <div className="w-10 h-10 shrink-0 bg-slate-200 dark:bg-slate-600 rounded-none" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-3/5 bg-slate-200 dark:bg-slate-600 rounded" />
        <div className="h-3 w-2/5 bg-slate-200 dark:bg-slate-600 rounded" />
      </div>
    </div>
  )
})
