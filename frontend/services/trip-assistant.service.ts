import type { TripAssistantResponseDTO, TripAssistantTurn } from '@/types/api/assistant.types'

async function parseJson<T>(res: Response): Promise<T> {
  const body = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(typeof body.error === 'string' ? body.error : 'Request failed.')
  }
  return body as T
}

export const tripAssistantService = {
  /**
   * Ask the RAG trip assistant a question. `history` is the recent conversation
   * (last few turns) used for context.
   */
  ask: async (message: string, history: TripAssistantTurn[] = []): Promise<TripAssistantResponseDTO> => {
    const res = await fetch('/api/trip-assistant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history }),
    })
    const body = await parseJson<{ data: TripAssistantResponseDTO }>(res)
    return body.data
  },
}
