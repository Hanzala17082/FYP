import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { isSupabaseConfigured, SUPABASE_ENV_HINT } from '@/shared/lib/supabase/env'
import { updateSession } from '@/shared/lib/supabase/middleware'
import { logger } from '@/shared/utils/logger'

/** Refresh Supabase Auth cookies on navigation (SSR pattern). */
export async function middleware(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    if (process.env.NODE_ENV === 'development') {
      logger.warn(`[REHNUM] Supabase env incomplete — skipping session refresh. ${SUPABASE_ENV_HINT}`)
      return NextResponse.next()
    }
    throw new Error(`Supabase is not configured for production. ${SUPABASE_ENV_HINT}`)
  }
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
