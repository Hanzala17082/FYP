'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Header } from '@/shared/components/layout'
import { RoundedBox, SectionHeader } from '@/shared/components/ui'
import { AdminHeaderActions } from '@/shared/components/admin/AdminHeaderActions'
import { adminService } from '@/services/admin.service'
import { ROUTES } from '@/config/constants'
import type { UserDTO } from '@/types/api/auth.types'

const ROLE_STYLES: Record<string, string> = {
  Admin: 'bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300',
  Agency: 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300',
  Traveler: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400',
}

export default function AdminUsersClient() {
  const [users, setUsers] = useState<UserDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    adminService
      .getAllUsers()
      .then((res) => setUsers(res.users))
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load users.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen">
      <Header
        title="All Users"
        subtitle="Tripster Admin"
        variant="light"
        showThemeToggle={false}
        rightAction={<AdminHeaderActions />}
      />

      <main className="flex flex-col w-full max-w-5xl mx-auto p-5 md:p-8 space-y-6">
        <SectionHeader
          title="Platform users"
          subtitle={loading ? 'Loading…' : `${users.length} user(s) registered`}
        />

        {error && (
          <RoundedBox padding="md" className="border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10">
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </RoundedBox>
        )}

        <RoundedBox padding="none" className="overflow-hidden">
          {loading ? (
            <p className="text-sm text-slate-500 dark:text-slate-400 py-8 text-center">Loading users…</p>
          ) : users.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400 py-8 text-center">No users found.</p>
          ) : (
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 shrink-0 rounded-none bg-primary/10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary">person</span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 dark:text-white truncate">{user.fullName}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                      {user.city && (
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{user.city}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 sm:ml-0 ml-[52px]">
                    <span
                      className={`px-3 py-1 rounded-none text-xs font-semibold ${ROLE_STYLES[user.role] ?? ROLE_STYLES.Traveler}`}
                    >
                      {user.role}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      Joined {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </RoundedBox>

        <Link
          href={ROUTES.DASHBOARD.ADMIN}
          className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-blue-600 dark:hover:text-blue-400"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          Back to dashboard
        </Link>
      </main>
    </div>
  )
}
