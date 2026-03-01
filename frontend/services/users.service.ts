import { apiClient } from '@/shared/lib/api-client'
import { UserDTO } from '@/types/api/auth.types'

export interface UserDetailDTO extends UserDTO {
  travelerProfile?: { cnic?: string }
}

export const usersService = {
  getUserById: async (id: string) => {
    const res = await apiClient.get<UserDetailDTO>(`/auth/users/${id}`)
    return res.data
  },
}
