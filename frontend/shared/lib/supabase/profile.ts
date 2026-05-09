'use client'

import { createBrowserSupabaseClient } from '@/shared/lib/supabase/client'
import { mapUserRow } from '@/shared/lib/supabase/mappers'
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
  const { data, error } = await sb.from('users').select('*').eq('id', userId).maybeSingle()
  if (error) throw error
  if (!data) {
    throw new Error(
      'No profile row in public.users for this account. Sync Supabase Auth users with public.users (see README).'
    )
  }
  return mapUserRow(data as Record<string, unknown>)
}
