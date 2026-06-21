'use client'

import { useEffect, useState } from 'react'
import { Avatar, RoundedBox } from '@/shared/components/ui'
import { moderationService } from '@/services/moderation.service'
import { getErrorMessage } from '@/shared/utils/error-message'
import type { ModerationCategory, ModerationFlagDTO } from '@/types/api/moderation.types'

const CATEGORY_LABELS: Record<ModerationCategory, string> = {
  adult: 'Adult / 18+',
  hate: 'Hate speech',
  harassment: 'Harassment',
  violence: 'Violence',
}

const CATEGORY_STYLES: Record<ModerationCategory, string> = {
  adult: 'bg-pink-100 dark:bg-pink-500/20 text-pink-700 dark:text-pink-300',
  hate: 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300',
  harassment: 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300',
  violence: 'bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-300',
}

function formatTimeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

interface ModerationFlagListProps {
  /** When true, shows the agency column (platform admin view). */
  showAgency?: boolean
}

export function ModerationFlagList({ showAgency = true }: ModerationFlagListProps) {
  const [flags, setFlags] = useState<ModerationFlagDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    moderationService
      .getFlags()
      .then((res) => {
        if (!cancelled) setFlags(res.data?.flags ?? [])
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(getErrorMessage(err, 'Failed to load moderation flags.'))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (loading) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">Loading moderation flags…</p>
  }

  if (error) {
    return (
      <RoundedBox padding="lg" className="text-sm text-red-600 dark:text-red-400">
        {error}
      </RoundedBox>
    )
  }

  if (flags.length === 0) {
    return (
      <RoundedBox padding="lg" className="text-center py-10">
        <span className="material-symbols-outlined text-4xl text-emerald-500">verified_user</span>
        <p className="text-slate-600 dark:text-slate-400 mt-2">No flagged messages. All clear.</p>
        <p className="text-slate-500 dark:text-slate-500 text-sm mt-1">
          Messages with adult, hate, or harassment content are blocked and listed here.
        </p>
      </RoundedBox>
    )
  }

  return (
    <div className="space-y-3">
      {flags.map((flag) => {
        const cats = Object.keys(flag.categories) as ModerationCategory[]
        return (
          <RoundedBox key={flag.id} padding="lg" className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <Avatar src={flag.sender.avatarUrl} name={flag.sender.fullName} size="md" />
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900 dark:text-white truncate">
                    {flag.sender.fullName}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    in {flag.groupTitle}
                    {showAgency && flag.agencyName ? ` • ${flag.agencyName}` : ''}
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs text-slate-500 dark:text-slate-400">{formatTimeAgo(flag.createdAt)}</p>
                <span className="inline-block mt-1 px-2 py-0.5 rounded-none text-xs font-semibold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                  blocked
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {cats.map((cat) => (
                <span
                  key={cat}
                  className={`px-2 py-0.5 rounded-none text-xs font-semibold ${
                    CATEGORY_STYLES[cat] ?? 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {CATEGORY_LABELS[cat] ?? cat}
                  {typeof flag.categories[cat] === 'number' ? ` ${Math.round((flag.categories[cat] as number) * 100)}%` : ''}
                </span>
              ))}
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 border-l-4 border-red-400 dark:border-red-500/50 px-3 py-2">
              <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap break-words">
                {flag.messageExcerpt}
              </p>
            </div>
          </RoundedBox>
        )
      })}
    </div>
  )
}
