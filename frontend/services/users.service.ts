import { createBrowserSupabaseClient } from '@/shared/lib/supabase/client'
import { formatSupabaseError } from '@/shared/lib/supabase/format-error'
import { ok } from '@/shared/lib/supabase/response'
import { mapUserRow } from '@/shared/lib/supabase/mappers'
import type { UserDTO } from '@/types/api/auth.types'
import type { ApiResponse } from '@/types/api/common.type'

export interface UserDetailDTO extends UserDTO {
  travelerProfile?: { cnic?: string }
}

export const usersService = {
  getUserById: async (id: string): Promise<ApiResponse<UserDetailDTO>> => {
    const sb = createBrowserSupabaseClient()

    const { data: userRow, error: uErr } = await sb.from('users').select('*').eq('id', id).maybeSingle()
    if (uErr) throw new Error(formatSupabaseError(uErr))
    if (!userRow) throw new Error('User not found.')

    const base = mapUserRow(userRow as Record<string, unknown>)
    let travelerProfile: { cnic?: string } | undefined

    const { data: tp } = await sb.from('traveler_profiles').select('cnic').eq('user_id', id).maybeSingle()
    if (tp && typeof tp === 'object' && 'cnic' in tp && tp.cnic) {
      travelerProfile = { cnic: String(tp.cnic) }
    }

    return ok({ ...base, travelerProfile })
  },
}
