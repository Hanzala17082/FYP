import { createBrowserSupabaseClient } from '@/shared/lib/supabase/client'
import type { UserDTO } from '@/types/api/auth.types'
import type { TripDTO } from '@/types/api/trips.types'
import type { AdminAgencySummary } from '@/services/dashboard.service'

export type AdminTripListItem = TripDTO & { bookingCount: number }

async function adminFetch<T>(path: string): Promise<T> {
  const sb = createBrowserSupabaseClient()
  const {
    data: { session },
  } = await sb.auth.getSession()
  if (!session?.access_token) throw new Error('Authentication required.')

  const res = await fetch(path, {
    headers: { Authorization: `Bearer ${session.access_token}` },
    cache: 'no-store',
  })
  const body = (await res.json().catch(() => ({}))) as T & { error?: string }
  if (!res.ok) throw new Error(body.error ?? 'Request failed.')
  return body
}

async function adminPatch<T>(path: string, payload: unknown): Promise<T> {
  const sb = createBrowserSupabaseClient()
  const {
    data: { session },
  } = await sb.auth.getSession()
  if (!session?.access_token) throw new Error('Authentication required.')

  const res = await fetch(path, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
  const body = (await res.json().catch(() => ({}))) as T & { error?: string }
  if (!res.ok) throw new Error(body.error ?? 'Request failed.')
  return body
}

export const adminService = {
  getAllUsers: async (): Promise<{ users: UserDTO[]; total: number }> => {
    return adminFetch('/api/admin/users')
  },

  getAllTrips: async (): Promise<{ trips: AdminTripListItem[]; total: number }> => {
    return adminFetch('/api/admin/trips')
  },

  getAgencies: async (): Promise<{ agencies: AdminAgencySummary[] }> => {
    return adminFetch('/api/admin/agencies')
  },

  reviewAgencyVerification: async (
    agencyId: string,
    action: 'approve' | 'reject'
  ): Promise<{ ok: boolean; action: string }> => {
    return adminPatch(`/api/admin/agencies/${agencyId}/verification`, { action })
  },
}
