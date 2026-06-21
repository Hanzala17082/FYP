import { createBrowserSupabaseClient } from '@/shared/lib/supabase/client'
import { ok } from '@/shared/lib/supabase/response'
import type { ModerationFlagListResponseDTO } from '@/types/api/moderation.types'
import type { ApiResponse } from '@/types/api/common.type'

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api').replace(/\/$/, '')

async function authHeaders(): Promise<HeadersInit> {
  const sb = createBrowserSupabaseClient()
  let {
    data: { session },
  } = await sb.auth.getSession()

  if (!session?.access_token) {
    const refreshed = await sb.auth.refreshSession()
    session = refreshed.data.session
  }

  if (!session?.access_token) throw new Error('Authentication required.')
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${session.access_token}`,
  }
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = await authHeaders()
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { ...headers, ...(init?.headers ?? {}) },
  })
  const body = (await res.json().catch(() => ({}))) as { data?: T; message?: string }
  if (!res.ok) {
    throw new Error(body.message || `Request failed (${res.status}).`)
  }
  return body.data as T
}

export const moderationService = {
  /**
   * List moderation flags. Platform admins see all; agencies see only flags in
   * their own trip chat groups (enforced server-side by role).
   */
  getFlags: async (status?: 'pending' | 'reviewed'): Promise<ApiResponse<ModerationFlagListResponseDTO>> => {
    const qs = status ? `?status=${status}` : ''
    const data = await apiFetch<ModerationFlagListResponseDTO>(`/chat/moderation/flags${qs}`)
    return ok(data)
  },
}
