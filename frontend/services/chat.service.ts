import { createBrowserSupabaseClient } from '@/shared/lib/supabase/client'
import { ok } from '@/shared/lib/supabase/response'
import type {
  ChatGroupDTO,
  ChatGroupListResponseDTO,
  ChatMessageDTO,
  ChatMessageListResponseDTO,
  UpdateChatPolicyRequestDTO,
} from '@/types/api/chat.types'
import type { ApiResponse } from '@/types/api/common.type'

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api').replace(/\/$/, '')
const WS_BASE = (process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000').replace(/\/$/, '')

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
  const body = (await res.json().catch(() => ({}))) as { data?: T; message?: string; success?: boolean }
  if (!res.ok) {
    throw new Error(body.message || `Request failed (${res.status}).`)
  }
  return body.data as T
}

export type ChatSocketHandlers = {
  onMessage: (message: ChatMessageDTO) => void
  onOpen?: () => void
  onClose?: () => void
  onError?: () => void
}

export const chatService = {
  getGroups: async (): Promise<ApiResponse<ChatGroupListResponseDTO>> => {
    const data = await apiFetch<ChatGroupListResponseDTO>('/chat/groups')
    return ok(data)
  },

  getMessages: async (groupId: string, cursor?: string): Promise<ApiResponse<ChatMessageListResponseDTO>> => {
    const qs = new URLSearchParams()
    if (cursor) qs.set('cursor', cursor)
    const suffix = qs.toString() ? `?${qs.toString()}` : ''
    const data = await apiFetch<ChatMessageListResponseDTO>(`/chat/groups/${groupId}/messages${suffix}`)
    return ok(data)
  },

  updatePolicy: async (
    groupId: string,
    payload: UpdateChatPolicyRequestDTO
  ): Promise<ApiResponse<ChatGroupDTO>> => {
    const data = await apiFetch<ChatGroupDTO>(`/chat/groups/${groupId}/policy`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
    return ok(data)
  },

  syncBooking: async (bookingId: string): Promise<ApiResponse<{ ok: boolean }>> => {
    const data = await apiFetch<{ ok: boolean }>(`/chat/sync-booking/${bookingId}`, { method: 'POST' })
    return ok(data)
  },

  createChatSocket: async (groupId: string, handlers: ChatSocketHandlers): Promise<WebSocket> => {
    const sb = createBrowserSupabaseClient()
    let {
      data: { session },
    } = await sb.auth.getSession()

    if (!session?.access_token) {
      const refreshed = await sb.auth.refreshSession()
      session = refreshed.data.session
    }

    if (!session?.access_token) throw new Error('Authentication required.')

    const ws = new WebSocket(`${WS_BASE}/ws/chat/${groupId}/?token=${encodeURIComponent(session.access_token)}`)
    ws.onopen = () => handlers.onOpen?.()
    ws.onclose = () => handlers.onClose?.()
    ws.onerror = () => handlers.onError?.()
    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(String(event.data)) as { type?: string; message?: ChatMessageDTO }
        if (payload.type === 'message' && payload.message) {
          handlers.onMessage(payload.message)
        }
      } catch {
        // ignore malformed frames
      }
    }
    return ws
  },

  sendMessage: (ws: WebSocket, body: string) => {
    if (ws.readyState !== WebSocket.OPEN) return
    ws.send(JSON.stringify({ type: 'message', body }))
  },
}
