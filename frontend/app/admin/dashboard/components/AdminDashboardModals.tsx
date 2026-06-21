'use client'

import { memo } from 'react'
import Link from 'next/link'
import { Avatar, RoundedBox, Button } from '@/shared/components/ui'
import { ROUTES } from '@/config/constants'
import type { AdminAgencySummary } from '@/services/dashboard.service'

export const DetailModal = memo(function DetailModal({
  isOpen,
  onClose,
  title,
  children,
}: {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}) {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-none shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 sm:px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-white">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-none transition-colors"
            aria-label="Close"
          >
            <span className="material-symbols-outlined text-slate-600 dark:text-slate-400">close</span>
          </button>
        </div>
        <div className="p-4 sm:p-6">{children}</div>
      </div>
    </div>
  )
})

type AgencyRow = {
  id: string
  name: string
  email: string
  status: string
  verificationStatus: string
  trips: number
  joined: string
  rating: number
  reviewCount: number
  avatar?: string
}

export const AgencyModalList = memo(function AgencyModalList({
  agencies,
  filter,
  variant = 'default',
}: {
  agencies: AgencyRow[]
  filter?: 'Verified' | 'Basic'
  variant?: 'default' | 'verified' | 'basic'
}) {
  const list = filter
    ? agencies.filter((a) =>
        filter === 'Basic'
          ? a.status === 'Basic' && a.verificationStatus !== 'pending_approval'
          : a.status === filter
      )
    : agencies

  if (list.length === 0) {
    return <p className="text-sm text-slate-500 dark:text-slate-400 py-4 text-center">No agencies found.</p>
  }

  return (
    <div className="space-y-2">
      {list.map((agency) => (
        <Link
          key={agency.id}
          href={`/admin/agencies/${agency.id}`}
          className={
            variant === 'verified'
              ? 'flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-none border border-emerald-200 dark:border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-500/5 hover:bg-emerald-100/50 dark:hover:bg-emerald-500/10 transition-colors'
              : variant === 'basic'
                ? 'flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-none border border-amber-200 dark:border-amber-500/20 bg-amber-50/50 dark:bg-amber-500/5 hover:bg-amber-100/50 dark:hover:bg-amber-500/10 transition-colors'
                : 'flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-none border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors'
          }
        >
          <div className="flex items-center gap-4 min-w-0">
            <Avatar src={agency.avatar} name={agency.name} size="md" />
            <div className="min-w-0">
              <p className="font-semibold text-slate-900 dark:text-white truncate">{agency.name}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{agency.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="material-symbols-outlined text-amber-400 text-sm">star</span>
                <span className="text-xs text-slate-600 dark:text-slate-400">
                  {agency.rating.toFixed(1)} ({agency.reviewCount} reviews)
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0 pl-14 sm:pl-0">
            <div className="text-left sm:text-right">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{agency.trips} trips</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Joined {agency.joined}</p>
            </div>
            <span
              className={`px-3 py-1 rounded-none text-sm font-semibold ${
                agency.status === 'Verified'
                  ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400'
                  : 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400'
              }`}
            >
              {agency.status}
            </span>
          </div>
        </Link>
      ))}
    </div>
  )
})

export const PendingVerificationList = memo(function PendingVerificationList({
  agencies,
  busyId,
  onReview,
}: {
  agencies: AgencyRow[]
  busyId: string | null
  onReview: (agencyId: string, action: 'approve' | 'reject') => void
}) {
  const list = agencies.filter((a) => a.verificationStatus === 'pending_approval')

  if (list.length === 0) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400 py-4 text-center">
        No agencies are waiting for verification approval.
      </p>
    )
  }

  return (
    <div className="space-y-2">
      {list.map((agency) => (
        <div
          key={agency.id}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-none border border-blue-200 dark:border-blue-500/20 bg-blue-50/50 dark:bg-blue-500/5"
        >
          <div className="flex items-center gap-4 min-w-0">
            <Avatar src={agency.avatar} name={agency.name} size="md" />
            <div className="min-w-0">
              <p className="font-semibold text-slate-900 dark:text-white truncate">{agency.name}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{agency.email}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Joined {agency.joined}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 pl-14 sm:pl-0">
            <Button
              variant="primary"
              size="sm"
              disabled={busyId === agency.id}
              onClick={() => onReview(agency.id, 'approve')}
            >
              {busyId === agency.id ? '…' : 'Approve'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={busyId === agency.id}
              onClick={() => onReview(agency.id, 'reject')}
            >
              Reject
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
})

export function mapAgencySummary(a: AdminAgencySummary) {
  return {
    id: a.id,
    name: a.name,
    email: a.email,
    status: a.verified ? 'Verified' : 'Basic',
    verificationStatus: a.verificationStatus ?? 'none',
    trips: a.tripCount ?? 0,
    joined: a.joinedAt ? new Date(a.joinedAt).toLocaleDateString() : '',
    rating: a.rating ?? 0,
    reviewCount: a.reviewCount ?? 0,
    avatar: a.avatar,
  }
}
