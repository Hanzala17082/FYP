import type { UserDTO } from '@/types/api/auth.types'

async function parseJson<T>(res: Response): Promise<T> {
  const body = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(typeof body.error === 'string' ? body.error : 'Request failed.')
  }
  return body as T
}

export const profileService = {
  uploadAvatar: async (file: File): Promise<{ avatarUrl: string; user: UserDTO }> => {
    const form = new FormData()
    form.append('file', file)
    const res = await fetch('/api/profile/avatar', {
      method: 'POST',
      credentials: 'include',
      body: form,
    })
    const body = await parseJson<{ data: { avatarUrl: string; user: UserDTO } }>(res)
    return body.data
  },

  updateProfile: async (data: { fullName?: string; city?: string }): Promise<UserDTO> => {
    const res = await fetch('/api/profile', {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const body = await parseJson<{ data: UserDTO }>(res)
    return body.data
  },
}
