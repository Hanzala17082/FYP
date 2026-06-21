import type { AgencyDTO } from '@/types/api/trips.types'

async function parseJson<T>(res: Response): Promise<T> {
  const body = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(typeof body.error === 'string' ? body.error : 'Request failed.')
  }
  return body as T
}

export const agencyProfileService = {
  /**
   * Update the logged-in agency's bio/description (and optionally location).
   * The server rejects bios that contain phone numbers (HTTP 400).
   */
  updateProfile: async (data: { description?: string; location?: string }): Promise<AgencyDTO> => {
    const res = await fetch('/api/agency/profile', {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const body = await parseJson<{ data: AgencyDTO }>(res)
    return body.data
  },
}
