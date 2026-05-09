/** Normalize Axios-style errors and thrown Errors into a single message string. */

export function getErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === 'object') {
    const o = err as Record<string, unknown>
    const resp = o.response as Record<string, unknown> | undefined
    const data = resp?.data as Record<string, unknown> | string | undefined
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      const msg = data.message
      if (typeof msg === 'string' && msg.trim()) return msg
      const errors = data.errors as Record<string, string[]> | undefined
      if (errors && typeof errors === 'object') {
        const flat = Object.values(errors).flat().filter(Boolean)
        if (flat.length) return flat.join(' ')
      }
    }
    if (typeof o.message === 'string' && o.message.trim()) return o.message
  }
  if (err instanceof Error && err.message.trim()) return err.message
  return fallback
}
