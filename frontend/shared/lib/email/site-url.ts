export function getSiteOrigin(request?: Request): string {
  const envOrigin = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (envOrigin) return envOrigin.replace(/\/$/, '')
  if (request) {
    const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host')
    const proto = request.headers.get('x-forwarded-proto') ?? 'http'
    if (host) return `${proto}://${host}`
  }
  return 'http://localhost:3000'
}
