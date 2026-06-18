import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { CookieOptions } from '@supabase/ssr'
import { getSupabaseAnonKey, getSupabaseUrl } from '@/shared/lib/supabase/env'

type PendingCookie = { name: string; value: string; options: CookieOptions }

export function sanitizeNextPath(next: string | null, fallback = '/reset-password'): string {
  if (!next || !next.startsWith('/') || next.startsWith('//')) return fallback
  return next
}

export async function createRouteHandlerSupabaseClient() {
  const cookieStore = await cookies()
  const pendingCookies: PendingCookie[] = []

  const supabase = createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          pendingCookies.push({ name, value, options })
          try {
            cookieStore.set(name, value, options)
          } catch {
            // Route handlers attach cookies via redirectWithCookies when needed.
          }
        })
      },
    },
  })

  return { supabase, pendingCookies }
}

export function redirectWithCookies(url: string, pendingCookies: PendingCookie[]) {
  const response = NextResponse.redirect(url)
  pendingCookies.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options)
  })
  return response
}

export function linkExpiredRedirect(origin: string) {
  return NextResponse.redirect(`${origin}/forgot-password?error=link_expired`)
}
