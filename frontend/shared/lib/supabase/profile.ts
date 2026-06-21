'use client'

import { createBrowserSupabaseClient } from '@/shared/lib/supabase/client'
import type { UserDTO } from '@/types/api/auth.types'
import type { User } from '@/types/entities/user.entity'

export function userDtoToEntity(dto: UserDTO): User {
  const ts = dto.createdAt?.trim() ? dto.createdAt : new Date().toISOString()
  return {
    id: dto.id,
    email: dto.email,
    fullName: dto.fullName,
    role: dto.role,
    city: dto.city,
    avatar: dto.avatar,
    createdAt: ts,
    updatedAt: ts,
  }
}

export async function fetchUserDTO(userId: string): Promise<UserDTO> {
  const sb = createBrowserSupabaseClient()
  const {
    data: { session },
  } = await sb.auth.getSession()

  const headers: Record<string, string> = {}
  if (session?.access_token) {
    headers.Authorization = `Bearer ${session.access_token}`
  }

  const res = await fetch('/api/auth/me', { headers, cache: 'no-store' })
  const body = (await res.json().catch(() => ({}))) as UserDTO & { error?: string }

  if (!res.ok) {
    throw new Error(
      body.error ??
        'No profile row in public.users for this account. Run `npm run seed:demo` from frontend/.'
    )
  }

  if (body.id !== userId) {
    throw new Error('Profile session mismatch.')
  }

  return body
}
