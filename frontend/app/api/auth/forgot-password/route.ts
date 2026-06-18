import { NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/shared/lib/supabase/admin'
import { formatSupabaseError } from '@/shared/lib/supabase/format-error'

function getRedirectOrigin(request: Request): string {
  const envOrigin = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (envOrigin) return envOrigin.replace(/\/$/, '')
  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host')
  const proto = request.headers.get('x-forwarded-proto') ?? 'http'
  if (host) return `${proto}://${host}`
  return 'http://localhost:3000'
}

/** Dev-only: generate a clickable recovery link for on-screen testing. */
export async function POST(request: Request) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'This endpoint is only available in development.' },
      { status: 403 }
    )
  }

  try {
    const body = await request.json()
    const email = String(body.email ?? '').trim().toLowerCase()

    if (!email) {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 })
    }

    const origin = getRedirectOrigin(request)
    const redirectTo = `${origin}/auth/confirm?next=/reset-password`

    let admin
    try {
      admin = createAdminSupabaseClient()
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Admin client unavailable.'
      return NextResponse.json({ error: message }, { status: 500 })
    }

    const { data, error } = await admin.auth.admin.generateLink({
      type: 'recovery',
      email,
      options: { redirectTo },
    })

    if (error) {
      const code = (error as { code?: string }).code
      if (code === 'user_not_found') {
        return NextResponse.json({ ok: true })
      }
      return NextResponse.json({ error: formatSupabaseError(error) }, { status: 400 })
    }

    const resetLink = data.properties?.action_link
    if (!resetLink) {
      return NextResponse.json({ error: 'Could not generate reset link.' }, { status: 500 })
    }

    return NextResponse.json({ ok: true, resetLink })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Could not process password reset.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
